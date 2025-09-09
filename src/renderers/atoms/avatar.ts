import { loadFontSafely, hexToRgb } from "../../main/utils/index";

export async function renderAvatar(nodeData: any): Promise<FrameNode> {
  const avatar = figma.createFrame();
  avatar.name = nodeData.name;
  
  // Avatar properties
  const size = nodeData.properties?.size || 40;
  const backgroundColor = nodeData.properties?.backgroundColor || '#3B82F6';
  const initials = nodeData.properties?.initials || 'U';
  const imageUrl = nodeData.properties?.imageUrl;
  
  // Create circular avatar
  avatar.resize(size, size);
  avatar.cornerRadius = size / 2; // Perfect circle
  
  if (imageUrl) {
    // TODO: In future, load actual image
    avatar.fills = [{ 
      type: 'SOLID', 
      color: { r: 0.9, g: 0.9, b: 0.9 }, 
      opacity: 1 
    }];
    
    // Add image placeholder text
    const imagePlaceholder = figma.createText();
    const font = await loadFontSafely('Inter', 'Regular');
    imagePlaceholder.fontName = font;
    imagePlaceholder.characters = '📷';
    imagePlaceholder.fontSize = size * 0.4;
    imagePlaceholder.textAlignHorizontal = 'CENTER';
    imagePlaceholder.textAlignVertical = 'CENTER';
    imagePlaceholder.resize(size, size);
    avatar.appendChild(imagePlaceholder);
  } else {
    // Use background color and initials
    const color = hexToRgb(backgroundColor);
    avatar.fills = [{ 
      type: 'SOLID', 
      color: color, 
      opacity: 1 
    }];
    
    // Add initials text
    const initialsText = figma.createText();
    const font = await loadFontSafely('Inter', 'Medium');
    initialsText.fontName = font;
    initialsText.characters = initials.substring(0, 2).toUpperCase();
    initialsText.fontSize = size * 0.4;
    initialsText.textAlignHorizontal = 'CENTER';
    initialsText.textAlignVertical = 'CENTER';
    initialsText.fills = [{ 
      type: 'SOLID', 
      color: { r: 1, g: 1, b: 1 }, 
      opacity: 1 
    }];
    initialsText.resize(size, size);
    avatar.appendChild(initialsText);
  }
  
  return avatar;
}

