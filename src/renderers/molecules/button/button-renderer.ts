import { BaseComponentRenderer } from "./../../base-component-renderer";
import { log, loadFontSafely } from "../../../main/utils/index";

/**
 * Button Renderer - Inherits from BaseComponentRenderer
 * Only overrides button-specific functionality, inherits 90% from base
 */
export class ButtonRenderer extends BaseComponentRenderer {
  
  /**
   * OVERRIDE: Create complex button structure with icons and lines
   * Based on proven working implementation
   */
  protected async createComponentStructure(finalData: any): Promise<SceneNode> {
    const buttonComponent = figma.createFrame();
    
    // Set up auto-layout properties directly (not through applyProperties)
    buttonComponent.layoutMode = 'HORIZONTAL';
    buttonComponent.primaryAxisAlignItems = 'CENTER';
    buttonComponent.counterAxisAlignItems = 'CENTER';
    buttonComponent.primaryAxisSizingMode = 'AUTO';
    buttonComponent.counterAxisSizingMode = 'AUTO';
    buttonComponent.paddingLeft = finalData.paddingX || 16;
    buttonComponent.paddingRight = finalData.paddingX || 16;
    buttonComponent.paddingTop = finalData.paddingY || 10;
    buttonComponent.paddingBottom = finalData.paddingY || 10;
    buttonComponent.itemSpacing = finalData.itemSpacing || 8;
    buttonComponent.cornerRadius = finalData.cornerRadius || 8;
    buttonComponent.layoutWrap = 'NO_WRAP';
    buttonComponent.strokeAlign = 'INSIDE';
    
    // Handle background color
    let backgroundColor = finalData.backgroundColor || '#3B82F6';
    let fillOpacity = finalData.opacity || 1;
    
    if (typeof backgroundColor === 'string') {
      // Convert hex to RGB
      const hex = backgroundColor.replace('#', '');
      backgroundColor = {
        r: parseInt(hex.substring(0, 2), 16) / 255,
        g: parseInt(hex.substring(2, 4), 16) / 255,
        b: parseInt(hex.substring(4, 6), 16) / 255
      };
    }
    
    // Apply background color
    buttonComponent.fills = [{
      type: 'SOLID',
      color: backgroundColor,
      opacity: fillOpacity,
    }];
    
    // 1. ALWAYS create Left Icon Instance (visibility controlled by properties)
    const leftIconInstance = await this.createIconInstance('left', finalData);
    buttonComponent.appendChild(leftIconInstance);
    // Set layout properties AFTER appendChild
    leftIconInstance.layoutSizingHorizontal = 'FIXED';
    leftIconInstance.layoutSizingVertical = 'FIXED';
    leftIconInstance.layoutAlign = 'CENTER';
    
    // 2. ALWAYS create Line Before Left Icon
    const lineBeforeLeftIcon = await this.createSeparatorLine(finalData, 'left');
    buttonComponent.appendChild(lineBeforeLeftIcon);
    // Set layout properties AFTER appendChild
    lineBeforeLeftIcon.layoutSizingHorizontal = 'FIXED';
    lineBeforeLeftIcon.layoutSizingVertical = 'FIXED';
    lineBeforeLeftIcon.layoutAlign = 'CENTER';
    
    // 3. ALWAYS create Main Text
    const textNode = await this.createButtonTextChild(finalData);
    buttonComponent.appendChild(textNode);
    // Set layout properties AFTER appendChild
    textNode.layoutSizingHorizontal = 'HUG';
    textNode.layoutSizingVertical = 'HUG';
    textNode.layoutAlign = 'CENTER';
    
    // 4. ALWAYS create Line Before Right Icon  
    const lineBeforeRightIcon = await this.createSeparatorLine(finalData, 'right');
    buttonComponent.appendChild(lineBeforeRightIcon);
    // Set layout properties AFTER appendChild
    lineBeforeRightIcon.layoutSizingHorizontal = 'FIXED';
    lineBeforeRightIcon.layoutSizingVertical = 'FIXED';
    lineBeforeRightIcon.layoutAlign = 'CENTER';
    
    // 5. ALWAYS create Right Icon Instance
    const rightIconInstance = await this.createIconInstance('right', finalData);
    buttonComponent.appendChild(rightIconInstance);
    // Set layout properties AFTER appendChild
    rightIconInstance.layoutSizingHorizontal = 'FIXED';
    rightIconInstance.layoutSizingVertical = 'FIXED';
    rightIconInstance.layoutAlign = 'CENTER';
    
    return buttonComponent;
  }
  
