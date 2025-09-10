import { log } from "../utils/index";
import { applyProperties } from "./properties";

/**
 * Simplified fallback node renderer for basic Figma node types
 * Complex components are now handled by specialized renderers
 */
export async function renderNode(nodeData: any, parent: BaseNode & ChildrenMixin): Promise<SceneNode | null> {
  if (!nodeData.type) {
    log('Brak typu węzła', 'warn');
    return null;
  }

  let node: SceneNode | null = null;

  switch (nodeData.type) {
    case 'FRAME':
      node = figma.createFrame();
      break;
    case 'RECTANGLE':
      node = figma.createRectangle();
      break;
    case 'ELLIPSE':
      node = figma.createEllipse();
      break;
    case 'TEXT':
      node = figma.createText();
      break;
    default:
      log(`Fallback renderer - nieobsługiwany typ: ${nodeData.type}`, 'warn');
      return null;
  }

  if (!node) {
    return null;
  }

  node.name = nodeData.name || `${nodeData.type} Node`;
  
  if (nodeData.properties) {
    await applyProperties(node, nodeData.properties);
  }
  
  // Append to parent
  if (node.parent !== parent) {
    parent.appendChild(node);
  }

  // Handle children recursively
  if (nodeData.children && 'appendChild' in node) {
    for (const childData of nodeData.children) {
      await renderNode(childData, node as BaseNode & ChildrenMixin);
    }
  }

  return node;
}