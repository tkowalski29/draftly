import { loadFontSafely, log } from "../../main/utils/index";

/**
 * Deep search for ComponentSet in page hierarchy (including inside auto layout containers)
 */
function findComponentSetDeep(node: BaseNode, targetName: string): ComponentSetNode | null {
  // Check current node
  if (node.type === 'COMPONENT_SET' && node.name === targetName) {
    return node as ComponentSetNode;
  }
  
  // Recursively search children if node has them
  if ('children' in node) {
    for (const child of node.children) {
      const found = findComponentSetDeep(child, targetName);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Deep search for ALL ComponentSets matching a criteria in page hierarchy
 */
function findAllComponentSetsDeep(node: BaseNode, startsWith: string): ComponentSetNode[] {
  const results: ComponentSetNode[] = [];
  
  // Check current node
  if (node.type === 'COMPONENT_SET' && node.name.startsWith(startsWith)) {
    results.push(node as ComponentSetNode);
  }
  
  // Recursively search children if node has them
  if ('children' in node) {
    for (const child of node.children) {
      const found = findAllComponentSetsDeep(child, startsWith);
      results.push(...found);
    }
  }
  
  return results;
}

function mergeWithParent(baseProperties: any, variant: any, propertyMappings?: any): any {
  if (!variant.getFromParent) {
    return variant;
  }
  
  // Start with base properties, then override with variant properties
  const merged = { ...baseProperties };
  
  // If we have property mappings, apply them based on variant properties
  if (propertyMappings) {
    // Apply size properties
    if (variant.size && propertyMappings.size) {
      const sizeMapping = propertyMappings.size.find((s: any) => s.value === variant.size);
      if (sizeMapping?.properties) {
        Object.assign(merged, sizeMapping.properties);
      }
    }
    
    // Apply color properties
    if (variant.color && propertyMappings.color) {
      const colorMapping = propertyMappings.color.find((c: any) => c.value === variant.color);
      if (colorMapping?.properties) {
        Object.assign(merged, colorMapping.properties);
      }
    }
    
    // Apply state properties  
    if (variant.state && propertyMappings.state) {
      const stateMapping = propertyMappings.state.find((s: any) => s.value === variant.state);
      if (stateMapping?.properties) {
        Object.assign(merged, stateMapping.properties);
      }
    }
  }
  
  // Override any properties that are explicitly set in the variant
  Object.keys(variant).forEach(key => {
    if (key !== 'getFromParent' && key !== 'name') {
      merged[key] = variant[key];
    }
  });
  
  // Validate required properties
  const issues = [];
  if (!merged.text && !merged.content) issues.push('text or content missing');
  if (!merged.backgroundColor) issues.push('backgroundColor missing');
  if (!merged.textColor) issues.push('textColor missing');
  if (!merged.fontSize) issues.push('fontSize missing');
  if (!merged.paddingX) issues.push('paddingX missing');
  if (!merged.paddingY) issues.push('paddingY missing');
  
  if (issues.length > 0) {
    log(`❌ Button variant ${variant.name} validation failed: ${issues.join(', ')}`, 'error');
  } else {
    log(`✅ Merged button variant ${variant.name}: state=${merged.state}, size=${merged.size}, color=${merged.backgroundColor}`, 'log');
  }
  
  return merged;
}

async function createButtonVariant(
  variantName: string,
  variantData: any,
  baseProperties: any,
  propertyMappings?: any
): Promise<ComponentNode> {
  const buttonComponent = figma.createComponent();
  
  // Merge base properties with variant overrides and property mappings
  const finalData = mergeWithParent(baseProperties, variantData, propertyMappings);
  
  // Use simple variant name from JSON with temporary prefix for cleanup
  buttonComponent.name = `[X] ${variantName}`;
  
  // Validate required properties and return error component if failed
  if (!finalData.text && !finalData.content) {
    log(`❌ Failed to create button variant ${variantName} - missing text`, 'error');
    return createErrorButton(variantName, 'Missing text');
  }
  
  if (!finalData.backgroundColor || !finalData.textColor) {
    log(`❌ Failed to create button variant ${variantName} - missing colors`, 'error');
    return createErrorButton(variantName, 'Missing colors');
  }
  
  const text = finalData.text || finalData.content;
  
  // Set up component properties with auto-layout
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
  let backgroundColor = finalData.backgroundColor;
  let fillOpacity = finalData.opacity || 1;
  
  if (typeof backgroundColor === 'string') {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    backgroundColor = {
      r: parseInt(hex.substr(0, 2), 16) / 255,
      g: parseInt(hex.substr(2, 2), 16) / 255,
      b: parseInt(hex.substr(4, 2), 16) / 255
    };
  }
  
  // Handle RGBA colors - extract alpha and use it as opacity
  if (backgroundColor.a !== undefined) {
    fillOpacity = backgroundColor.a;
    backgroundColor = { r: backgroundColor.r, g: backgroundColor.g, b: backgroundColor.b };
  }
  
  // Apply background color
  const fill: SolidPaint = {
    type: 'SOLID',
    color: backgroundColor,
    opacity: fillOpacity,
  };
  buttonComponent.fills = [fill];
  
  // Add effects (shadows, focus ring)
  const effects = [];
  
  // Add shadow if specified
  if (finalData.shadowOpacity && finalData.shadowOpacity > 0) {
    const shadow: DropShadowEffect = {
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: finalData.shadowOpacity },
      offset: { x: finalData.shadowX || 0, y: finalData.shadowY || 2 },
      radius: finalData.shadowRadius || 4,
      visible: true,
      blendMode: 'NORMAL'
    };
    effects.push(shadow);
  }
  
  // Add focus ring if specified
  if (finalData.hasFocusRing) {
    const focusColor = finalData.focusColor || { r: 0.23, g: 0.4, b: 1, a: 0.4 };
    const focusRing: DropShadowEffect = {
      type: 'DROP_SHADOW',
      color: focusColor,
      offset: { x: 0, y: 0 },
      radius: finalData.focusRadius || 4,
      visible: true,
      blendMode: 'NORMAL'
    };
    effects.push(focusRing);
  }
  
  if (effects.length > 0) {
    buttonComponent.effects = effects;
  }
  
  // Always add left icon placeholder (for component properties)
  const iconSize = finalData.iconSize || 20;
  
  // Find icon ComponentSet for creating proper instances (deep search)
  let leftIconInstance: InstanceNode | null = null;
  const iconComponentSetName = '[Icon] Arrow System'; // Should match what's in JSON
  const iconComponentSet = findComponentSetDeep(figma.currentPage, iconComponentSetName);
  
  if (iconComponentSet && iconComponentSet.defaultVariant) {
    // Create instance of the icon ComponentSet's default variant
    leftIconInstance = iconComponentSet.defaultVariant.createInstance();
    leftIconInstance.name = 'Left Icon Instance';
    leftIconInstance.resize(iconSize, iconSize);
    log(`✅ Created left icon instance from ComponentSet: ${iconComponentSetName}`, 'log');
  } else {
    log(`❌ Icon ComponentSet not found: ${iconComponentSetName}, creating placeholder`, 'error');
    // Fallback: create placeholder
    const leftIconPlaceholderComponent = figma.createComponent();
    leftIconPlaceholderComponent.name = 'Icon Placeholder Left';
    leftIconPlaceholderComponent.resize(iconSize, iconSize);
    leftIconPlaceholderComponent.fills = [];
    leftIconPlaceholderComponent.cornerRadius = 2;
    
    const leftIconRect = figma.createRectangle();
    leftIconRect.name = 'Icon Shape';
    leftIconRect.resize(iconSize - 4, iconSize - 4);
    leftIconRect.x = 2;
    leftIconRect.y = 2;
    leftIconRect.fills = [{ 
      type: 'SOLID', 
      color: finalData.iconColor || { r: 0.9, g: 0.9, b: 0.9 }, 
      opacity: 1 
    }];
    leftIconRect.strokes = [{ 
      type: 'SOLID', 
      color: { r: 0.7, g: 0.7, b: 0.7 }, 
      opacity: 1 
    }];
    leftIconRect.strokeWeight = 1;
    leftIconRect.cornerRadius = 2;
    leftIconPlaceholderComponent.appendChild(leftIconRect);
    
    leftIconInstance = leftIconPlaceholderComponent.createInstance();
    leftIconInstance.name = 'Left Icon Instance';
  }
  
  
  buttonComponent.appendChild(leftIconInstance);
  leftIconInstance.layoutSizingHorizontal = 'FIXED';
  leftIconInstance.layoutSizingVertical = 'FIXED';
  leftIconInstance.layoutAlign = 'CENTER';
  
  // Hide by default - will be controlled by enableIconLeft property
  leftIconInstance.visible = finalData.showLeftIcon !== false ? true : false;
  
  // Add line AFTER left icon (between left icon and text) - ADD IT HERE, right after left icon
  const lineBeforeLeftIcon = figma.createLine();
  lineBeforeLeftIcon.name = 'Line Before Left Icon';
  lineBeforeLeftIcon.resize(1, 16); // Vertical line
  lineBeforeLeftIcon.strokes = [{ 
    type: 'SOLID', 
    color: { r: 0.8, g: 0.8, b: 0.8 }, // Will update with text color later
    opacity: 1 
  }];
  lineBeforeLeftIcon.strokeWeight = 1;
  lineBeforeLeftIcon.visible = false; // Hidden by default
  buttonComponent.appendChild(lineBeforeLeftIcon);
  lineBeforeLeftIcon.layoutSizingHorizontal = 'FIXED';
  lineBeforeLeftIcon.layoutSizingVertical = 'FIXED';
  lineBeforeLeftIcon.layoutAlign = 'CENTER';
  
  
  // Add text element
  const textNode = figma.createText();
  textNode.name = 'Text';
  const fontFamily = finalData.fontFamily || 'Inter';
  const fontWeight = finalData.fontWeight || 'Medium';
  const font = await loadFontSafely(fontFamily, fontWeight);
  textNode.fontName = font;
  textNode.characters = text;
  textNode.fontSize = finalData.fontSize || 16;
  
  // Handle text color
  let textColor = finalData.textColor;
  if (typeof textColor === 'string') {
    // Convert hex to RGB
    const hex = textColor.replace('#', '');
    textColor = {
      r: parseInt(hex.substr(0, 2), 16) / 255,
      g: parseInt(hex.substr(2, 2), 16) / 255,
      b: parseInt(hex.substr(4, 2), 16) / 255
    };
  }
  
  const textFill: SolidPaint = {
    type: 'SOLID',
    color: textColor,
    opacity: 1,
  };
  textNode.fills = [textFill];
  
  buttonComponent.appendChild(textNode);
  textNode.layoutSizingHorizontal = 'HUG';
  textNode.layoutSizingVertical = 'HUG';
  textNode.layoutAlign = 'CENTER';
  
  // Update line colors to match text color after textColor is defined
  lineBeforeLeftIcon.strokes = [{ 
    type: 'SOLID', 
    color: textColor, // Use same color as text
    opacity: 1 
  }];
  
  // Add line BEFORE right icon (between text and right icon)
  const lineBeforeRightIcon = figma.createLine();
  lineBeforeRightIcon.name = 'Line Before Right Icon';
  lineBeforeRightIcon.resize(1, 16); // Vertical line
  lineBeforeRightIcon.strokes = [{ 
    type: 'SOLID', 
    color: textColor, // Use same color as text
    opacity: 1 
  }];
  lineBeforeRightIcon.strokeWeight = 1;
  lineBeforeRightIcon.visible = false; // Hidden by default
  buttonComponent.appendChild(lineBeforeRightIcon);
  lineBeforeRightIcon.layoutSizingHorizontal = 'FIXED';
  lineBeforeRightIcon.layoutSizingVertical = 'FIXED';
  lineBeforeRightIcon.layoutAlign = 'CENTER';
  
  
  // Create right icon instance using the same ComponentSet
  let rightIconInstance: InstanceNode | null = null;
  
  if (iconComponentSet && iconComponentSet.defaultVariant) {
    // Create instance of the icon ComponentSet's default variant
    rightIconInstance = iconComponentSet.defaultVariant.createInstance();
    rightIconInstance.name = 'Right Icon Instance';
    rightIconInstance.resize(iconSize, iconSize);
    log(`✅ Created right icon instance from ComponentSet: ${iconComponentSetName}`, 'log');
  } else {
    log(`❌ Icon ComponentSet not found for right icon: ${iconComponentSetName}, creating placeholder`, 'error');
    // Fallback: create placeholder
    const rightIconPlaceholderComponent = figma.createComponent();
    rightIconPlaceholderComponent.name = 'Icon Placeholder Right';
    rightIconPlaceholderComponent.resize(iconSize, iconSize);
    rightIconPlaceholderComponent.fills = [];
    rightIconPlaceholderComponent.cornerRadius = 2;
    
    const rightIconRect = figma.createRectangle();
    rightIconRect.name = 'Icon Shape';
    rightIconRect.resize(iconSize - 4, iconSize - 4);
    rightIconRect.x = 2;
    rightIconRect.y = 2;
    rightIconRect.fills = [{ 
      type: 'SOLID', 
      color: finalData.iconColor || { r: 0.9, g: 0.9, b: 0.9 }, 
      opacity: 1 
    }];
    rightIconRect.strokes = [{ 
      type: 'SOLID', 
      color: { r: 0.7, g: 0.7, b: 0.7 }, 
      opacity: 1 
    }];
    rightIconRect.strokeWeight = 1;
    rightIconRect.cornerRadius = 2;
    rightIconPlaceholderComponent.appendChild(rightIconRect);
    
    rightIconInstance = rightIconPlaceholderComponent.createInstance();
    rightIconInstance.name = 'Right Icon Instance';
  }
  
  
  buttonComponent.appendChild(rightIconInstance);
  rightIconInstance.layoutSizingHorizontal = 'FIXED';
  rightIconInstance.layoutSizingVertical = 'FIXED';
  rightIconInstance.layoutAlign = 'CENTER';
  
  // Hide by default - will be controlled by enableIconRight property
  rightIconInstance.visible = finalData.showRightIcon !== false ? true : false;
  
  // NOTE: Properties will be added to ComponentSet after combineAsVariants
  // Individual variants should NOT have properties - they'll be managed by ComponentSet
  
  log(`🎨 Created button variant: ${variantName} as ${buttonComponent.name}`, 'log');
  return buttonComponent;
}

function createErrorButton(variantName: string, errorMessage: string): ComponentNode {
  const errorComponent = figma.createComponent();
  errorComponent.name = `ERROR: ${variantName}`;
  errorComponent.resize(120, 40);
  errorComponent.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 0.3 }];
  errorComponent.strokes = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 1 }];
  errorComponent.strokeWeight = 1;
  
  const errorText = figma.createText();
  errorText.name = 'Error';
  errorText.characters = errorMessage;
  errorText.fontSize = 12;
  errorText.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, opacity: 1 }];
  errorComponent.appendChild(errorText);
  
  return errorComponent;
}

