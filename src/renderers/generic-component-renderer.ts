import { log, loadFontSafely, hexToRgb } from "../main/utils/index";
import { applyProperties } from "../main/renderer/properties";

/**
 * Generic Universal Component Renderer
 * Handles any component type based on JSON configuration without hardcoded types
 */

// Component creation configuration from JSON
interface ComponentConfig {
  // Base Figma node type to create
  figmaNodeType: 'FRAME' | 'RECTANGLE' | 'ELLIPSE' | 'TEXT' | 'VECTOR';
  
  // Properties to apply universally
  properties?: any;
  
  // Child elements configuration  
  children?: ComponentConfig[];
  
  // Component-specific behavior
  behavior?: {
    // Whether to create ComponentSet for variants
    createVariants?: boolean;
    
    // How to group variants (for icons: by iconType, for buttons: single group)
    variantGrouping?: 'single' | 'byType' | 'byProperty';
    variantGroupProperty?: string; // property to group by
    
    // Component properties to setup (INSTANCE_SWAP, TEXT, etc.)
    componentProperties?: any;
  };
}

/**
 * Generic component creation
 */
class GenericComponentRenderer {
  
  /**
   * Create base component from configuration
   */
  async createComponent(config: ComponentConfig, data: any): Promise<SceneNode> {
    let baseNode: SceneNode;
    
    // Create appropriate Figma node
    switch (config.figmaNodeType) {
      case 'FRAME':
        baseNode = figma.createFrame();
        break;
      case 'RECTANGLE':
        baseNode = figma.createRectangle();
        break;
      case 'ELLIPSE':
        baseNode = figma.createEllipse();
        break;
      case 'TEXT':
        baseNode = figma.createText();
        // Load default fonts for text nodes
        await loadFontSafely('Inter', 'Regular');
        await loadFontSafely('Inter', 'Medium');
        break;
      case 'VECTOR':
        baseNode = figma.createVector();
        await this.setupVector(baseNode as VectorNode, data);
        break;
      default:
        throw new Error(`Unsupported figmaNodeType: ${config.figmaNodeType}`);
    }
    
    // Apply universal properties if specified
    if (config.properties) {
      await applyProperties(baseNode, this.mergeConfigWithData(config.properties, data));
    }
    
    // Create and append children
    if (config.children) {
      for (const childConfig of config.children) {
        const childNode = await this.createComponent(childConfig, data);
        if ('appendChild' in baseNode) {
          (baseNode as any).appendChild(childNode);
        }
      }
    }
    
    return baseNode;
  }
  
  /**
   * Setup vector node with paths from data
   */
  async setupVector(vector: VectorNode, data: any): Promise<void> {
    if (data.vectorPaths && Array.isArray(data.vectorPaths)) {
      const scaledPaths = data.vectorPaths.map((path: any) => {
        const size = data.size || 20;
        const scaledData = path.data.replace(/([+-]?\\d*\\.?\\d+)/g, (match: string) => {
          const num = parseFloat(match);
          return (num * size).toString();
        });
        
        return {
          windingRule: path.windingRule || 'NONZERO',
          data: scaledData
        };
      });
      
      vector.vectorPaths = scaledPaths;
    }
    
    // Apply vector-specific properties
    if (data.size) {
      vector.resize(data.size, data.size);
    }
    
    if (data.useStroke && data.strokeWidth) {
      vector.strokes = [{
        type: 'SOLID',
        color: hexToRgb(data.color || '#000000'),
        opacity: data.opacity || 1
      }];
      vector.strokeWeight = data.strokeWidth;
      vector.fills = [];
    } else {
      vector.fills = [{
        type: 'SOLID',
        color: hexToRgb(data.color || '#000000'),  
        opacity: data.opacity || 1
      }];
    }
  }
  
  /**
   * Create variant of a component
   */
  async createVariant(
    config: ComponentConfig,
    _variantName: string,
    variantData: any,
    baseProperties: any
  ): Promise<ComponentNode> {
    const variant = figma.createComponent();
    const finalData = this.mergeWithParent(baseProperties, variantData);
    
    // Create the component structure
    const componentStructure = await this.createComponent(config, finalData);
    variant.appendChild(componentStructure);
    
    // Set variant name based on configuration or data
    if (config.behavior?.variantGrouping === 'byType' && config.behavior?.variantGroupProperty) {
      const groupValue = finalData[config.behavior.variantGroupProperty] || 'Default';
      const size = finalData.size || 'Medium';
      variant.name = `${config.behavior.variantGroupProperty}=${groupValue}, Size=${size}`;
    } else {
      // Default naming for single-group variants (like buttons)
      const state = finalData.state || 'default';
      const size = finalData.size || 'medium';
      variant.name = `State=${state}, Size=${size}`;
    }
    
    return variant;
  }
  
