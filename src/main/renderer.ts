import { log, hexToRgb, loadFontSafely } from "./utils";
import { renderButton } from "../renderers/button/button";
import { renderFrame } from "../renderers/frame/frame";
import { renderText } from "../renderers/text/text";
import { renderRectangle } from "../renderers/rectangle/rectangle";
// Atomic Design imports
import { renderIcon } from "../renderers/atoms/icon";
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
      node = renderIcon(nodeData);
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
  parent.appendChild(node);

  if (nodeData.children && 'appendChild' in node) {
    for (const childData of nodeData.children) {
      await renderNode(childData, node as BaseNode & ChildrenMixin);
    }
  }

  return node;
}

// Design System folder renderer
export async function renderDesignSystemFolder(folderData: {[key: string]: string}): Promise<void> {
  log(`🎨 Rozpoczynam renderowanie Design Systemu z ${Object.keys(folderData).length} plików`);
  
  // Create main design system page
  const page = figma.createPage();
  page.name = '🤖 Design System';
  figma.currentPage = page;
  
  // Process each file in folder and categorize components
  const sortedFiles = Object.keys(folderData).sort();
  const componentsByType: {[key: string]: any[]} = {};
  
  for (const filePath of sortedFiles) {
    try {
      const fileName = filePath.split('/').pop() || filePath;
      log(`📝 Przetwarzam plik: ${fileName}`);
      const jsonData = JSON.parse(folderData[filePath]);
      
      if (jsonData && jsonData.pages && jsonData.pages[0] && jsonData.pages[0].children) {
        const components = jsonData.pages[0].children;
        
        // Group components by type
        for (const component of components) {
          const type = component.type;
          if (!componentsByType[type]) {
            componentsByType[type] = [];
          }
          componentsByType[type].push(component);
        }
      }
    } catch (error: any) {
      log(`❌ BŁĄD podczas parsowania ${filePath}: ${error.message}`, 'error');
    }
  }
  
  // Render components organized by Atomic Design hierarchy
  let yOffset = 50;
  const columnSpacing = 40;
  const baseRowSpacing = 60; // Minimum spacing between rows
  const sectionSpacing = 100; // Extra spacing between different atomic levels
  
  // Define atomic design order for better organization
  const atomicOrder = {
    // Atoms first (smallest)
    'ICON': 1, 'BADGE': 1, 'AVATAR': 1, 'INPUT': 1, 'TEXT': 1, 'BUTTON': 1, 'DIVIDER': 1,
    // Molecules second (medium)
    'CARD': 2, 'FORM_FIELD': 2,
    // Organisms last (largest)  
    'HEADER': 3, 'PRODUCT_GRID': 3
  };
  
  // Sort component types by atomic design hierarchy
  const sortedComponentTypes = Object.keys(componentsByType).sort((a, b) => {
    const orderA = atomicOrder[a as keyof typeof atomicOrder] || 999;
    const orderB = atomicOrder[b as keyof typeof atomicOrder] || 999;
    return orderA - orderB;
  });
  
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
      const cardPadding = 32;
      
      let minX = Number.MAX_VALUE;
      let maxX = 0;
      
      for (const component of components) {
        try {
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

  for (const nodeData of pageData.children) {
    await renderNode(nodeData, page);
  }

  log("Renderowanie zakończone.");
  figma.notify('✅ Renderowanie zakończone!');
}
