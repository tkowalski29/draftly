import { log, loadFontSafely, hexToRgb } from "../main/utils/index";
import { applyProperties } from "../main/renderer/properties";

/**
 * Base Component Renderer Class
 * Provides common functionality that can be inherited by specialized renderers
 */
export abstract class BaseComponentRenderer {
  
  /**
   * Main rendering entry point - can be overridden by subclasses
   */
  async render(nodeData: any, targetPage?: PageNode): Promise<ComponentSetNode | ComponentSetNode[]> {
    log(`🎨 Rendering component: ${nodeData.name}`, 'log');
    
    // Ensure correct page
    if (targetPage) {
      figma.currentPage = targetPage;
    }
    
    if (!nodeData.variants || !Array.isArray(nodeData.variants)) {
      throw new Error('Variants array is required');
    }
    
    const baseProperties = nodeData.properties || {};
    
    // Handle variant grouping - can be overridden
    const grouping = this.getVariantGrouping(nodeData);
    
    if (grouping.type === 'byType' && grouping.property) {
      return await this.renderGroupedVariants(nodeData, baseProperties, targetPage);
    } else {
      return await this.renderSingleComponentSet(nodeData, baseProperties, targetPage);
    }
  }
  
  /**
   * Get variant grouping configuration - can be overridden
   */
  protected getVariantGrouping(nodeData: any): { type: string, property?: string } {
    const config = nodeData.componentConfig;
    return {
      type: config?.behavior?.variantGrouping || 'single',
      property: config?.behavior?.variantGroupProperty
    };
  }
  
  /**
   * Render variants grouped by property (e.g., icons grouped by iconType)
   */
  protected async renderGroupedVariants(
    nodeData: any,
    baseProperties: any,
    targetPage?: PageNode
  ): Promise<ComponentSetNode[]> {
    
    const grouping = this.getVariantGrouping(nodeData);
    const groups = this.groupVariantsByProperty(nodeData.variants, grouping.property!);
    const componentSets: ComponentSetNode[] = [];
    
    for (const [groupValue, variants] of Object.entries(groups)) {
      const componentVariants: ComponentNode[] = [];
      
      for (const variant of variants) {
        const variantComponent = await this.createVariant(
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
      await this.setupComponentProperties(componentSet, nodeData);
      
      componentSets.push(componentSet);
    }
    
    return componentSets;
  }
  
  /**
   * Render single ComponentSet with all variants
   */
  protected async renderSingleComponentSet(
    nodeData: any,
    baseProperties: any,
    targetPage?: PageNode
  ): Promise<ComponentSetNode> {
    
    const componentVariants: ComponentNode[] = [];
    
    // Create variants
    for (const variant of nodeData.variants) {
      const variantComponent = await this.createVariant(
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
    await this.setupComponentProperties(componentSet, nodeData);
    
    return componentSet;
  }
  
  /**
   * Create a single variant - MAIN HOOK for customization
   */
  protected async createVariant(
    variantName: string,
    variantData: any,
    baseProperties: any
  ): Promise<ComponentNode> {
    const variant = figma.createComponent();
    const finalData = this.mergeWithParent(baseProperties, variantData);
    
    // Create the component structure - CAN BE OVERRIDDEN
    const componentStructure = await this.createComponentStructure(finalData);
    variant.appendChild(componentStructure);
    
    // Set variant name
    const state = finalData.state || 'default';
    const size = finalData.size || 'medium';
    variant.name = `State=${state}, Size=${size}`;
    
    return variant;
  }
  
  /**
   * Create component structure - MAIN HOOK for subclasses to override
   * This is where specialized renderers implement their custom logic
   */
  protected async createComponentStructure(finalData: any): Promise<SceneNode> {
    // Default implementation - simple frame with text
    const frame = figma.createFrame();
    
    await applyProperties(frame, {
      autoLayout: {
        direction: 'HORIZONTAL',
        padding: {
          left: finalData.paddingX || 16,
          right: finalData.paddingX || 16,
          top: finalData.paddingY || 10,
          bottom: finalData.paddingY || 10
        },
        spacing: finalData.itemSpacing || 8
      },
      cornerRadius: finalData.cornerRadius || 8,
      fills: [{
        color: finalData.backgroundColor || '#3B82F6',
        opacity: finalData.opacity || 1
      }],
      width: 'HUG',
      height: 'HUG'
    });
    
    frame.primaryAxisAlignItems = 'CENTER';
    frame.counterAxisAlignItems = 'CENTER';
    
    // Add default text
    const textNode = await this.createTextChild(finalData);
    frame.appendChild(textNode);
    
    return frame;
  }
  
  /**
   * Create text child - can be overridden
   */
  protected async createTextChild(finalData: any): Promise<TextNode> {
    const textNode = figma.createText();
    
    await applyProperties(textNode, {
      text: finalData.text || 'Component',
      fontSize: finalData.fontSize || 16,
      fontFamily: 'Inter',
      fontWeight: 'Medium',
      textColor: finalData.textColor || '#FFFFFF'
    });
    
    return textNode;
  }
  
  /**
   * Setup component properties - can be overridden for complex properties
   */
  protected async setupComponentProperties(
    componentSet: ComponentSetNode, 
    nodeData: any
  ): Promise<void> {
    const config = nodeData.componentConfig;
    if (!config?.behavior?.componentProperties) return;
    
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
  protected async setupInstanceSwapProperty(
    componentSet: ComponentSetNode,
    propName: string,
    config: any
  ): Promise<void> {
    try {
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
  
  // Helper methods - shared across all renderers
  protected mergeWithParent(baseProperties: any, variant: any): any {
    if (!variant.getFromParent) {
      return variant;
    }
    return { ...baseProperties, ...variant };
  }
  
  protected groupVariantsByProperty(variants: any[], property: string): {[key: string]: any[]} {
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
  
  protected extractPropertyFromVariant(variantName: string, _property: string): string {
    const parts = variantName.split('-');
    return parts[0] || 'Default';
  }
  
  protected positionVariants(variants: ComponentNode[]): void {
    const spacing = 100;
    const itemsPerRow = Math.ceil(Math.sqrt(variants.length));
    
    variants.forEach((variant, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      variant.x = col * spacing;
      variant.y = row * spacing;
    });
  }
  
  protected findAllComponentSetsDeep(node: BaseNode, startsWith: string): ComponentSetNode[] {
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