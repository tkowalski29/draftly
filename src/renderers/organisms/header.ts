import { hexToRgb,loadFontSafely } from "../../main/utils";

export async function renderHeader(nodeData: any): Promise<FrameNode> {
  const header = figma.createFrame();
  header.layoutMode = 'HORIZONTAL';
  header.primaryAxisAlignItems = 'CENTER';
  header.counterAxisAlignItems = 'CENTER';
  header.primaryAxisSizingMode = 'FIXED';
  header.counterAxisSizingMode = 'FIXED';
  
  const width = nodeData.properties?.width || 1200;
  header.resize(width, 64);
  header.paddingLeft = 24;
  header.paddingRight = 24;
  
  // Background
  header.fills = [{ 
    type: 'SOLID', 
    color: nodeData.properties?.backgroundColor ? hexToRgb(nodeData.properties.backgroundColor) : { r: 1, g: 1, b: 1 }, 
    opacity: 1 
  }];
  
  // Border bottom
  if (nodeData.properties?.borderBottom !== false) {
    header.strokes = [{ type: 'SOLID', color: { r: 0.88, g: 0.89, b: 0.91 }, opacity: 1 }];
    header.strokeWeight = 1;
    header.strokeAlign = 'OUTSIDE';
  }
  
  // Logo/Brand
  if (nodeData.properties?.logo || nodeData.properties?.brand) {
    const logoContainer = figma.createFrame();
    logoContainer.layoutMode = 'HORIZONTAL';
    logoContainer.primaryAxisAlignItems = 'CENTER';
    logoContainer.itemSpacing = 12;
    logoContainer.primaryAxisSizingMode = 'AUTO';
    logoContainer.counterAxisSizingMode = 'AUTO';
    
    // Logo icon
    if (nodeData.properties?.logo) {
      const logo = figma.createRectangle();
      logo.resize(32, 32);
      logo.fills = [{ type: 'SOLID', color: { r: 0.23, g: 0.4, b: 1 }, opacity: 1 }];
      logo.cornerRadius = 6;
      logoContainer.appendChild(logo);
    }
    
    // Brand name
    if (nodeData.properties?.brand) {
      const brandText = figma.createText();
      const brandFont = await loadFontSafely('Inter', 'Bold');
      brandText.fontName = brandFont;
      brandText.characters = nodeData.properties.brand;
      brandText.fontSize = 18;
      brandText.fills = [{ type: 'SOLID', color: { r: 0.11, g: 0.11, b: 0.11 }, opacity: 1 }];
      logoContainer.appendChild(brandText);
    }
    
    header.appendChild(logoContainer);
  }
  
  // Navigation menu
  if (nodeData.properties?.navigation) {
    const nav = figma.createFrame();
    nav.layoutMode = 'HORIZONTAL';
    nav.primaryAxisAlignItems = 'CENTER';
    nav.itemSpacing = 32;
    nav.primaryAxisSizingMode = 'AUTO';
    nav.counterAxisSizingMode = 'AUTO';
    
    for (const navItem of nodeData.properties.navigation) {
      const navLink = figma.createText();
      const navFont = await loadFontSafely('Inter', navItem.active ? 'Medium' : 'Regular');
      navLink.fontName = navFont;
      navLink.characters = navItem.text;
      navLink.fontSize = 14;
      navLink.fills = [{ 
        type: 'SOLID', 
        color: navItem.active ? { r: 0.23, g: 0.4, b: 1 } : { r: 0.42, g: 0.45, b: 0.5 }, 
        opacity: 1 
      }];
      nav.appendChild(navLink);
    }
    
    header.appendChild(nav);
  }
  
  // Right side actions
  if (nodeData.properties?.actions) {
    const actions = figma.createFrame();
    actions.layoutMode = 'HORIZONTAL';
    actions.primaryAxisAlignItems = 'CENTER';
    actions.itemSpacing = 12;
    actions.primaryAxisSizingMode = 'AUTO';
    actions.counterAxisSizingMode = 'AUTO';
    
    for (const action of nodeData.properties.actions) {
      if (action.type === 'button') {
        const button = figma.createFrame();
        button.layoutMode = 'HORIZONTAL';
        button.primaryAxisAlignItems = 'CENTER';
        button.counterAxisAlignItems = 'CENTER';
        button.paddingLeft = 16;
        button.paddingRight = 16;
        button.paddingTop = 8;
        button.paddingBottom = 8;
        button.cornerRadius = 6;
        button.primaryAxisSizingMode = 'AUTO';
        button.counterAxisSizingMode = 'AUTO';
        
        if (action.variant === 'primary') {
          button.fills = [{ type: 'SOLID', color: { r: 0.23, g: 0.4, b: 1 }, opacity: 1 }];
        } else {
          button.fills = [];
          button.strokes = [{ type: 'SOLID', color: { r: 0.82, g: 0.84, b: 0.87 }, opacity: 1 }];
          button.strokeWeight = 1;
        }
        
        const buttonText = figma.createText();
        const buttonFont = await loadFontSafely('Inter', 'Medium');
        buttonText.fontName = buttonFont;
        buttonText.characters = action.text;
        buttonText.fontSize = 14;
        buttonText.fills = [{ 
          type: 'SOLID', 
          color: action.variant === 'primary' ? { r: 1, g: 1, b: 1 } : { r: 0.17, g: 0.24, b: 0.31 }, 
          opacity: 1 
        }];
        
        button.appendChild(buttonText);
        actions.appendChild(button);
      } else if (action.type === 'avatar') {
        const avatar = figma.createEllipse();
        avatar.resize(32, 32);
        avatar.fills = [{ type: 'SOLID', color: { r: 0.86, g: 0.92, b: 1 }, opacity: 1 }];
        actions.appendChild(avatar);
      }
    }
    
    header.appendChild(actions);
  }
  
  return header;
}