  /**
   * Setup component properties (INSTANCE_SWAP, TEXT, etc.)
   */
  async setupComponentProperties(
    componentSet: ComponentSetNode, 
    config: ComponentConfig
  ): Promise<void> {
    if (!config.behavior?.componentProperties) return;
    
    const properties = config.behavior.componentProperties;
    
    for (const [propName, propConfig] of Object.entries(properties)) {
      const prop = propConfig as any;
      
      if (prop.type === 'INSTANCE_SWAP') {
        await this.setupInstanceSwapProperty(componentSet, propName, prop);
      } else if (prop.type === 'TEXT') {
        componentSet.addComponentProperty('text', 'TEXT', prop.defaultValue || 'Text');
      } else if (prop.type === 'BOOLEAN') {
        componentSet.addComponentProperty(propName, 'BOOLEAN', prop.defaultValue || false);
      }
    }
  }
  
  /**
   * Setup INSTANCE_SWAP property
   */
  async setupInstanceSwapProperty(
    componentSet: ComponentSetNode,
    propName: string,
    config: any
  ): Promise<void> {
    try {
      // Find ComponentSets matching the search pattern
      const searchPattern = config.searchPattern || '[Icon]';
      const matchingComponentSets = this.findAllComponentSetsDeep(figma.currentPage, searchPattern);
      
      if (matchingComponentSets.length > 0) {
        const defaultComponentSet = matchingComponentSets[0];
        const defaultComponent = defaultComponentSet.defaultVariant;
        
        if (defaultComponent) {
          const preferredValues = matchingComponentSets.map(cs => ({
            type: 'COMPONENT_SET' as const,
            key: cs.id
          }));
          
          componentSet.addComponentProperty(
            propName,
            'INSTANCE_SWAP',
            defaultComponent.id,
            { preferredValues }
          );
          
          log(`✅ Created INSTANCE_SWAP property ${propName} with ${preferredValues.length} ComponentSets`, 'log');
        }
      }
    } catch (error: any) {
      log(`❌ Error creating INSTANCE_SWAP property ${propName}: ${error.message}`, 'error');
    }
  }
  
  /**
   * Render complete component with variants
   */
  async renderComponent(
    nodeData: any,
    targetPage?: PageNode
  ): Promise<ComponentSetNode | ComponentSetNode[]> {
    
    const componentConfig = nodeData.componentConfig as ComponentConfig;
    if (!componentConfig) {
      throw new Error('Component configuration (componentConfig) is required in JSON');
    }
    
    log(`🎨 Rendering generic component: ${nodeData.name}`, 'log');
    
    // Ensure correct page
    if (targetPage) {
      figma.currentPage = targetPage;
    }
    
    if (!nodeData.variants || !Array.isArray(nodeData.variants)) {
      throw new Error('Variants array is required');
    }
    
    const baseProperties = nodeData.properties || {};
    
    // Handle variant grouping
    if (componentConfig.behavior?.variantGrouping === 'byType' && componentConfig.behavior?.variantGroupProperty) {
      return await this.renderGroupedVariants(nodeData, componentConfig, baseProperties, targetPage);
    } else {
      return await this.renderSingleComponentSet(nodeData, componentConfig, baseProperties, targetPage);
    }
  }
  