  /**
   * Create text node for button with proper font loading
   */
  private async createButtonTextChild(finalData: any): Promise<TextNode> {
    const textNode = figma.createText();
    textNode.name = 'Text';
    
    // Load font first
    const fontFamily = finalData.fontFamily || 'Inter';
    const fontWeight = finalData.fontWeight || 'Medium';
    const font = await loadFontSafely(fontFamily, fontWeight);
    textNode.fontName = font;
    
    // Set text and properties
    textNode.characters = finalData.text || finalData.content || 'Button';
    textNode.fontSize = finalData.fontSize || 16;
    
    // Handle text color
    let textColor = finalData.textColor || '#FFFFFF';
    if (typeof textColor === 'string') {
      const hex = textColor.replace('#', '');
      textColor = {
        r: parseInt(hex.substring(0, 2), 16) / 255,
        g: parseInt(hex.substring(2, 4), 16) / 255,
        b: parseInt(hex.substring(4, 6), 16) / 255
      };
    }
    
    textNode.fills = [{
      type: 'SOLID',
      color: textColor,
      opacity: 1,
    }];
    
    // Layout properties will be set after appendChild in main method
    
    return textNode;
  }
  
  /**
   * Create icon instance using existing ComponentSets or placeholder
   * Based on proven working implementation
   */
  private async createIconInstance(side: 'left' | 'right', finalData: any): Promise<InstanceNode> {
    const iconSize = finalData.iconSize || 20;
    
    // Find ANY icon ComponentSet on the page (search deeply in all containers)
    const iconComponentSets = this.findAllComponentSetsRecursively(figma.currentPage, '[Icon]');
    
    const iconComponentSet = iconComponentSets.length > 0 ? iconComponentSets[0] : null;
    
    let iconInstance: InstanceNode;
    
    if (iconComponentSet && iconComponentSet.defaultVariant) {
      // Create instance from existing icon ComponentSet
      iconInstance = iconComponentSet.defaultVariant.createInstance();
      iconInstance.resize(iconSize, iconSize);
      log(`✅ Created ${side} icon instance from ComponentSet: ${iconComponentSet.name}`, 'log');
    } else {
      // Fallback: create placeholder component and instance
      log(`❌ Icon ComponentSet not found, creating placeholder for ${side} icon`, 'error');
      const placeholderComponent = await this.createIconPlaceholder(finalData);
      iconInstance = placeholderComponent.createInstance();
    }
    
    // Set properties
    iconInstance.name = `${side === 'left' ? 'Left' : 'Right'} Icon Instance`;
    // Layout properties will be set after appendChild in main method
    
    // Set initial visibility based on finalData or default to hidden
    iconInstance.visible = finalData[`show${side === 'left' ? 'Left' : 'Right'}Icon`] || false;
    
    return iconInstance;
  }
  
  /**
   * Create icon placeholder component for fallback
   */
  private async createIconPlaceholder(finalData: any): Promise<ComponentNode> {
    const placeholderComponent = figma.createComponent();
    placeholderComponent.name = 'Icon Placeholder';
    const iconSize = finalData.iconSize || 20;
    
    placeholderComponent.resize(iconSize, iconSize);
    placeholderComponent.fills = [];
    placeholderComponent.cornerRadius = 2;
    
    // Create placeholder rectangle
    const iconRect = figma.createRectangle();
    iconRect.name = 'Icon Shape';
    iconRect.resize(iconSize - 4, iconSize - 4);
    iconRect.x = 2;
    iconRect.y = 2;
    iconRect.fills = [{ 
      type: 'SOLID', 
      color: finalData.iconColor || { r: 0.9, g: 0.9, b: 0.9 }, 
      opacity: 1 
    }];
    iconRect.strokes = [{ 
      type: 'SOLID', 
      color: { r: 0.7, g: 0.7, b: 0.7 }, 
      opacity: 1 
    }];
    iconRect.strokeWeight = 1;
    iconRect.cornerRadius = 2;
    
    placeholderComponent.appendChild(iconRect);
    return placeholderComponent;
  }
  
