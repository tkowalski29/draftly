import { loadFontSafely } from "../../main/utils/index";

export async function renderInput(nodeData: any): Promise<FrameNode> {
  const inputContainer = figma.createFrame();
  inputContainer.layoutMode = 'VERTICAL';
  inputContainer.itemSpacing = 4;
  inputContainer.primaryAxisSizingMode = 'FIXED';
  inputContainer.counterAxisSizingMode = 'AUTO';
  
  const width = nodeData.properties?.width || 280;
  inputContainer.resize(width, inputContainer.height);
  
  // Label (jeśli istnieje)
  if (nodeData.properties?.label) {
    const label = figma.createText();
    const font = await loadFontSafely('Inter', 'Medium');
    label.fontName = font;
    label.characters = nodeData.properties.label;
    label.fontSize = 14;
    label.fills = [{ type: 'SOLID', color: { r: 0.17, g: 0.24, b: 0.31 }, opacity: 1 }];
    inputContainer.appendChild(label);
  }
  
  // Input field
  const inputField = figma.createFrame();
  inputField.resize(width, 40);
  inputField.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
  inputField.strokes = [{ type: 'SOLID', color: { r: 0.82, g: 0.84, b: 0.87 }, opacity: 1 }];
  inputField.strokeWeight = 1;
  inputField.cornerRadius = 6;
  inputField.layoutMode = 'HORIZONTAL';
  inputField.primaryAxisAlignItems = 'CENTER';
  inputField.paddingLeft = 12;
  inputField.paddingRight = 12;
  
  // Placeholder text
  if (nodeData.properties?.placeholder) {
    const placeholderText = figma.createText();
    const font = await loadFontSafely('Inter', 'Regular');
    placeholderText.fontName = font;
    placeholderText.characters = nodeData.properties.placeholder;
    placeholderText.fontSize = 14;
    placeholderText.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 }, opacity: 1 }];
    inputField.appendChild(placeholderText);
  }
  
  inputContainer.appendChild(inputField);
  
  // Helper text (jeśli istnieje)
  if (nodeData.properties?.helperText) {
    const helper = figma.createText();
    const font = await loadFontSafely('Inter', 'Regular');
    helper.fontName = font;
    helper.characters = nodeData.properties.helperText;
    helper.fontSize = 12;
    helper.fills = [{ type: 'SOLID', color: { r: 0.42, g: 0.45, b: 0.5 }, opacity: 1 }];
    inputContainer.appendChild(helper);
  }
  
  return inputContainer;
}