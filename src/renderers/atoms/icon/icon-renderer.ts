import { BaseComponentRenderer } from "./../../base-component-renderer";
import { log, hexToRgb } from "../../../main/utils/index";

/**
 * Icon Renderer - Inherits from BaseComponentRenderer  
 * Only overrides icon-specific functionality, inherits 90% from base
 */
export class IconRenderer extends BaseComponentRenderer {
  
  /**
   * OVERRIDE: Get variant grouping for icons (group by iconType)
   */
  protected getVariantGrouping(nodeData: any): { type: string, property?: string } {
    // Icons are always grouped by iconType
    return {
      type: 'byType',
      property: 'iconType'
    };
  }
  
  /**
   * OVERRIDE: Create vector icon structure
   */
  protected async createComponentStructure(finalData: any): Promise<SceneNode> {
    return this.createIconShape(finalData);
  }
  
  /**
   * Create icon shape based on JSON data
   */
  private createIconShape(iconData: any): SceneNode {
    const {
      shapeType,
      size,
      color,
      strokeWidth = 2,
      opacity = 1,
      rotation = 0,
      vectorPaths = [],
      cornerRadius = 0,
      strokeCap = 'BUTT',
      windingRule = 'NONZERO',
      useStroke = false
    } = iconData;

    // Validate required properties
    const issues = [];
    if (!shapeType) issues.push('shapeType');
    if (!size || size <= 0) issues.push('size');
    if (!color) issues.push('color');
    
    if (issues.length > 0) {
      log(`❌ Cannot create icon shape - missing: ${issues.join(', ')}`, 'error');
      // Fallback to rectangle
      const rect = figma.createRectangle();
      rect.resize(size || 20, size || 20);
      rect.fills = [{
        type: 'SOLID',
        color: hexToRgb(color || '#000000'),
        opacity: opacity || 1
      }];
      return rect;
    }
    
    log(`🎨 Creating icon shape: ${shapeType}, size: ${size}, color: ${color}, vectorPaths: ${vectorPaths?.length || 0}`, 'log');

    const iconColor = {
      type: 'SOLID' as const,
      color: hexToRgb(color),
      opacity: opacity
    };

    let iconShape: SceneNode;

    // Create shape based on shapeType from JSON
    switch (shapeType) {
      case 'vector':
        const vector = figma.createVector();
        if (vectorPaths && vectorPaths.length > 0) {
          // Scale normalized coordinates (0-1) to actual size
          const scaledPaths = vectorPaths.map((path: any) => {
            const scaledData = path.data.replace(/([+-]?\d*\.?\d+)/g, (match: string) => {
              const num = parseFloat(match);
              return (num * size).toString();
            });
            
            return {
              windingRule: path.windingRule || windingRule,
              data: scaledData
            };
          });
          
          vector.vectorPaths = scaledPaths;
        }
        
        vector.resize(size, size);
        
        if (useStroke) {
          vector.strokes = [iconColor];
          vector.strokeWeight = strokeWidth;
          vector.strokeCap = strokeCap as StrokeCap;
          vector.fills = [];
        } else {
          vector.fills = [iconColor];
          vector.strokes = [];
        }
        
        if (rotation !== 0) {
          vector.rotation = (rotation * Math.PI) / 180;
        }
        
        iconShape = vector;
        break;

      case 'rectangle':
        const rect = figma.createRectangle();
        rect.resize(size, size);
        rect.fills = [iconColor];
        
        if (cornerRadius > 0) {
          rect.cornerRadius = cornerRadius;
        }
        
        if (rotation !== 0) {
          rect.rotation = (rotation * Math.PI) / 180;
        }
        
        iconShape = rect;
        break;

      case 'ellipse':
        const ellipse = figma.createEllipse();
        ellipse.resize(size, size);
        ellipse.fills = [iconColor];
        
        if (rotation !== 0) {
          ellipse.rotation = (rotation * Math.PI) / 180;
        }
        
        iconShape = ellipse;
        break;

      default:
        log(`⚠️ Unknown shapeType: ${shapeType}, defaulting to rectangle`, 'log');
        const defaultRect = figma.createRectangle();
        defaultRect.resize(size, size);
        defaultRect.fills = [iconColor];
        iconShape = defaultRect;
        break;
    }

    return iconShape;
  }
  
  /**
   * OVERRIDE: Icon-specific variant naming (by iconType and size)
   */
  protected async createVariant(
    variantName: string,
    variantData: any,
    baseProperties: any
  ): Promise<ComponentNode> {
    const variant = figma.createComponent();
    const finalData = this.mergeWithParent(baseProperties, variantData);
    
    // Create icon structure  
    const iconShape = await this.createComponentStructure(finalData);
    
    if (iconShape) {
      const iconType = this.extractPropertyFromVariant(variantName, 'iconType');
      iconShape.name = iconType;
      variant.appendChild(iconShape);
      
      // Icon-specific variant naming
      const size = finalData.size || 'Medium';
      variant.name = `Size=${size}`;
    }
    
    return variant;
  }
  
  /**
   * OVERRIDE: Icons don't need complex component properties
   */
  protected async setupComponentProperties(
    componentSet: ComponentSetNode, 
    nodeData: any
  ): Promise<void> {
    // Icons typically don't have component properties
    // They're used as targets for INSTANCE_SWAP in other components
    log(`🎨 Icon ComponentSet ${nodeData.name} ready for INSTANCE_SWAP`, 'log');
  }
}

// Export function for design-system-renderer integration
export async function renderIconWithInheritance(
  nodeData: any,
  targetPage?: PageNode
): Promise<ComponentSetNode | ComponentSetNode[]> {
  const renderer = new IconRenderer();
  return await renderer.render(nodeData, targetPage);
}