async function renderButtonWithProperties(nodeData: any): Promise<ComponentSetNode> {
  const baseProperties = nodeData.properties || {};
  const componentProps = nodeData.componentProperties || {};
  
  log(`🔧 Creating Button ComponentSet with properties system`, 'log');
  
  // Extract property mappings for enhanced variant support
  const propertyMappings: any = {};
  for (const [propName, propConfig] of Object.entries(componentProps)) {
    const config = propConfig as any;
    if (config.type === 'VARIANT' && Array.isArray(config.variantOptions) && config.variantOptions[0]?.label) {
      propertyMappings[propName] = config.variantOptions;
    }
  }
  
  // Create variants based on examples but with full property support
  const componentVariants: ComponentNode[] = [];
  
  for (const variant of nodeData.variants) {
    const variantComponent = await createButtonVariant(
      variant.name,
      variant,
      baseProperties,
      propertyMappings
    );
    // Don't append to page - combineAsVariants will handle this
    componentVariants.push(variantComponent);
  }
  
  // Position variants
  const horizontalSpacing = 160;
  const verticalSpacing = 80;
  let maxItemsPerRow = 4;
  
  componentVariants.forEach((variant, index) => {
    const row = Math.floor(index / maxItemsPerRow);
    const col = index % maxItemsPerRow;
    variant.x = col * horizontalSpacing;
    variant.y = row * verticalSpacing;
  });
  
  // Create ComponentSet
  const componentSet = figma.combineAsVariants(componentVariants, figma.currentPage);
  componentSet.name = nodeData.name || 'Button System';
  
  // Remove [X] prefix from variant names inside ComponentSet
  log(`🔍 ComponentSet has ${componentSet.children?.length || 0} children`, 'log');
  if (componentSet.children) {
    componentSet.children.forEach((child: any) => {
      log(`🔍 Checking child: "${child.name}" (type: ${child.type})`, 'log');
      if (child.name && child.name.includes('=[X] ')) {
        const oldName = child.name;
        // Replace "=[X] " with "=" to remove the prefix
        child.name = child.name.replace('=[X] ', '=');
        log(`✅ Cleaned variant name: "${oldName}" → "${child.name}"`, 'log');
      } else {
        log(`⚠️ Child name doesn't contain =[X]: "${child.name}"`, 'log');
      }
    });
  } else {
    log(`❌ ComponentSet has no children`, 'error');
  }
  
  // Add properties to ComponentSet and bind them to elements in all variants
  await addPropertiesToComponentSet(componentSet, componentProps);
  log(`✅ Properties added to ComponentSet and bound to variant elements`, 'log');
  
  // Clean up temporary components
  const allPages = figma.root.children;
  allPages.forEach(page => {
    if (page.type === 'PAGE') {
      const pageChildren = [...page.children];
      pageChildren.forEach(child => {
        if (child.name && child.name.startsWith('[X] ')) {
          child.remove();
          log(`🧹 Cleaned up temporary component: ${child.name}`, 'log');
        }
      });
    }
  });
  
  log(`✅ Button ComponentSet created with properties: ${componentSet.name}`, 'log');
  return componentSet;
}

