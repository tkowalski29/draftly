import { log, hexToRgb, loadFontSafely } from "./utils/index";
import { renderButton } from "../renderers/button/button";
import { renderFrame } from "../renderers/frame/frame";
import { renderText } from "../renderers/text/text";
import { renderRectangle } from "../renderers/rectangle/rectangle";
// Atomic Design imports
import { renderIcon } from "../renderers/atoms/icon/icon";
import { renderInput } from "../renderers/atoms/input";
import { renderBadge } from "../renderers/atoms/badge";
import { renderAvatar } from "../renderers/atoms/avatar";
import { renderDivider } from "../renderers/atoms/divider";
import { renderCard } from "../renderers/molecules/card";
import { renderFormField } from "../renderers/molecules/form-field";
import { renderHeader } from "../renderers/organisms/header";
import { renderProductGrid } from "../renderers/organisms/product-grid";


async function applyProperties(node: SceneNode, props: any) {
  if (!props) return;

  // Rozmiar i pozycja
  if (props.x) node.x = props.x;
  if (props.y) node.y = props.y;
  if (node.type === 'FRAME' || node.type === 'RECTANGLE') {
    if (props.width && props.width !== 'HUG') node.resize(props.width, node.height);
    if (props.height && props.height !== 'HUG') node.resize(node.width, props.height);
  }

  // Auto Layout
  if (props.autoLayout && (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE')) {
    node.layoutMode = props.autoLayout.direction === 'HORIZONTAL' ? 'HORIZONTAL' : 'VERTICAL';
    if (props.autoLayout.padding) {
      const p = props.autoLayout.padding;
      node.paddingTop = p.top ?? 0;
      node.paddingBottom = p.bottom ?? 0;
      node.paddingLeft = p.left ?? 0;
      node.paddingRight = p.right ?? 0;
    }
    if (props.autoLayout.spacing) node.itemSpacing = props.autoLayout.spacing;
    if (props.autoLayout.alignment) node.primaryAxisAlignItems = props.autoLayout.alignment;
    if (props.width === 'HUG') node.primaryAxisSizingMode = 'AUTO';
    if (props.height === 'HUG') node.counterAxisSizingMode = 'AUTO';
  }

  // Wygląd
  if (props.fills && 'fills' in node) {
    const fills = props.fills.map((fill: any) => {
      const newFill: SolidPaint = {
        type: 'SOLID',
        color: hexToRgb(fill.color),
        opacity: fill.opacity ?? 1,
      };
      return newFill;
    });
    node.fills = fills;
  }

  if (props.cornerRadius !== undefined && ('cornerRadius' in node || 'topLeftRadius' in node)) {
    if (node.type === 'RECTANGLE') {
      node.cornerRadius = props.cornerRadius;
    } else if (node.type === 'FRAME' || node.type === 'COMPONENT') {
      node.topLeftRadius = props.cornerRadius;
      node.topRightRadius = props.cornerRadius;
      node.bottomLeftRadius = props.cornerRadius;
      node.bottomRightRadius = props.cornerRadius;
    }
  }

  // Właściwości tekstu
  if (props.content && node.type === 'TEXT') {
    const requestedFont = props.font || { family: 'Inter', style: 'Regular' };
    const font = await loadFontSafely(requestedFont.family, requestedFont.style);
    node.fontName = font;
    node.characters = props.content;
    if (props.fontSize) node.fontSize = props.fontSize;
  }

  // Obramowanie
  if (props.stroke && 'strokes' in node) {
    const strokes = props.stroke.map((stroke: any) => {
      const newStroke: SolidPaint = {
        type: 'SOLID',
        color: hexToRgb(stroke.color),
        opacity: stroke.opacity ?? 1,
      };
      return newStroke;
    });
    node.strokes = strokes;
    if (props.strokeWeight) node.strokeWeight = props.strokeWeight;
  }

  // Cienie
  if (props.effects && 'effects' in node) {
    const effects = props.effects.map((effect: any) => {
      if (effect.type === 'DROP_SHADOW') {
        const shadowColor = hexToRgb(effect.color);
        const dropShadow: DropShadowEffect = {
          type: 'DROP_SHADOW',
          color: { ...shadowColor, a: effect.opacity || 0.25 },
          offset: effect.offset || { x: 0, y: 4 },
          radius: effect.radius || 4,
          spread: effect.spread || 0,
          visible: true,
          blendMode: 'NORMAL',
        };
        return dropShadow;
      }
      return effect;
    });
    node.effects = effects;
  }
}

async function renderNode(nodeData: any, parent: BaseNode & ChildrenMixin): Promise<SceneNode | null> {
  let node: SceneNode | null = null;

  switch (nodeData.type) {
    case 'FRAME':
      node = renderFrame();
      break;
    case 'RECTANGLE':
      node = renderRectangle();
      break;
    case 'TEXT':
      node = await renderText(nodeData);
      break;
    case 'BUTTON':
      node = await renderButton(nodeData);
      break;
    // Atomic Design - Atoms
    case 'ICON':
      node = renderIcon(nodeData, parent.type === 'PAGE' ? parent as PageNode : undefined);
      break;
    case 'INPUT':
      node = await renderInput(nodeData);
      break;
    case 'BADGE':
      node = await renderBadge(nodeData);
      break;
    case 'AVATAR':
      node = await renderAvatar(nodeData);
      break;
    case 'DIVIDER':
      node = await renderDivider(nodeData);
      break;
    // Atomic Design - Molecules
    case 'CARD':
      node = await renderCard(nodeData);
      break;
    case 'FORM_FIELD':
      node = await renderFormField(nodeData);
      break;
    // Atomic Design - Organisms
    case 'HEADER':
      node = await renderHeader(nodeData);
      break;
    case 'PRODUCT_GRID':
      node = await renderProductGrid(nodeData);
      break;
    default:
      log(`Nieznany typ węzła: ${nodeData.type}`, 'warn');
      return null;
  }

  if (!node) {
    return null;
  }

  node.name = nodeData.name;
  await applyProperties(node, nodeData.properties);
  
  // Only append if not already a child of parent
  if (node.parent !== parent) {
    parent.appendChild(node);
  }

  if (nodeData.children && 'appendChild' in node) {
    for (const childData of nodeData.children) {
      await renderNode(childData, node as BaseNode & ChildrenMixin);
    }
  }

  return node;
}

// Helper function to ensure we're on the correct page with retry logic
async function ensurePageReady(targetPage: PageNode, context: string): Promise<boolean> {
  const maxRetries = 3;
  const retryDelay = 500; // 0.5 seconds for render-time checks
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Check if we're already on the correct page
    if (figma.currentPage.name === targetPage.name) {
      return true;
    }
    
    log(`🔄 ${context} - Próba ${attempt}/${maxRetries}: Przełączanie na ${targetPage.name}`, 'log');
    
    // Try to switch to the target page
    figma.currentPage = targetPage;
    
    // Wait and verify
    await new Promise(resolve => setTimeout(resolve, attempt === 1 ? 50 : retryDelay));
    
    if (figma.currentPage.name === targetPage.name) {
      log(`✅ ${context} - Strona gotowa: ${targetPage.name}`, 'log');
      return true;
    }
    
    log(`⚠️ ${context} - Nie udało się przełączyć (próba ${attempt}), aktualnie: ${figma.currentPage.name}`, 'warn');
  }
  
  log(`❌ ${context} - Nie udało się przełączyć na ${targetPage.name} po ${maxRetries} próbach`, 'error');
  return false;
}

