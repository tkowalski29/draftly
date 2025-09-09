import { log } from "../utils/index";
import { applyProperties } from "./properties";
import { renderButton } from "../../renderers/button/button";
import { renderFrame } from "../../renderers/frame/frame";
import { renderText } from "../../renderers/text/text";
import { renderRectangle } from "../../renderers/rectangle/rectangle";
// Atomic Design imports
import { renderIcon } from "../../renderers/atoms/icon/icon";
import { renderInput } from "../../renderers/atoms/input";
import { renderBadge } from "../../renderers/atoms/badge";
import { renderAvatar } from "../../renderers/atoms/avatar";
import { renderDivider } from "../../renderers/atoms/divider";
import { renderCard } from "../../renderers/molecules/card";
import { renderFormField } from "../../renderers/molecules/form-field";
import { renderHeader } from "../../renderers/organisms/header";
import { renderProductGrid } from "../../renderers/organisms/product-grid";

/**
 * Render a single node based on its type
 * Main dispatcher for all component types
 */
export async function renderNode(nodeData: any, parent: BaseNode & ChildrenMixin): Promise<SceneNode | null> {
  if (!nodeData.type) {
    log('Brak typu węzła', 'warn');
    return null;
  }

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
      const iconResult = renderIcon(nodeData, parent.type === 'PAGE' ? parent as PageNode : undefined);
      if (Array.isArray(iconResult)) {
        // Handle multiple ComponentSets - append all to parent and return the first one
        iconResult.forEach((componentSet, index) => {
          if (componentSet.parent !== parent) {
            parent.appendChild(componentSet);
          }
          // Position ComponentSets with spacing
          if (index > 0) {
            componentSet.x = iconResult[index - 1].x + iconResult[index - 1].width + 100;
          }
        });
        node = iconResult[0]; // Return first ComponentSet as the "main" node
      } else {
        node = iconResult;
      }
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
  // ICON type array handling is done in the switch case above
  if (node.parent !== parent && nodeData.type !== 'ICON') {
    parent.appendChild(node);
  }

  if (nodeData.children && 'appendChild' in node) {
    for (const childData of nodeData.children) {
      await renderNode(childData, node as BaseNode & ChildrenMixin);
    }
  }

  return node;
}