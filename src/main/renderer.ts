import { log, hexToRgb } from "./utils";
import { renderButton } from "../renderers/button/button";
import { renderFrame } from "../renderers/frame/frame";
import { renderText } from "../renderers/text/text";
import { renderRectangle } from "../renderers/rectangle/rectangle";
// Atomic Design imports
import { renderIcon } from "../renderers/atoms/icon";
import { renderInput } from "../renderers/atoms/input";
import { renderBadge } from "../renderers/atoms/badge";
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
    await figma.loadFontAsync(props.font || { family: 'Inter', style: 'Regular' });
    node.characters = props.content;
    if (props.fontSize) node.fontSize = props.fontSize;
    if (props.font) node.fontName = props.font;
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
      node = renderText();
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

export async function renderTree(json: any) {
  log("Rozpoczynam renderowanie...");
  const pageData = json.pages[0];
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
