import { hexToRgb, organizeVariantsInGrid, log } from "../../../main/utils/index";

function createIconShape(iconData: any): SceneNode | null {
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
    return null;
  }
  
  // Log shape creation details
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
        const scaledPaths = vectorPaths.map((path: any, index: number) => {
          const originalData = path.data;
          const scaledData = path.data.replace(/([+-]?\d*\.?\d+)/g, (match: string) => {
            const num = parseFloat(match);
            return (num * size).toString();
          });
          
          log(`🔧 Scaling vectorPath[${index}]: size=${size}, original="${originalData.substring(0, 50)}...", scaled="${scaledData.substring(0, 50)}..."`, 'log');
          
          return {
            windingRule: path.windingRule || windingRule,
            data: scaledData
          };
        });
        
        vector.vectorPaths = scaledPaths;
        vector.resize(size, size);
        log(`✅ Vector created with ${scaledPaths.length} paths, size: ${size}x${size}`, 'log');
      } else {
        log('❌ Vector shape requires vectorPaths but none provided', 'error');
        return null;
      }
      
      if (useStroke) {
        vector.strokes = [iconColor];
        vector.strokeWeight = strokeWidth;
        vector.strokeCap = strokeCap;
        vector.fills = [];
      } else {
        vector.fills = [iconColor];
      }
      iconShape = vector;
      break;

    case 'ellipse':
      const ellipse = figma.createEllipse();
      ellipse.resize(size, size);
      if (useStroke) {
        ellipse.strokes = [iconColor];
        ellipse.strokeWeight = strokeWidth;
        ellipse.fills = [];
      } else {
        ellipse.fills = [iconColor];
      }
      iconShape = ellipse;
      break;

    case 'polygon':
      const polygon = figma.createPolygon();
      polygon.resize(size, size);
      polygon.fills = [iconColor];
      iconShape = polygon;
      break;

    case 'rectangle':
    default:
      const rect = figma.createRectangle();
      rect.resize(size, size);
      if (cornerRadius > 0) {
        rect.cornerRadius = cornerRadius * size; // Scale corner radius with size
      }
      if (useStroke) {
        rect.strokes = [iconColor];
        rect.strokeWeight = strokeWidth;
        rect.fills = [];
      } else {
        rect.fills = [iconColor];
      }
      iconShape = rect;
      break;
  }

  // Apply rotation if specified
  if (rotation !== 0) {
    iconShape.rotation = (rotation * Math.PI) / 180;
  }

  return iconShape;
}

function mergeWithParent(baseProperties: any, variant: any): any {
  if (!variant.getFromParent) {
    return variant;
  }
  
  // Start with base properties, then override with variant properties
  const merged = { ...baseProperties };
  
  // Override any properties that are explicitly set in the variant
  Object.keys(variant).forEach(key => {
    if (key !== 'getFromParent' && key !== 'name') {
      merged[key] = variant[key];
    }
  });
  
  // Validate required properties
  const issues = [];
  if (!merged.shapeType) issues.push('shapeType missing');
  if (!merged.size) issues.push('size missing');
  if (!merged.color) issues.push('color missing');
  
  if (issues.length > 0) {
    log(`❌ Variant ${variant.name} validation failed: ${issues.join(', ')}`, 'error');
  } else {
    log(`✅ Merged variant ${variant.name}: shapeType=${merged.shapeType}, size=${merged.size}, hasVectorPaths=${!!merged.vectorPaths}`, 'log');
  }
  
  return merged;
}

function createIconVariant(
  variantName: string,
  variantData: any,
  baseProperties: any
): ComponentNode {
  const iconComponent = figma.createComponent();
  
  // Parse variant name to extract properties for proper Figma variant naming
  const parts = variantName.split('-');
  const iconType = parts[0] || 'Icon';
  
  // Determine size from variant data or parse from name
  let size = 'Medium';
  if (variantData.size) {
    if (variantData.size <= 16) size = 'Small';
    else if (variantData.size <= 20) size = 'Medium';
    else if (variantData.size <= 24) size = 'Large';
    else size = 'XLarge';
  } else if (parts.length > 1) {
    size = parts[1];
  }
  
  // Use Figma's variant naming convention: Property=Value
  iconComponent.name = `Icon=${iconType}, Size=${size}`;
  
  // Merge base properties with variant overrides
  const finalData = mergeWithParent(baseProperties, variantData);
  
  // Set up component properties
  iconComponent.resize(finalData.size, finalData.size);
  iconComponent.layoutMode = 'NONE';
  iconComponent.clipsContent = false;
  iconComponent.fills = [];
  
  // Create the icon shape
  const iconShape = createIconShape(finalData);
  
  if (!iconShape) {
    log(`❌ Failed to create icon shape for variant ${variantName}`, 'error');
    // Return component with error placeholder
    const errorRect = figma.createRectangle();
    errorRect.resize(finalData.size || 20, finalData.size || 20);
    errorRect.name = `ERROR: ${iconType}`;
    errorRect.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 0.3 }];
    errorRect.strokes = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 1 }];
    errorRect.strokeWeight = 1;
    iconComponent.appendChild(errorRect);
    return iconComponent;
  }
  
  iconShape.name = iconType;
  iconComponent.appendChild(iconShape);
  
  return iconComponent;
}