  /**
   * Create separator line - always created but visibility controlled by properties
   */
  private async createSeparatorLine(finalData: any, side: 'left' | 'right'): Promise<LineNode> {
    const line = figma.createLine();
    line.name = `Line Before ${side === 'left' ? 'Left' : 'Right'} Icon`;
    line.resize(1, finalData.lineHeight || 16);
    
    // Handle text color for line styling
    let textColor = finalData.textColor || '#FFFFFF';
    if (typeof textColor === 'string') {
      const hex = textColor.replace('#', '');
      textColor = {
        r: parseInt(hex.substring(0, 2), 16) / 255,
        g: parseInt(hex.substring(2, 4), 16) / 255,
        b: parseInt(hex.substring(4, 6), 16) / 255
      };
    }
    
    line.strokes = [{ 
      type: 'SOLID', 
      color: textColor,
      opacity: 1 
    }];
    line.strokeWeight = 1;
    line.visible = false; // Hidden by default, controlled by component properties
    
    // Layout properties will be set after appendChild in main method
    
    return line;
  }
  
  /**
   * OVERRIDE: Enhanced component properties setup for buttons
   * Based on proven working implementation with property bindings
   */
  protected async setupComponentProperties(
    componentSet: ComponentSetNode, 
    nodeData: any
  ): Promise<void> {
    log(`📋 Setting up button component properties for: ${nodeData.name}`, 'log');
    
    if (!nodeData.componentConfig?.behavior?.componentProperties) {
      log(`⚠️ No componentProperties defined in nodeData`, 'log');
      return;
    }
    
    const componentProps = nodeData.componentConfig.behavior.componentProperties;
    const propertyIds: { [key: string]: string } = {};
    
    // Add all properties and store their IDs for binding
    for (const [propName, propConfig] of Object.entries(componentProps)) {
      const config = propConfig as any;
      
      try {
        switch (config.type) {
          case 'TEXT':
            propertyIds[propName] = componentSet.addComponentProperty(
              propName, 
              'TEXT', 
              config.defaultValue || 'Button'
            );
            log(`✅ Added TEXT property: ${propName}`, 'log');
            break;
            
          case 'BOOLEAN':
            propertyIds[propName] = componentSet.addComponentProperty(
              propName, 
              'BOOLEAN', 
              config.defaultValue || false
            );
            log(`✅ Added BOOLEAN property: ${propName}`, 'log');
            break;
            
          case 'INSTANCE_SWAP':
            await this.setupButtonInstanceSwapProperty(componentSet, propName, config, propertyIds);
            break;
        }
      } catch (error: any) {
        log(`❌ Error adding property ${propName}: ${error.message}`, 'error');
      }
    }
    
    // Bind properties to elements in all variants
    await this.bindPropertiesToElements(componentSet, propertyIds);
  }
  
  /**
   * Setup INSTANCE_SWAP property for button icons
   */
  private async setupButtonInstanceSwapProperty(
    componentSet: ComponentSetNode,
    propName: string,
    config: any,
    propertyIds: { [key: string]: string }
  ): Promise<void> {
    try {
      // Find ALL icon ComponentSets recursively
      const iconComponentSets = this.findAllComponentSetsRecursively(figma.currentPage, '[Icon]');
      
      log(`🔍 Found ${iconComponentSets.length} icon ComponentSets for INSTANCE_SWAP`, 'log');
      
      if (iconComponentSets.length > 0) {
        const defaultIconComponentSet = iconComponentSets[0];
        const defaultIconComponent = defaultIconComponentSet.defaultVariant;
        
        if (defaultIconComponent) {
          // Create preferredValues from all icon ComponentSets
          const preferredValues = iconComponentSets.map(cs => ({
            type: 'COMPONENT_SET' as const,
            key: cs.id
          }));
          
          propertyIds[propName] = componentSet.addComponentProperty(
            propName,
            'INSTANCE_SWAP',
            defaultIconComponent.id,
            { preferredValues }
          );
          
          log(`✅ Added INSTANCE_SWAP property ${propName} with ${preferredValues.length} ComponentSets`, 'log');
        }
      } else {
        log(`❌ No icon ComponentSets found for INSTANCE_SWAP property ${propName}`, 'error');
      }
    } catch (error: any) {
      log(`❌ Error creating INSTANCE_SWAP property ${propName}: ${error.message}`, 'error');
    }
  }
  
