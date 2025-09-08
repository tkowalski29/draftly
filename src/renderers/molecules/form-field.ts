export async function renderFormField(nodeData: any): Promise<FrameNode> {
  const formField = figma.createFrame();
  formField.layoutMode = 'VERTICAL';
  formField.itemSpacing = 8;
  formField.primaryAxisSizingMode = 'FIXED';
  formField.counterAxisSizingMode = 'AUTO';
  
  const width = nodeData.properties?.width || 320;
  formField.resize(width, formField.height);
  
  // Label
  if (nodeData.properties?.label) {
    const labelContainer = figma.createFrame();
    labelContainer.layoutMode = 'HORIZONTAL';
    labelContainer.primaryAxisSizingMode = 'AUTO';
    labelContainer.counterAxisSizingMode = 'AUTO';
    labelContainer.itemSpacing = 4;
    
    const label = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
    label.characters = nodeData.properties.label;
    label.fontSize = 14;
    label.fills = [{ type: 'SOLID', color: { r: 0.17, g: 0.24, b: 0.31 }, opacity: 1 }];
    labelContainer.appendChild(label);
    
    // Required indicator
    if (nodeData.properties?.required) {
      const required = figma.createText();
      await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
      required.characters = '*';
      required.fontSize = 14;
      required.fills = [{ type: 'SOLID', color: { r: 0.94, g: 0.27, b: 0.27 }, opacity: 1 }];
      labelContainer.appendChild(required);
    }
    
    formField.appendChild(labelContainer);
  }
  
  // Input container
  const inputContainer = figma.createFrame();
  inputContainer.layoutMode = 'HORIZONTAL';
  inputContainer.primaryAxisAlignItems = 'CENTER';
  inputContainer.counterAxisSizingMode = 'FIXED';
  inputContainer.resize(width, 44);
  inputContainer.paddingLeft = 12;
  inputContainer.paddingRight = 12;
  
  // Input styling based on state
  const state = nodeData.properties?.state || 'default';
  let borderColor = { r: 0.82, g: 0.84, b: 0.87 }; // Default
  
  if (state === 'focused') {
    borderColor = { r: 0.23, g: 0.4, b: 1 }; // Blue
  } else if (state === 'error') {
    borderColor = { r: 0.94, g: 0.27, b: 0.27 }; // Red
  } else if (state === 'success') {
    borderColor = { r: 0.09, g: 0.71, b: 0.51 }; // Green
  }
  
  inputContainer.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
  inputContainer.strokes = [{ type: 'SOLID', color: borderColor, opacity: 1 }];
  inputContainer.strokeWeight = state === 'focused' ? 2 : 1;
  inputContainer.cornerRadius = 6;
  
  // Prefix icon
  if (nodeData.properties?.prefixIcon) {
    const icon = figma.createRectangle();
    icon.resize(16, 16);
    icon.fills = [{ type: 'SOLID', color: { r: 0.42, g: 0.45, b: 0.5 }, opacity: 1 }];
    inputContainer.appendChild(icon);
    inputContainer.itemSpacing = 8;
  }
  
  // Input text
  const inputText = figma.createText();
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  inputText.characters = nodeData.properties?.value || nodeData.properties?.placeholder || 'Input text';
  inputText.fontSize = 14;
  
  if (nodeData.properties?.value) {
    inputText.fills = [{ type: 'SOLID', color: { r: 0.17, g: 0.24, b: 0.31 }, opacity: 1 }];
  } else {
    inputText.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 }, opacity: 1 }];
  }
  
  inputContainer.appendChild(inputText);
  
  // Suffix icon/button
  if (nodeData.properties?.suffixIcon) {
    inputContainer.itemSpacing = 8;
    const suffixIcon = figma.createRectangle();
    suffixIcon.resize(16, 16);
    suffixIcon.fills = [{ type: 'SOLID', color: { r: 0.42, g: 0.45, b: 0.5 }, opacity: 1 }];
    inputContainer.appendChild(suffixIcon);
  }
  
  formField.appendChild(inputContainer);
  
  // Helper/Error text
  if (nodeData.properties?.helperText || nodeData.properties?.errorText) {
    const helperText = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    helperText.characters = nodeData.properties?.errorText || nodeData.properties?.helperText;
    helperText.fontSize = 12;
    
    if (nodeData.properties?.errorText) {
      helperText.fills = [{ type: 'SOLID', color: { r: 0.94, g: 0.27, b: 0.27 }, opacity: 1 }];
    } else {
      helperText.fills = [{ type: 'SOLID', color: { r: 0.42, g: 0.45, b: 0.5 }, opacity: 1 }];
    }
    
    formField.appendChild(helperText);
  }
  
  return formField;
}