async function addPropertiesToComponentSet(componentSet: ComponentSetNode, componentProps: any): Promise<void> {
  log(`📋 Adding properties to ComponentSet: ${componentSet.name}`, 'log');
  
  try {
    const propertyIds: { [key: string]: string } = {};
    
    // Add all properties from JSON and store their IDs
    for (const [propName, propConfig] of Object.entries(componentProps)) {
      const config = propConfig as any;
      
      switch (config.type) {
        case 'TEXT':
          propertyIds[propName] = componentSet.addComponentProperty(propName, 'TEXT', config.defaultValue || '');
          log(`✅ Added TEXT property: ${propName} with ID: ${propertyIds[propName]}`, 'log');
          break;
          
        case 'BOOLEAN':
          propertyIds[propName] = componentSet.addComponentProperty(propName, 'BOOLEAN', config.defaultValue || false);
          log(`✅ Added BOOLEAN property: ${propName} with ID: ${propertyIds[propName]}`, 'log');
          break;
          
        case 'INSTANCE_SWAP':
          log(`🔧 Implementing INSTANCE_SWAP property: ${propName}`, 'log');
          
          try {
            // Find ALL icon ComponentSets with [Icon] prefix using deep search
            const iconComponentSets = findAllComponentSetsDeep(figma.currentPage, '[Icon]');
            
            log(`🔍 Found ${iconComponentSets.length} icon ComponentSets with [Icon] prefix`, 'log');
            iconComponentSets.forEach(cs => log(`  - ${cs.name}`, 'log'));
            
            if (iconComponentSets.length > 0) {
              // Use first ComponentSet as default, but include all in preferredValues
              const defaultIconComponentSet = iconComponentSets[0];
              const defaultIconComponent = defaultIconComponentSet.defaultVariant;
              
              if (defaultIconComponent) {
                log(`✅ Using default from: ${defaultIconComponentSet.name}`, 'log');
                
                // Create preferredValues from ALL icon ComponentSets  
                const preferredValues: any[] = [];
                
                iconComponentSets.forEach(componentSet => {
                  preferredValues.push({
                    type: 'COMPONENT_SET' as const,
                    key: componentSet.id // Use ComponentSet ID
                  });
                  log(`📋 Added ComponentSet to preferred values: ${componentSet.name} (ID: ${componentSet.id})`, 'log');
                });
                
                log(`🔧 Creating INSTANCE_SWAP with ${preferredValues.length} ComponentSets as preferred values`, 'log');
                
                propertyIds[propName] = componentSet.addComponentProperty(
                  propName, 
                  'INSTANCE_SWAP', 
                  defaultIconComponent.id, // Default variant ID from first ComponentSet
                  { preferredValues } // All icon ComponentSets as preferred values
                );
                
                log(`✅ Created INSTANCE_SWAP property ${propName} with ${preferredValues.length} ComponentSets`, 'log');
              } else {
                log(`❌ No default variant found in ComponentSet: ${defaultIconComponentSet.name}`, 'error');
              }
            } else {
              log(`❌ No icon ComponentSets found with [Icon] prefix. Available components:`, 'error');
              figma.currentPage.children.forEach(child => {
                if (child.type === 'COMPONENT_SET') {
                  log(`  - ComponentSet: ${child.name}`, 'log');
                }
              });
            }
          } catch (error: any) {
            log(`❌ Error creating INSTANCE_SWAP property ${propName}: ${error.message}`, 'error');
          }
          break;
          
        case 'VARIANT':
          // VARIANT properties are handled by the component set structure itself
          log(`✅ VARIANT property recognized: ${propName}`, 'log');
          break;
          
        default:
          log(`⚠️ Unknown property type: ${config.type} for ${propName}`, 'log');
      }
    }
    
    // Now bind these properties to elements in ALL variants using property IDs
    if (componentSet.children) {
      componentSet.children.forEach((variant: any) => {
        if (variant.type === 'COMPONENT') {
          log(`🔗 Binding properties in variant: ${variant.name}`, 'log');
          
          // Bind text property
          if (propertyIds.text) {
            const textElement = variant.findChild((child: any) => child.name === 'Text');
            if (textElement && textElement.type === 'TEXT') {
              textElement.componentPropertyReferences = { characters: propertyIds.text };
              log(`✅ Bound text property in variant: ${variant.name}`, 'log');
            }
          }
          
          // Bind enableIconLeft property
          if (propertyIds.enableIconLeft) {
            const leftIcon = variant.findChild((child: any) => child.name === 'Left Icon Instance');
            if (leftIcon) {
              leftIcon.componentPropertyReferences = { visible: propertyIds.enableIconLeft };
              log(`✅ Bound Left Icon Instance visibility in variant: ${variant.name}`, 'log');
            }
          }
          
          // Bind enableIconRight property
          if (propertyIds.enableIconRight) {
            const rightIcon = variant.findChild((child: any) => child.name === 'Right Icon Instance');
            if (rightIcon) {
              rightIcon.componentPropertyReferences = { visible: propertyIds.enableIconRight };
              log(`✅ Bound Right Icon Instance visibility in variant: ${variant.name}`, 'log');
            }
          }
          
          // Bind iconLeft INSTANCE_SWAP property
          if (propertyIds.iconLeft) {
            const leftIconInstance = variant.findChild((child: any) => child.name === 'Left Icon Instance');
            if (leftIconInstance && leftIconInstance.type === 'INSTANCE') {
              try {
                leftIconInstance.componentPropertyReferences = { 
                  ...leftIconInstance.componentPropertyReferences, 
                  mainComponent: propertyIds.iconLeft 
                };
                log(`✅ Bound iconLeft INSTANCE_SWAP in variant: ${variant.name}`, 'log');
              } catch (swapError: any) {
                log(`❌ Failed to bind iconLeft INSTANCE_SWAP: ${swapError.message}`, 'error');
              }
            } else {
              log(`⚠️ Left Icon Instance not found or is not an INSTANCE for INSTANCE_SWAP binding`, 'log');
            }
          }
          
          // Bind iconRight INSTANCE_SWAP property  
          if (propertyIds.iconRight) {
            const rightIconInstance = variant.findChild((child: any) => child.name === 'Right Icon Instance');
            if (rightIconInstance && rightIconInstance.type === 'INSTANCE') {
              try {
                rightIconInstance.componentPropertyReferences = { 
                  ...rightIconInstance.componentPropertyReferences, 
                  mainComponent: propertyIds.iconRight 
                };
                log(`✅ Bound iconRight INSTANCE_SWAP in variant: ${variant.name}`, 'log');
              } catch (swapError: any) {
                log(`❌ Failed to bind iconRight INSTANCE_SWAP: ${swapError.message}`, 'error');
              }
            } else {
              log(`⚠️ Right Icon Instance not found or is not an INSTANCE for INSTANCE_SWAP binding`, 'log');
            }
          }
          
          // Bind addLineBeforeIconLeft property
          if (propertyIds.addLineBeforeIconLeft) {
            const lineBeforeLeftIcon = variant.findChild((child: any) => child.name === 'Line Before Left Icon');
            if (lineBeforeLeftIcon) {
              lineBeforeLeftIcon.componentPropertyReferences = { visible: propertyIds.addLineBeforeIconLeft };
              log(`✅ Bound Line Before Left Icon visibility in variant: ${variant.name}`, 'log');
            }
          }
          
          // Bind addLineBeforeIconRight property  
          if (propertyIds.addLineBeforeIconRight) {
            const lineBeforeRightIcon = variant.findChild((child: any) => child.name === 'Line Before Right Icon');
            if (lineBeforeRightIcon) {
              lineBeforeRightIcon.componentPropertyReferences = { visible: propertyIds.addLineBeforeIconRight };
              log(`✅ Bound Line Before Right Icon visibility in variant: ${variant.name}`, 'log');
            }
          }
        }
      });
    }
    
    log(`✅ All properties bound successfully using property IDs in ComponentSet`, 'log');
    
  } catch (error: any) {
    log(`❌ Failed to add properties to ComponentSet: ${error.message}`, 'error');
  }
}

