import { loadFontSafely } from "../../main/utils";

export async function renderButton(nodeData: any): Promise<FrameNode> {
  const button = figma.createFrame();
  button.name = nodeData.name || 'Button';
  
  // Ustawienia domyślne dla przycisku
  button.layoutMode = 'HORIZONTAL';
  button.primaryAxisAlignItems = 'CENTER';
  button.counterAxisAlignItems = 'CENTER';
  button.paddingLeft = 16;
  button.paddingRight = 16;
  button.paddingTop = 12;
  button.paddingBottom = 12;
  button.itemSpacing = 8;
  button.cornerRadius = 8;
  
  // Domyślne tło przycisku
  const defaultFill: SolidPaint = {
    type: 'SOLID',
    color: { r: 0.2, g: 0.4, b: 1 }, // Niebieski
    opacity: 1,
  };
  button.fills = [defaultFill];
  
  // Dodaj tekst jeśli jest określony
  if (nodeData.properties?.content || nodeData.text) {
    const textNode = figma.createText();
    const font = await loadFontSafely('Inter', 'Medium');
    textNode.fontName = font;
    textNode.characters = nodeData.properties?.content || nodeData.text || 'Button';
    textNode.fontSize = nodeData.properties?.fontSize || 16;
    
    // Biały tekst na kolorowym tle
    const textFill: SolidPaint = {
      type: 'SOLID',
      color: { r: 1, g: 1, b: 1 },
      opacity: 1,
    };
    textNode.fills = [textFill];
    
    button.appendChild(textNode);
  }
  
  return button;
}