export function renderIcon(nodeData: any, targetPage?: PageNode): ComponentSetNode[] | ComponentSetNode | SceneNode {
  // Check if using new variant structure  
  if (nodeData.variants && Array.isArray(nodeData.variants)) {
    const baseProperties = nodeData.properties || {};
    
    // Ensure we're on the correct page throughout the entire process
    log(`🔧 renderIcon called with targetPage: ${targetPage?.name || 'undefined'}`, 'log');
    
    if (targetPage) {
      figma.currentPage = targetPage;
      log(`🔧 Switched to target page: ${targetPage.name} for icon creation`, 'log');
    }
    
    // NEW APPROACH: Group variants by icon type to create separate ComponentSets
    const iconGroups = groupVariantsByIconType(nodeData.variants);
    const componentSets: ComponentSetNode[] = [];
    
    for (const [iconType, variants] of Object.entries(iconGroups)) {
      log(`🔧 Creating ComponentSet for icon type: ${iconType} with ${variants.length} size variants`, 'log');
      
      // Create variants for this specific icon type
      const componentVariants: ComponentNode[] = [];
      
      for (const variant of variants) {
        if (targetPage) {
          figma.currentPage = targetPage;
        }
        
        const variantComponent = createIconVariant(
          variant.name,
          variant,
          baseProperties
        );
        
        // Set proper variant naming for Figma (Size=Small, Size=Medium, etc.)
        const size = extractSizeFromVariant(variant.name);
        variantComponent.name = `Size=${size}`;
        
        componentVariants.push(variantComponent);
      }
      
      // Position variants before combining
      const spacing = 100;
      const itemsPerRow = Math.ceil(Math.sqrt(componentVariants.length));
      componentVariants.forEach((variant, index) => {
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;
        variant.x = col * spacing;
        variant.y = row * spacing;
      });
      
      // Create ComponentSet for this icon type
      if (targetPage) {
        figma.currentPage = targetPage;
      }
      
      const componentSet = figma.combineAsVariants(componentVariants, targetPage || figma.currentPage);
      componentSet.name = `[Icon] ${iconType}`;
      
      log(`✅ Created ComponentSet: ${componentSet.name} with ${componentVariants.length} size variants`, 'log');
      componentSets.push(componentSet);
    }
    
    log(`✅ Created ${componentSets.length} icon ComponentSets`, 'log');
    
    // Return single ComponentSet if only one, otherwise array
    return componentSets.length === 1 ? componentSets[0] : componentSets;
  }
  
  // If no variants provided, throw error
  throw new Error('Icon requires variants array. Please provide variants with getFromParent system.');
}

// Helper function to group variants by icon type
function groupVariantsByIconType(variants: any[]): {[iconType: string]: any[]} {
  const groups: {[iconType: string]: any[]} = {};
  
  variants.forEach(variant => {
    const iconType = extractIconTypeFromVariant(variant.name);
    if (!groups[iconType]) {
      groups[iconType] = [];
    }
    groups[iconType].push(variant);
  });
  
  return groups;
}

// Helper function to extract icon type from variant name
function extractIconTypeFromVariant(variantName: string): string {
  const parts = variantName.split('-');
  // Assume first part is the icon type (arrow, plus, home, etc.)
  return parts[0] || 'Icon';
}

// Helper function to extract size from variant name  
function extractSizeFromVariant(variantName: string): string {
  const parts = variantName.split('-');
  
  for (const part of parts) {
    const lowerPart = part.toLowerCase();
    if (lowerPart.includes('small') || lowerPart.includes('16')) return 'Small';
    if (lowerPart.includes('medium') || lowerPart.includes('20')) return 'Medium';
    if (lowerPart.includes('large') || lowerPart.includes('24')) return 'Large';  
    if (lowerPart.includes('xlarge') || lowerPart.includes('32')) return 'XLarge';
  }
  
  return 'Medium'; // Default
}