async function addComponentProperties(componentSet: ComponentSetNode, componentProps: any): Promise<void> {
  log(`📋 Adding ${Object.keys(componentProps).length} component properties to ${componentSet.name}`, 'log');
  
  // Check if componentSet has the method
  if (typeof componentSet.addComponentProperty !== 'function') {
    log(`❌ ComponentSet does not have addComponentProperty method`, 'error');
    return;
  }
  
  for (const [propName, propConfig] of Object.entries(componentProps)) {
    const config = propConfig as any;
    log(`🔧 Processing property: ${propName} of type ${config.type}`, 'log');
    
    try {
      switch (config.type) {
        case 'VARIANT':
          // VARIANT properties are handled by the ComponentSet structure itself
          // We don't need to manually add them since they're defined by the variant names
          if (Array.isArray(config.variantOptions) && config.variantOptions[0]?.label) {
            const variantLabels = config.variantOptions.map((option: any) => option.label);
            log(`✅ Variant property mapped: ${propName} with options: ${variantLabels.join(', ')}`, 'log');
            
            // Store property mappings for later use
            componentSet.setPluginData(`${propName}_mappings`, JSON.stringify(config.variantOptions));
          } else {
            log(`✅ Legacy variant property: ${propName} = ${config.defaultValue}`, 'log');
          }
          break;
          
        case 'BOOLEAN':
          try {
            componentSet.addComponentProperty(propName, 'BOOLEAN', config.defaultValue || false);
            log(`✅ Boolean property added: ${propName} = ${config.defaultValue}`, 'log');
          } catch (boolError: any) {
            log(`❌ Failed to add boolean property ${propName}: ${boolError.message}`, 'error');
          }
          break;
          
        case 'TEXT':
          try {
            componentSet.addComponentProperty(propName, 'TEXT', config.defaultValue || '');
            log(`✅ Text property added: ${propName} = "${config.defaultValue}"`, 'log');
          } catch (textError: any) {
            log(`❌ Failed to add text property ${propName}: ${textError.message}`, 'error');
          }
          break;
          
        case 'INSTANCE_SWAP':
          try {
            // For INSTANCE_SWAP, we'll skip this for now as it requires more complex setup
            log(`⚠️ Instance swap property skipped for now: ${propName} → ${config.defaultValue}`, 'warn');
            // TODO: Implement proper instance swap after other properties work
          } catch (instanceError: any) {
            log(`❌ Failed to add instance swap property ${propName}: ${instanceError.message}`, 'error');
          }
          break;
          
        default:
          log(`⚠️ Unknown property type: ${config.type}`, 'warn');
      }
    } catch (error: any) {
      log(`❌ Failed to process property ${propName}: ${error.message}`, 'error');
    }
  }
  
  // Log final component properties count
  try {
    const finalProps = componentSet.componentPropertyDefinitions;
    log(`📊 ComponentSet now has ${Object.keys(finalProps || {}).length} properties: ${Object.keys(finalProps || {}).join(', ')}`, 'log');
  } catch (propError: any) {
    log(`❌ Could not read component properties: ${propError.message}`, 'error');
  }
}