  /**
   * Bind component properties to elements in all variants
   */
  private async bindPropertiesToElements(
    componentSet: ComponentSetNode,
    propertyIds: { [key: string]: string }
  ): Promise<void> {
    if (!componentSet.children) return;
    
    componentSet.children.forEach((variant: any) => {
      if (variant.type === 'COMPONENT') {
        log(`🔗 Binding properties in variant: ${variant.name}`, 'log');
        
        // Debug: Log all children names in the variant
        if (variant.children) {
          const childNames = variant.children.map((child: any) => `"${child.name}"`).join(', ');
          log(`🔍 Variant children: [${childNames}]`, 'log');
        }
        
        // Bind text property - search recursively in button frame
        if (propertyIds.text) {
          const textElement = this.findNodeRecursively(variant, (child: any) => child.name === 'Text');
          if (textElement && textElement.type === 'TEXT') {
            textElement.componentPropertyReferences = { characters: propertyIds.text };
            log(`✅ Bound text property in variant: ${variant.name}`, 'log');
          } else {
            log(`❌ Text element not found in variant: ${variant.name}`, 'error');
          }
        }
        
        // Bind leftIconEnabled property (working order with new names) - search recursively
        if (propertyIds.leftIconEnabled) {
          const leftIcon = this.findNodeRecursively(variant, (child: any) => child.name === 'Left Icon Instance');
          if (leftIcon && 'componentPropertyReferences' in leftIcon) {
            (leftIcon as any).componentPropertyReferences = { visible: propertyIds.leftIconEnabled };
            log(`✅ Bound Left Icon Instance visibility in variant: ${variant.name}`, 'log');
          } else {
            log(`❌ Left Icon Instance not found in variant: ${variant.name}`, 'error');
          }
        }
        
        // Bind rightIconEnabled property - search recursively
        if (propertyIds.rightIconEnabled) {
          const rightIcon = this.findNodeRecursively(variant, (child: any) => child.name === 'Right Icon Instance');
          if (rightIcon && 'componentPropertyReferences' in rightIcon) {
            (rightIcon as any).componentPropertyReferences = { visible: propertyIds.rightIconEnabled };
            log(`✅ Bound Right Icon Instance visibility in variant: ${variant.name}`, 'log');
          } else {
            log(`❌ Right Icon Instance not found in variant: ${variant.name}`, 'error');
          }
        }
        
        // Bind leftIcon INSTANCE_SWAP property (working implementation with new names) - search recursively
        if (propertyIds.leftIcon) {
          const leftIconInstance = this.findNodeRecursively(variant, (child: any) => child.name === 'Left Icon Instance');
          if (leftIconInstance && leftIconInstance.type === 'INSTANCE') {
            try {
              leftIconInstance.componentPropertyReferences = { 
                ...leftIconInstance.componentPropertyReferences, 
                mainComponent: propertyIds.leftIcon 
              };
              log(`✅ Bound leftIcon INSTANCE_SWAP in variant: ${variant.name}`, 'log');
            } catch (swapError: any) {
              log(`❌ Failed to bind leftIcon INSTANCE_SWAP: ${swapError.message}`, 'error');
            }
          } else {
            log(`⚠️ Left Icon Instance not found or is not an INSTANCE for INSTANCE_SWAP binding`, 'log');
          }
        }
        
        // Bind rightIcon INSTANCE_SWAP property - search recursively
        if (propertyIds.rightIcon) {
          const rightIconInstance = this.findNodeRecursively(variant, (child: any) => child.name === 'Right Icon Instance');
          if (rightIconInstance && rightIconInstance.type === 'INSTANCE') {
            try {
              rightIconInstance.componentPropertyReferences = { 
                ...rightIconInstance.componentPropertyReferences, 
                mainComponent: propertyIds.rightIcon 
              };
              log(`✅ Bound rightIcon INSTANCE_SWAP in variant: ${variant.name}`, 'log');
            } catch (swapError: any) {
              log(`❌ Failed to bind rightIcon INSTANCE_SWAP: ${swapError.message}`, 'error');
            }
          } else {
            log(`⚠️ Right Icon Instance not found or is not an INSTANCE for INSTANCE_SWAP binding`, 'log');
          }
        }
        
        // Bind leftIconLine property - search recursively
        if (propertyIds.leftIconLine) {
          const lineBeforeLeftIcon = this.findNodeRecursively(variant, (child: any) => child.name === 'Line Before Left Icon');
          if (lineBeforeLeftIcon && 'componentPropertyReferences' in lineBeforeLeftIcon) {
            (lineBeforeLeftIcon as any).componentPropertyReferences = { visible: propertyIds.leftIconLine };
            log(`✅ Bound Line Before Left Icon visibility in variant: ${variant.name}`, 'log');
          } else {
            log(`❌ Line Before Left Icon not found in variant: ${variant.name}`, 'error');
          }
        }
        
        // Bind rightIconLine property - search recursively
        if (propertyIds.rightIconLine) {
          const lineBeforeRightIcon = this.findNodeRecursively(variant, (child: any) => child.name === 'Line Before Right Icon');
          if (lineBeforeRightIcon && 'componentPropertyReferences' in lineBeforeRightIcon) {
            (lineBeforeRightIcon as any).componentPropertyReferences = { visible: propertyIds.rightIconLine };
            log(`✅ Bound Line Before Right Icon visibility in variant: ${variant.name}`, 'log');
          } else {
            log(`❌ Line Before Right Icon not found in variant: ${variant.name}`, 'error');
          }
        }
      }
    });
  }
  