  /**
   * Render variants grouped by property (e.g., icons grouped by iconType)
   */
  async renderGroupedVariants(
    nodeData: any,
    config: ComponentConfig,
    baseProperties: any,
    targetPage?: PageNode
  ): Promise<ComponentSetNode[]> {
    
    const groupProperty = config.behavior!.variantGroupProperty!;
    const groups = this.groupVariantsByProperty(nodeData.variants, groupProperty);
    const componentSets: ComponentSetNode[] = [];
    
    for (const [groupValue, variants] of Object.entries(groups)) {
      const componentVariants: ComponentNode[] = [];
      
      for (const variant of variants) {
        const variantComponent = await this.createVariant(
          config,
          variant.name,
          variant,
          baseProperties
        );
        componentVariants.push(variantComponent);
      }
      
      // Position variants
      this.positionVariants(componentVariants);
      
      // Create ComponentSet
      const componentSet = figma.combineAsVariants(componentVariants, targetPage || figma.currentPage);
      componentSet.name = `[${nodeData.type}] ${groupValue}`;
      
      // Setup component properties
      await this.setupComponentProperties(componentSet, config);
      
      componentSets.push(componentSet);
    }
    
    return componentSets;
  }
  
  /**
   * Render single ComponentSet with all variants
   */
  async renderSingleComponentSet(
    nodeData: any,
    config: ComponentConfig,
    baseProperties: any,
    targetPage?: PageNode
  ): Promise<ComponentSetNode> {
    
    const componentVariants: ComponentNode[] = [];
    
    // Create variants
    for (const variant of nodeData.variants) {
      const variantComponent = await this.createVariant(
        config,
        variant.name,
        variant,
        baseProperties
      );
      componentVariants.push(variantComponent);
    }
    
    // Position variants
    this.positionVariants(componentVariants);
    
    // Create ComponentSet
    const componentSet = figma.combineAsVariants(componentVariants, targetPage || figma.currentPage);
    componentSet.name = nodeData.name;
    
    // Setup component properties
    await this.setupComponentProperties(componentSet, config);
    
    return componentSet;
  }
  
  // Helper methods
  private mergeConfigWithData(configProperties: any, data: any): any {
    // Replace placeholders in config with actual data values
    const merged = JSON.parse(JSON.stringify(configProperties));
    return this.replacePlaceholders(merged, data);
  }
  
  private replacePlaceholders(obj: any, data: any): any {
    if (typeof obj === 'string' && obj.startsWith('${') && obj.endsWith('}')) {
      const propertyPath = obj.slice(2, -1);
      const value = this.getNestedProperty(data, propertyPath);
      if (value !== undefined && value !== null) {
        return value; // Return the actual value (number, string, etc.)
      }
      return obj; // Return original placeholder if value not found
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.replacePlaceholders(item, data));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const key in obj) {
        result[key] = this.replacePlaceholders(obj[key], data);
      }
      return result;
    }
    
    return obj;
  }
  
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  private mergeWithParent(baseProperties: any, variant: any): any {
    if (!variant.getFromParent) {
      return variant;
    }
    return { ...baseProperties, ...variant };
  }
  
  private groupVariantsByProperty(variants: any[], property: string): {[key: string]: any[]} {
    const groups: {[key: string]: any[]} = {};
    
    variants.forEach(variant => {
      const value = this.extractPropertyFromVariant(variant.name, property) || 'Default';
      if (!groups[value]) {
        groups[value] = [];
      }
      groups[value].push(variant);
    });
    
    return groups;
  }
  
  private extractPropertyFromVariant(variantName: string, _property: string): string {
    // For now, extract from variant name like "ArrowRight-Small" -> "ArrowRight"
    const parts = variantName.split('-');
    return parts[0] || 'Default';
  }
  
  private positionVariants(variants: ComponentNode[]): void {
    const spacing = 100;
    const itemsPerRow = Math.ceil(Math.sqrt(variants.length));
    
    variants.forEach((variant, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      variant.x = col * spacing;
      variant.y = row * spacing;
    });
  }
  
  private findAllComponentSetsDeep(node: BaseNode, startsWith: string): ComponentSetNode[] {
    const results: ComponentSetNode[] = [];
    
    if (node.type === 'COMPONENT_SET' && node.name.startsWith(startsWith)) {
      results.push(node as ComponentSetNode);
    }
    
    if ('children' in node) {
      for (const child of node.children) {
        results.push(...this.findAllComponentSetsDeep(child, startsWith));
      }
    }
    
    return results;
  }
  
}

// Export main rendering function
export async function renderGenericComponent(
  nodeData: any,
  targetPage?: PageNode
): Promise<ComponentSetNode | ComponentSetNode[]> {
  const renderer = new GenericComponentRenderer();
  return await renderer.renderComponent(nodeData, targetPage);
}