function findComponentByName(name: string): ComponentSetNode | ComponentNode | null {
  // Search through all pages for the component
  for (const page of figma.root.children) {
    if (page.type === 'PAGE') {
      for (const child of page.children) {
        if (child.name === name) {
          if (child.type === 'COMPONENT_SET' || child.type === 'COMPONENT') {
            return child as ComponentSetNode | ComponentNode;
          }
        }
      }
    }
  }
  return null;
}

export async function renderButton(nodeData: any): Promise<ComponentSetNode | SceneNode> {
  // Check if using new component properties system
  if (nodeData.componentProperties && nodeData.variants) {
    return await renderButtonWithProperties(nodeData);
  }
  
  // Check if using legacy variant structure
  if (nodeData.variants && Array.isArray(nodeData.variants)) {
    const baseProperties = nodeData.properties || {};
    
    // Create variants directly for ComponentSet
    const componentVariants: ComponentNode[] = [];
    const variantIds: string[] = [];
    
    for (const variant of nodeData.variants) {
      const variantComponent = await createButtonVariant(
        variant.name,
        variant,
        baseProperties
      );
      // Don't append to page - combineAsVariants will handle this
      componentVariants.push(variantComponent);
      variantIds.push(variantComponent.id);
    }
    
    // If only one variant, return it directly
    if (componentVariants.length === 1) {
      log(`✅ Single button variant created: ${componentVariants[0].name}`, 'log');
      return componentVariants[0];
    }
    
    // Position variants before combining (required for combineAsVariants)
    // Use better spacing and organize logically by states/sizes
    const horizontalSpacing = 160; // More space between columns
    const verticalSpacing = 80;    // Space between rows
    let maxItemsPerRow = 4; // Limit items per row for better organization
    
    // Sort variants for better visual organization
    const sortedVariants = componentVariants.sort((a, b) => {
      // Extract state and size from name for sorting
      const aState = a.name.includes('default') ? 0 : a.name.includes('hover') ? 1 : a.name.includes('active') ? 2 : 3;
      const bState = b.name.includes('default') ? 0 : b.name.includes('hover') ? 1 : b.name.includes('active') ? 2 : 3;
      return aState - bState;
    });
    
    sortedVariants.forEach((variant, index) => {
      const row = Math.floor(index / maxItemsPerRow);
      const col = index % maxItemsPerRow;
      variant.x = col * horizontalSpacing;
      variant.y = row * verticalSpacing;
    });
    
    // Create ComponentSet (this moves variants into the ComponentSet)
    log(`🔧 Creating ComponentSet with ${componentVariants.length} variants`, 'log');
    const componentSet = figma.combineAsVariants(componentVariants, figma.currentPage);
    componentSet.name = nodeData.name || 'Button System';
    
    // Remove [X] prefix from variant names inside ComponentSet
    log(`🔍 ComponentSet has ${componentSet.children?.length || 0} children`, 'log');
    if (componentSet.children) {
      componentSet.children.forEach((child: any) => {
        log(`🔍 Checking child: "${child.name}" (type: ${child.type})`, 'log');
        if (child.name && child.name.includes('=[X] ')) {
          const oldName = child.name;
          // Replace "=[X] " with "=" to remove the prefix  
          child.name = child.name.replace('=[X] ', '=');
          log(`✅ Cleaned variant name: "${oldName}" → "${child.name}"`, 'log');
        } else {
          log(`⚠️ Child name doesn't contain =[X]: "${child.name}"`, 'log');
        }
      });
    } else {
      log(`❌ ComponentSet has no children`, 'error');
    }
    
    // Clean up any remaining components with [X] prefix on current page
    const currentPageChildren = [...figma.currentPage.children];
    currentPageChildren.forEach(child => {
      if (child.name && child.name.startsWith('[X] ')) {
        child.remove();
        log(`🧹 Cleaned up temporary component: ${child.name}`, 'log');
      }
    });
    
    // Clean up [X] prefixed components on other pages as well
    figma.root.children.forEach(page => {
      if (page !== figma.currentPage && page.type === 'PAGE') {
        const pageChildren = [...page.children];
        pageChildren.forEach(child => {
          if (child.name && child.name.startsWith('[X] ')) {
            child.remove();
            log(`🧹 Cleaned up temporary component on ${page.name}: ${child.name}`, 'log');
          }
        });
      }
    });
    
    log(`✅ ComponentSet created: ${componentSet.name}`, 'log');
    
    return componentSet;
  }
  
  // If no variants provided, throw error
  throw new Error('Button requires variants array. Please provide variants with getFromParent system.');
}
