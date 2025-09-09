import { loadFontSafely } from "../../main/utils/index";

export async function renderCard(nodeData: any): Promise<FrameNode> {
  const card = figma.createFrame();
  card.layoutMode = 'VERTICAL';
  card.primaryAxisSizingMode = 'AUTO';
  card.counterAxisSizingMode = 'AUTO';
  
  const width = nodeData.properties?.width || 320;
  card.resize(width, card.height);
  
  // Card styling
  card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
  card.cornerRadius = nodeData.properties?.cornerRadius || 12;
  
  // Shadow
  card.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.1 },
    offset: { x: 0, y: 4 },
    radius: 12,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL'
  }];
  
  // Image (jeśli istnieje)
  if (nodeData.properties?.image) {
    const imageContainer = figma.createRectangle();
    imageContainer.resize(width, nodeData.properties.imageHeight || 180);
    imageContainer.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 }, opacity: 1 }];
    imageContainer.topLeftRadius = card.cornerRadius as number;
    imageContainer.topRightRadius = card.cornerRadius as number;
    card.appendChild(imageContainer);
  }
  
  // Content container
  const content = figma.createFrame();
  content.layoutMode = 'VERTICAL';
  content.itemSpacing = 12;
  content.paddingTop = 20;
  content.paddingBottom = 20;
  content.paddingLeft = 20;
  content.paddingRight = 20;
  content.primaryAxisSizingMode = 'AUTO';
  content.counterAxisSizingMode = 'FIXED';
  content.resize(width, content.height);
  
  // Title
  if (nodeData.properties?.title) {
    const title = figma.createText();
    const titleFont = await loadFontSafely('Inter', 'Bold');
    title.fontName = titleFont;
    title.characters = nodeData.properties.title;
    title.fontSize = 18;
    title.fills = [{ type: 'SOLID', color: { r: 0.11, g: 0.11, b: 0.11 }, opacity: 1 }];
    content.appendChild(title);
  }
  
  // Description
  if (nodeData.properties?.description) {
    const description = figma.createText();
    const descFont = await loadFontSafely('Inter', 'Regular');
    description.fontName = descFont;
    description.characters = nodeData.properties.description;
    description.fontSize = 14;
    description.fills = [{ type: 'SOLID', color: { r: 0.42, g: 0.45, b: 0.5 }, opacity: 1 }];
    content.appendChild(description);
  }
  
  // Actions container
  if (nodeData.properties?.actions) {
    const actionsContainer = figma.createFrame();
    actionsContainer.layoutMode = 'HORIZONTAL';
    actionsContainer.itemSpacing = 12;
    actionsContainer.primaryAxisSizingMode = 'AUTO';
    actionsContainer.counterAxisSizingMode = 'AUTO';
    actionsContainer.paddingTop = 8;
    
    for (const action of nodeData.properties.actions) {
      const actionButton = figma.createFrame();
      actionButton.layoutMode = 'HORIZONTAL';
      actionButton.primaryAxisAlignItems = 'CENTER';
      actionButton.counterAxisAlignItems = 'CENTER';
      actionButton.paddingLeft = 16;
      actionButton.paddingRight = 16;
      actionButton.paddingTop = 8;
      actionButton.paddingBottom = 8;
      actionButton.cornerRadius = 6;
      actionButton.primaryAxisSizingMode = 'AUTO';
      actionButton.counterAxisSizingMode = 'AUTO';
      
      if (action.variant === 'primary') {
        actionButton.fills = [{ type: 'SOLID', color: { r: 0.23, g: 0.4, b: 1 }, opacity: 1 }];
      } else {
        actionButton.fills = [];
        actionButton.strokes = [{ type: 'SOLID', color: { r: 0.82, g: 0.84, b: 0.87 }, opacity: 1 }];
        actionButton.strokeWeight = 1;
      }
      
      const buttonText = figma.createText();
      const buttonFont = await loadFontSafely('Inter', 'Medium');
      buttonText.fontName = buttonFont;
      buttonText.characters = action.text || 'Action';
      buttonText.fontSize = 14;
      buttonText.fills = [{ 
        type: 'SOLID', 
        color: action.variant === 'primary' 
          ? { r: 1, g: 1, b: 1 } 
          : { r: 0.17, g: 0.24, b: 0.31 }, 
        opacity: 1 
      }];
      
      actionButton.appendChild(buttonText);
      actionsContainer.appendChild(actionButton);
    }
    
    content.appendChild(actionsContainer);
  }
  
  card.appendChild(content);
  return card;
}