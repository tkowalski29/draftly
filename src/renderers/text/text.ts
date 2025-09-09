import { loadFontSafely } from "../../main/utils/index";

export async function renderText(nodeData?: any): Promise<TextNode> {
  const textNode = figma.createText();
  
  if (nodeData) {
    // Load font before setting text
    const requestedFont = nodeData.properties?.font || { family: 'Inter', style: 'Regular' };
    const font = await loadFontSafely(requestedFont.family, requestedFont.style);
    textNode.fontName = font;
    
    textNode.characters = nodeData.properties?.content || nodeData.text || 'Text';
    textNode.fontSize = nodeData.properties?.fontSize || 16;
    
    // Set text color if provided
    if (nodeData.properties?.color) {
      textNode.fills = [{ 
        type: 'SOLID', 
        color: nodeData.properties.color, 
        opacity: nodeData.properties?.opacity || 1 
      }];
    }
  } else {
    const font = await loadFontSafely('Inter', 'Regular');
    textNode.fontName = font;
    textNode.characters = 'Text';
  }
  
  return textNode;
}