import { loadFontSafely } from "../../main/utils/index";

export async function renderBadge(nodeData: any): Promise<FrameNode> {
  const badge = figma.createFrame();
  badge.layoutMode = 'HORIZONTAL';
  badge.primaryAxisAlignItems = 'CENTER';
  badge.counterAxisAlignItems = 'CENTER';
  badge.primaryAxisSizingMode = 'AUTO';
  badge.counterAxisSizingMode = 'AUTO';
  
  // Padding based on size
  const size = nodeData.properties?.size || 'medium';
  let padding = { top: 4, bottom: 4, left: 8, right: 8 };
  let fontSize = 12;
  
  if (size === 'small') {
    padding = { top: 2, bottom: 2, left: 6, right: 6 };
    fontSize = 10;
  } else if (size === 'large') {
    padding = { top: 6, bottom: 6, left: 12, right: 12 };
    fontSize = 14;
  }
  
  badge.paddingTop = padding.top;
  badge.paddingBottom = padding.bottom;
  badge.paddingLeft = padding.left;
  badge.paddingRight = padding.right;
  
  // Variant colors
  const variant = nodeData.properties?.variant || 'default';
  let bgColor = { r: 0.94, g: 0.95, b: 0.96 }; // Gray
  let textColor = { r: 0.17, g: 0.24, b: 0.31 }; // Dark gray
  
  switch (variant) {
    case 'primary':
      bgColor = { r: 0.86, g: 0.92, b: 1 }; // Blue
      textColor = { r: 0.23, g: 0.4, b: 1 };
      break;
    case 'success':
      bgColor = { r: 0.86, g: 0.99, b: 0.91 }; // Green
      textColor = { r: 0.09, g: 0.71, b: 0.51 };
      break;
    case 'warning':
      bgColor = { r: 0.99, g: 0.95, b: 0.78 }; // Yellow
      textColor = { r: 0.57, g: 0.25, b: 0.09 };
      break;
    case 'danger':
      bgColor = { r: 0.99, g: 0.88, b: 0.88 }; // Red
      textColor = { r: 0.94, g: 0.27, b: 0.27 };
      break;
  }
  
  badge.fills = [{ type: 'SOLID', color: bgColor, opacity: 1 }];
  badge.cornerRadius = nodeData.properties?.cornerRadius || 12;
  
  // Badge text
  if (nodeData.properties?.content || nodeData.text) {
    const badgeText = figma.createText();
    const font = await loadFontSafely('Inter', 'Medium');
    badgeText.fontName = font;
    badgeText.characters = nodeData.properties?.content || nodeData.text || 'Badge';
    badgeText.fontSize = fontSize;
    badgeText.fills = [{ type: 'SOLID', color: textColor, opacity: 1 }];
    badge.appendChild(badgeText);
  }
  
  return badge;
}