// Design System folder renderer
function resolveDependenciesFromSettings(folderData: {[key: string]: string}, loadOrder: string[]): string[] {
  const resolved: string[] = [];
  
  // Find files matching the loadOrder from settings
  for (const fileName of loadOrder) {
    const fullPath = Object.keys(folderData).find(path => 
      path.endsWith(`/${fileName}`) || path === fileName
    );
    
    if (fullPath) {
      resolved.push(fullPath);
      log(`📋 Settings order: ${fileName}`, 'log');
    } else {
      log(`⚠️ File specified in settings not found: ${fileName}`, 'warn');
    }
  }
  
  // Add any remaining files not in settings
  Object.keys(folderData).forEach(filePath => {
    if (!resolved.includes(filePath) && !filePath.endsWith('settings.json')) {
      resolved.push(filePath);
      log(`📋 Additional file: ${filePath.split('/').pop()}`, 'log');
    }
  });
  
  log(`🔄 Settings-based order: ${resolved.map(f => f.split('/').pop()).join(' → ')}`);
  return resolved;
}

function resolveDependencies(folderData: {[key: string]: string}): string[] {
  const dependencyGraph: {[file: string]: string[]} = {};
  
  // Parse all files to extract dependencies (which are now filenames)
  Object.keys(folderData).forEach(filePath => {
    try {
      const jsonData = JSON.parse(folderData[filePath]);
      const dependencies = jsonData.dependencies || [];
      
      dependencyGraph[filePath] = [];
      
      // Convert filename dependencies to full paths
      dependencies.forEach((depFileName: string) => {
        // Find the full path for this dependency filename
        const depFullPath = Object.keys(folderData).find(path => 
          path.endsWith(`/${depFileName}`) || path === depFileName
        );
        
        if (depFullPath && depFullPath !== filePath) {
          dependencyGraph[filePath].push(depFullPath);
          log(`📋 Dependency: ${filePath.split('/').pop()} depends on ${depFileName}`);
        } else if (!depFullPath) {
          log(`⚠️ Dependency file not found: ${depFileName} (required by ${filePath.split('/').pop()})`, 'warn');
        }
      });
      
    } catch (error: any) {
      log(`❌ Error parsing dependencies from ${filePath}: ${error.message}`, 'error');
      dependencyGraph[filePath] = [];
    }
  });
  
  // Topological sort to resolve dependency order
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const sorted: string[] = [];
  
  function visit(filePath: string) {
    if (visiting.has(filePath)) {
      log(`⚠️ Circular dependency detected involving ${filePath}`, 'warn');
      return;
    }
    if (visited.has(filePath)) {
      return;
    }
    
    visiting.add(filePath);
    
    // Visit dependencies first
    dependencyGraph[filePath].forEach(dep => visit(dep));
    
    visiting.delete(filePath);
    visited.add(filePath);
    sorted.push(filePath);
  }
  
  // Visit all files
  Object.keys(folderData).forEach(visit);
  
  log(`🔄 Resolved dependency order: ${sorted.map(f => f.split('/').pop()).join(' → ')}`);
  return sorted;
}