  /**
   * Find ComponentSets recursively in all containers on the page
   */
  private findAllComponentSetsRecursively(node: BaseNode, nameContains: string): ComponentSetNode[] {
    const results: ComponentSetNode[] = [];
    
    if (node.type === 'COMPONENT_SET' && node.name.includes(nameContains)) {
      results.push(node as ComponentSetNode);
    }
    
    if ('children' in node && node.children) {
      for (const child of node.children) {
        results.push(...this.findAllComponentSetsRecursively(child, nameContains));
      }
    }
    
    return results;
  }

  /**
   * Find a node recursively by predicate function
   */
  private findNodeRecursively(node: BaseNode, predicate: (node: BaseNode) => boolean): BaseNode | null {
    if (predicate(node)) {
      return node;
    }
    
    if ('children' in node && node.children) {
      for (const child of node.children) {
        const found = this.findNodeRecursively(child, predicate);
        if (found) {
          return found;
        }
      }
    }
    
    return null;
  }
  
  /**
   * OVERRIDE: Button-specific variant creation with auto-sizing
   */
  protected async createVariant(
    variantName: string,
    variantData: any,
    baseProperties: any
  ): Promise<ComponentNode> {
    const variant = figma.createComponent();
    const finalData = this.mergeWithParent(baseProperties, variantData);
    
    // Create the component structure
    const componentStructure = await this.createComponentStructure(finalData);
    variant.appendChild(componentStructure);
    
    // CRITICAL: Set component to auto-resize to match its content
    variant.primaryAxisSizingMode = 'AUTO';
    variant.counterAxisSizingMode = 'AUTO';
    variant.layoutMode = 'HORIZONTAL';
    
    // Set variant name
    const state = finalData.state || 'default';
    const size = finalData.size || 'medium';
    variant.name = `State=${state}, Size=${size}`;
    
    return variant;
  }
}

// Export function for design-system-renderer integration
export async function renderButtonWithInheritance(
  nodeData: any,
  targetPage?: PageNode
): Promise<ComponentSetNode | ComponentSetNode[]> {
  const renderer = new ButtonRenderer();
  return await renderer.render(nodeData, targetPage);
}