export async function renderDesignSystemFolder(folderData: {[key: string]: string}): Promise<void> {
  log(`🎨 Rozpoczynam renderowanie Design Systemu z ${Object.keys(folderData).length} plików`);
  
  // Read settings if available
  let settings = null;
  const settingsPath = Object.keys(folderData).find(path => path.endsWith('settings.json'));
  if (settingsPath) {
    try {
      settings = JSON.parse(folderData[settingsPath]);
      log(`⚙️ Załadowano ustawienia z ${settingsPath.split('/').pop()}`, 'log');
    } catch (error: any) {
      log(`❌ Błąd parsowania ustawień: ${error.message}`, 'error');
    }
  }
  
  // Create main design system page with settings
  const pageName = settings?.designSystem?.pageName || '🤖 Design System';
  const page = figma.createPage();
  page.name = pageName;
  figma.currentPage = page;
  log(`📄 Utworzono stronę: ${pageName}`, 'log');
  
  // Robust page creation verification with retry logic
  let pageVerified = false;
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    log(`🔍 Próba ${attempt}/${maxRetries}: Sprawdzanie czy strona ${pageName} istnieje...`, 'log');
    
    // Wait before checking
    await new Promise(resolve => setTimeout(resolve, attempt === 1 ? 100 : retryDelay));
    
    // Check if page exists and is accessible
    const foundPage = figma.root.children.find((p: any) => p.name === pageName && p.type === 'PAGE');
    
    if (foundPage) {
      figma.currentPage = foundPage as PageNode;
      
      // Verify we can actually use the page
      if (figma.currentPage.name === pageName) {
        log(`✅ Strona ${pageName} zweryfikowana i gotowa (próba ${attempt})`, 'log');
        pageVerified = true;
        break;
      } else {
        log(`⚠️ Próba ${attempt}: Nie udało się przełączyć na stronę ${pageName}, aktualnie: ${figma.currentPage.name}`, 'warn');
      }
    } else {
      log(`❌ Próba ${attempt}: Strona ${pageName} nie została znaleziona`, 'error');
    }
    
    if (attempt < maxRetries) {
      log(`⏰ Czekam ${retryDelay/1000}s przed następną próbą...`, 'log');
    }
  }
  
  if (!pageVerified) {
    log(`❌ Nie udało się zweryfikować strony po ${maxRetries} próbach. Używam aktualnej strony: ${figma.currentPage.name}`, 'error');
  }
  
  // Resolve dependencies and get sorted file order
  const sortedFiles = settings?.dependencies?.loadOrder 
    ? resolveDependenciesFromSettings(folderData, settings.dependencies.loadOrder)
    : resolveDependencies(folderData);
  const componentsByType: {[key: string]: any[]} = {};
  
  for (const filePath of sortedFiles) {
    try {
      const fileName = filePath.split('/').pop() || filePath;
      log(`📝 Przetwarzam plik: ${fileName}`);
      const jsonData = JSON.parse(folderData[filePath]);
      
      if (jsonData && jsonData.pages && jsonData.pages[0]) {
        // Support both old 'children' and new 'nodes' format
        const components = jsonData.pages[0].nodes || jsonData.pages[0].children;
        
        // Group components by type
        if (components && Array.isArray(components)) {
          for (const component of components) {
            const type = component.type;
            if (!componentsByType[type]) {
              componentsByType[type] = [];
            }
            componentsByType[type].push(component);
          }
        }
      }
    } catch (error: any) {
      log(`❌ BŁĄD podczas parsowania ${filePath}: ${error.message}`, 'error');
    }
  }
  
  // Render components organized by Atomic Design hierarchy
  let yOffset = 50;
  const spacing = settings?.designSystem?.organization?.spacing;
  const columnSpacing = spacing?.columnSpacing || 40;
  const baseRowSpacing = spacing?.rowSpacing || 60;
  const sectionSpacing = spacing?.sectionSpacing || 100;
  const cardPadding = spacing?.cardPadding || 32;
  
  // Define atomic design order from settings or use default
  let atomicOrder: {[key: string]: number} = {};
  
  if (settings?.designSystem?.atomicDesign?.enabled) {
    // Build atomic order from settings
    const hierarchy = settings.designSystem.atomicDesign.hierarchy;
    Object.entries(hierarchy).forEach(([, levelData]: [string, any]) => {
      const level = levelData.level;
      levelData.types.forEach((type: string) => {
        atomicOrder[type] = level;
      });
    });
    log(`⚙️ Using atomic design order from settings`, 'log');
  } else {
    // Default atomic design order
    atomicOrder = {
      'ICON': 0, 'BADGE': 1, 'AVATAR': 1, 'INPUT': 1, 'TEXT': 1, 'BUTTON': 2, 'DIVIDER': 1,
      'CARD': 3, 'FORM_FIELD': 3,
      'HEADER': 4, 'PRODUCT_GRID': 4
    };
    log(`⚙️ Using default atomic design order`, 'log');
  }
  
  // Create a dependency-aware component type ordering
  // First collect all component types from all files in dependency order
  const componentTypeOrder: string[] = [];
  const processedTypes = new Set<string>();
  
  for (const filePath of sortedFiles) {
    try {
      const jsonData = JSON.parse(folderData[filePath]);
      if (jsonData && jsonData.pages && jsonData.pages[0]) {
        const components = jsonData.pages[0].nodes || jsonData.pages[0].children;
        if (components && Array.isArray(components)) {
          for (const component of components) {
            const type = component.type;
            if (type && !processedTypes.has(type) && componentsByType[type]) {
              componentTypeOrder.push(type);
              processedTypes.add(type);
              log(`🔧 Added ${type} to render order from ${filePath.split('/').pop()}`);
            }
          }
        }
      }
    } catch (error: any) {
      // Continue with next file
    }
  }
  
  // Add any remaining component types that weren't in the dependency files (fallback)
  Object.keys(componentsByType).forEach(type => {
    if (!processedTypes.has(type)) {
      componentTypeOrder.push(type);
      log(`⚠️ Added ${type} to render order (fallback - not in dependency files)`);
    }
  });
  
  const sortedComponentTypes = componentTypeOrder;
  
  
  let currentAtomicLevel = 0;
  
  for (const componentType of sortedComponentTypes) {
    const components = componentsByType[componentType];
    const newAtomicLevel = atomicOrder[componentType as keyof typeof atomicOrder] || 999;
    
    if (components.length > 0) {
      // Add extra spacing when moving to a new atomic design level
      if (currentAtomicLevel !== 0 && newAtomicLevel > currentAtomicLevel) {
        yOffset += sectionSpacing;
      }
      currentAtomicLevel = newAtomicLevel;
      
      log(`📦 Renderuję ${components.length} komponentów typu ${componentType}`);
      
      // Create white background card for this component type
      const sectionCard = figma.createFrame();
      sectionCard.name = `${componentType} Section`;
      sectionCard.fills = [{
        type: 'SOLID',
        color: { r: 1, g: 1, b: 1 },
        opacity: 1
      }];
      sectionCard.cornerRadius = 12;
      sectionCard.effects = [{
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.08 },
        offset: { x: 0, y: 2 },
        radius: 8,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL'
      }];
      
      let xOffset = 50;
      let maxRowHeight = 0; // Track tallest component in current row
      
      let minX = Number.MAX_VALUE;
      let maxX = 0;
      
      // Special handling for BUTTON and ICON types - create component set with variants
      if ((componentType === 'BUTTON' || componentType === 'ICON') && components.length > 0) {
        // Handle multiple button/icon variants
        for (const component of components) {
          try {
            // Log current page before rendering
            log(`🔍 Current page before rendering ${componentType}: ${figma.currentPage.name}`, 'log');
            
            // Ensure we're on the correct page before rendering using robust retry logic
            const pageReady = await ensurePageReady(page, `Renderowanie ${componentType}`);
            
            // Create component set directly without using renderNode
            let componentSet;
            if (componentType === 'BUTTON') {
              componentSet = await renderButton(component);
            } else {
              log(`🔧 About to call renderIcon with targetPage: ${page.name}`, 'log');
              // Set page one more time right before the call
              figma.currentPage = page;
              componentSet = renderIcon(component, page);
              log(`🔧 renderIcon returned, currentPage is now: ${figma.currentPage.name}`, 'log');
            }
            
            // Log current page after rendering and component's page
            log(`🔍 Current page after rendering: ${figma.currentPage.name}`, 'log');
            log(`🔍 Component created on page: ${componentSet.parent?.name || 'unknown'}`, 'log');
            
            // Position the ComponentSet with proper spacing
            componentSet.x = xOffset + cardPadding;
            componentSet.y = yOffset + cardPadding;
            
            // Get the component name
            let componentName = component.name || `${componentType} Component`;
            componentSet.name = componentName;
            
            // Track bounds
            minX = Math.min(minX, componentSet.x);
            maxX = Math.max(maxX, componentSet.x + componentSet.width);
            maxRowHeight = Math.max(maxRowHeight, componentSet.height);
            
            // Move to next column for next component variant
            xOffset += componentSet.width + columnSpacing;
            
            log(`✅ Stworzono ${componentName} ComponentSet z wariantami`);
            
          } catch (error: any) {
            log(`❌ BŁĄD tworzenia ComponentSet ${componentType}: ${error.message}`, 'error');
            
            // Fallback to regular rendering for this specific component
            try {
              // Ensure we're on the correct page before rendering using robust retry logic
              await ensurePageReady(page, 'Fallback rendering');
              const renderedComponent = await renderNode(component, page);
              if (renderedComponent) {
                renderedComponent.x = xOffset + cardPadding;
                renderedComponent.y = yOffset + cardPadding;
                
                minX = Math.min(minX, renderedComponent.x);
                maxX = Math.max(maxX, renderedComponent.x + renderedComponent.width);
                maxRowHeight = Math.max(maxRowHeight, renderedComponent.height);
                
                xOffset += renderedComponent.width + columnSpacing;
              }
            } catch (fallbackError: any) {
              log(`❌ BŁĄD renderowania ${component.name}: ${fallbackError.message}`, 'error');
            }
          }
        }
      } else {
        // Regular rendering for other component types
        for (const component of components) {
          try {
            // Ensure we're on the correct page before rendering using robust retry logic
            await ensurePageReady(page, 'Regular rendering');
            const renderedComponent = await renderNode(component, page);
            if (renderedComponent) {
              // Position component with padding from card edge
              renderedComponent.x = xOffset + cardPadding;
              renderedComponent.y = yOffset + cardPadding;
              
              // Track bounds for card sizing
              minX = Math.min(minX, renderedComponent.x);
              maxX = Math.max(maxX, renderedComponent.x + renderedComponent.width);
              
              // Track the tallest component in this row
              maxRowHeight = Math.max(maxRowHeight, renderedComponent.height);
              
              // Update x position for next component in row  
              xOffset += renderedComponent.width + columnSpacing;
            }
          } catch (error: any) {
            log(`❌ BŁĄD renderowania ${component.name}: ${error.message}`, 'error');
          }
        }
      }
      
      // Size and position the background card
      if (minX !== Number.MAX_VALUE) {
        const cardWidth = maxX - minX + (cardPadding * 2) + columnSpacing;
        const cardHeight = maxRowHeight + (cardPadding * 2);
        
        sectionCard.x = minX - cardPadding;
        sectionCard.y = yOffset;
        sectionCard.resize(cardWidth, cardHeight);
        
        // Move card to back so components appear on top
        page.insertChild(0, sectionCard);
      }
      
      // Move to next row based on actual tallest component height + spacing + card padding
      yOffset += maxRowHeight + baseRowSpacing + (cardPadding * 2);
    }
  }
  
  log(`✅ Design System wyrenderowany pomyślnie z ${Object.keys(componentsByType).length} typów komponentów`);
  figma.notify('✅ Design System wyrenderowany pomyślnie!');
}

export async function renderTree(json: any, importType?: string) {
  log("Rozpoczynam renderowanie...");
  
  // Handle folder import (design system)
  if (importType === 'design-system' && typeof json === 'object' && !json.pages) {
    await renderDesignSystemFolder(json);
    return;
  }
  
  // Handle regular JSON file
  const pageData = json.pages?.[0];
  if (!pageData) {
    log('Brak zdefiniowanych stron w pliku JSON.', 'error');
    return;
  }

  const page = figma.currentPage; // Użyjemy aktualnej strony
  page.name = pageData.name;

  // Support both old 'children' and new 'nodes' format
  const nodeDataArray = pageData.nodes || pageData.children || [];
  for (const nodeData of nodeDataArray) {
    await renderNode(nodeData, page);
  }

  log("Renderowanie zakończone.");
  figma.notify('✅ Renderowanie zakończone!');
}
