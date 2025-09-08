console.log('🚀 Plugin code loaded!');

// Enhanced logging with detailed debug info
function log(message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info', data?: any) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'debug' ? '🔍' : '✅';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
  if (data) {
    console.log(`[${timestamp}] 📊 Data:`, data);
  }
  
  if (level === 'error') {
    figma.notify(`❌ ${message}`, { error: true });
  } else if (level !== 'debug') {
    figma.notify(`${prefix} ${message}`);
  }
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 };
}

// Enhanced JSON parser with detailed logging
function parseAndValidate(jsonString: string): any | null {
  log('Rozpoczynam parsowanie JSON...', 'debug');
  log(`Rozmiar JSON: ${jsonString.length} znaków`, 'debug');
  
  try {
    const data = JSON.parse(jsonString);
    log('JSON sparsowany pomyślnie', 'debug', { 
      hasVersion: !!data.version, 
      hasPages: !!data.pages, 
      pagesCount: data.pages?.length 
    });
    
    if (!data.version || !data.pages || !Array.isArray(data.pages)) {
      log('Nieprawidłowy format JSON. Wymagane pola: version, pages', 'error', data);
      return null;
    }
    
    log(`JSON zwalidowany pomyślnie - wersja: ${data.version}, strony: ${data.pages.length}`);
    return data;
  } catch (error: any) {
    log(`Błąd parsowania JSON: ${error.message}`, 'error', { 
      jsonPreview: jsonString.substring(0, 200) + '...' 
    });
    return null;
  }
}

// Enhanced atomic design renderers with detailed logging
async function renderIcon(nodeData: any): Promise<RectangleNode> {
  log(`[ATOM] Renderuję ikonę: ${nodeData.name}`, 'debug', { 
    size: nodeData.properties?.size, 
    color: nodeData.properties?.color 
  });
  
  const icon = figma.createRectangle();
  const size = nodeData.properties?.size || 24;
  const color = nodeData.properties?.color || '#3B82F6';
  
  log(`Ustawiam rozmiar ikony: ${size}x${size}, kolor: ${color}`, 'debug');
  icon.resize(size, size);
  icon.fills = [{ type: 'SOLID', color: hexToRgb(color), opacity: 1 }];
  icon.cornerRadius = 4;
  
  log(`[ATOM] Ikona ${nodeData.name} wyrenderowana pomyślnie`, 'debug');
  return icon;
}

// Avatar atom renderer
async function renderAvatar(nodeData: any): Promise<EllipseNode> {
  log(`[ATOM] Renderuję avatar: ${nodeData.name}`, 'debug', { 
    size: nodeData.properties?.size,
    initials: nodeData.properties?.initials
  });
  
  const avatar = figma.createEllipse();
  const size = nodeData.properties?.size || 40;
  
  avatar.resize(size, size);
  avatar.fills = [{ 
    type: 'SOLID', 
    color: nodeData.properties?.backgroundColor ? hexToRgb(nodeData.properties.backgroundColor) : { r: 0.86, g: 0.92, b: 1 }, 
    opacity: 1 
  }];
  
  // If initials are provided, add them as text
  if (nodeData.properties?.initials) {
    // Note: In real implementation, we'd create a frame with text inside
    // For now, just the circle
  }
  
  log(`[ATOM] Avatar ${nodeData.name} wyrenderowany pomyślnie`, 'debug');
  return avatar;
}

// Divider atom renderer
async function renderDivider(nodeData: any): Promise<RectangleNode> {
  log(`[ATOM] Renderuję divider: ${nodeData.name}`, 'debug');
  
  const divider = figma.createRectangle();
  const width = nodeData.properties?.width || 200;
  const height = nodeData.properties?.height || 1;
  
  divider.resize(width, height);
  divider.fills = [{ 
    type: 'SOLID', 
    color: nodeData.properties?.color ? hexToRgb(nodeData.properties.color) : { r: 0.82, g: 0.84, b: 0.87 }, 
    opacity: 1 
  }];
  
  log(`[ATOM] Divider ${nodeData.name} wyrenderowany pomyślnie`, 'debug');
  return divider;
}

async function renderInput(nodeData: any): Promise<FrameNode> {
  const container = figma.createFrame();
  container.layoutMode = 'VERTICAL';
  container.itemSpacing = 4;
  container.primaryAxisSizingMode = 'AUTO';
  container.counterAxisSizingMode = 'AUTO';
  
  // Label
  if (nodeData.properties?.label) {
    const label = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
    label.characters = nodeData.properties.label;
    label.fontSize = 14;
    label.fills = [{ type: 'SOLID', color: { r: 0.17, g: 0.24, b: 0.31 }, opacity: 1 }];
    container.appendChild(label);
  }
  
  // Input field
  const input = figma.createFrame();
  input.layoutMode = 'HORIZONTAL';
  input.primaryAxisAlignItems = 'CENTER';
  input.paddingLeft = 12;
  input.paddingRight = 12;
  input.paddingTop = 8;
  input.paddingBottom = 8;
  input.cornerRadius = 6;
  input.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
  input.strokes = [{ type: 'SOLID', color: { r: 0.82, g: 0.84, b: 0.87 }, opacity: 1 }];
  input.strokeWeight = 1;
  input.resize(nodeData.properties?.width || 240, 36);
  
  // Placeholder text
  const placeholder = figma.createText();
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  placeholder.characters = nodeData.properties?.placeholder || 'Enter text...';
  placeholder.fontSize = 14;
  placeholder.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 }, opacity: 1 }];
  input.appendChild(placeholder);
  
  container.appendChild(input);
  
  return container;
}

async function renderBadge(nodeData: any): Promise<FrameNode> {
  const badge = figma.createFrame();
  badge.layoutMode = 'HORIZONTAL';
  badge.primaryAxisAlignItems = 'CENTER';
  badge.counterAxisAlignItems = 'CENTER';
  badge.paddingLeft = 8;
  badge.paddingRight = 8;
  badge.paddingTop = 4;
  badge.paddingBottom = 4;
  badge.cornerRadius = 12;
  badge.primaryAxisSizingMode = 'AUTO';
  badge.counterAxisSizingMode = 'AUTO';
  
  const variant = nodeData.properties?.variant || 'default';
  const colors = {
    default: { bg: { r: 0.96, g: 0.97, b: 0.98 }, text: { r: 0.37, g: 0.41, b: 0.48 } },
    primary: { bg: { r: 0.93, g: 0.97, b: 1 }, text: { r: 0.23, g: 0.4, b: 1 } },
    success: { bg: { r: 0.86, g: 0.98, b: 0.9 }, text: { r: 0.09, g: 0.55, b: 0.29 } },
    warning: { bg: { r: 1, g: 0.95, b: 0.8 }, text: { r: 0.57, g: 0.25, b: 0.05 } },
    danger: { bg: { r: 0.99, g: 0.92, b: 0.93 }, text: { r: 0.79, g: 0.15, b: 0.21 } }
  };
  
  const color = colors[variant as keyof typeof colors] || colors.default;
  badge.fills = [{ type: 'SOLID', color: color.bg, opacity: 1 }];
  
  const text = figma.createText();
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  text.characters = nodeData.text || 'Badge';
  text.fontSize = 12;
  text.fills = [{ type: 'SOLID', color: color.text, opacity: 1 }];
  badge.appendChild(text);
  
  return badge;
}

async function renderCard(nodeData: any): Promise<FrameNode> {
  const card = figma.createFrame();
  card.layoutMode = 'VERTICAL';
  card.itemSpacing = 16;
  card.paddingLeft = 16;
  card.paddingRight = 16;
  card.paddingTop = 16;
  card.paddingBottom = 16;
  card.cornerRadius = 12;
  card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
  card.strokes = [{ type: 'SOLID', color: { r: 0.89, g: 0.91, b: 0.94 }, opacity: 1 }];
  card.strokeWeight = 1;
  card.resize(nodeData.properties?.width || 280, card.height);
  card.primaryAxisSizingMode = 'FIXED';
  card.counterAxisSizingMode = 'AUTO';
  
  // Image placeholder
  if (nodeData.properties?.image) {
    const image = figma.createRectangle();
    image.resize(card.width - 32, nodeData.properties?.imageHeight || 140);
    image.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 }, opacity: 1 }];
    image.cornerRadius = 8;
    card.appendChild(image);
  }
  
  // Content
  const content = figma.createFrame();
  content.layoutMode = 'VERTICAL';
  content.itemSpacing = 8;
  content.primaryAxisSizingMode = 'FIXED';
  content.counterAxisSizingMode = 'AUTO';
  content.resize(card.width - 32, content.height);
  
  // Title
  if (nodeData.properties?.title) {
    const title = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    title.characters = nodeData.properties.title;
    title.fontSize = 18;
    title.fills = [{ type: 'SOLID', color: { r: 0.11, g: 0.11, b: 0.11 }, opacity: 1 }];
    content.appendChild(title);
  }
  
  // Description
  if (nodeData.properties?.description) {
    const desc = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    desc.characters = nodeData.properties.description;
    desc.fontSize = 14;
    desc.fills = [{ type: 'SOLID', color: { r: 0.42, g: 0.45, b: 0.5 }, opacity: 1 }];
    content.appendChild(desc);
  }
  
  card.appendChild(content);
  
  // Actions
  if (nodeData.properties?.actions && Array.isArray(nodeData.properties.actions)) {
    const actions = figma.createFrame();
    actions.layoutMode = 'HORIZONTAL';
    actions.itemSpacing = 8;
    actions.primaryAxisSizingMode = 'AUTO';
    actions.counterAxisSizingMode = 'AUTO';
    
    for (const action of nodeData.properties.actions) {
      const button = figma.createFrame();
      button.layoutMode = 'HORIZONTAL';
      button.primaryAxisAlignItems = 'CENTER';
      button.counterAxisAlignItems = 'CENTER';
      button.paddingLeft = 12;
      button.paddingRight = 12;
      button.paddingTop = 6;
      button.paddingBottom = 6;
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
      await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
      buttonText.characters = action.text;
      buttonText.fontSize = 12;
      buttonText.fills = [{ 
        type: 'SOLID', 
        color: action.variant === 'primary' ? { r: 1, g: 1, b: 1 } : { r: 0.17, g: 0.24, b: 0.31 }, 
        opacity: 1 
      }];
      
      button.appendChild(buttonText);
      actions.appendChild(button);
    }
    
    card.appendChild(actions);
  }
  
  return card;
}

async function renderFormField(nodeData: any): Promise<FrameNode> {
  const field = figma.createFrame();
  field.layoutMode = 'VERTICAL';
  field.itemSpacing = 6;
  field.primaryAxisSizingMode = 'AUTO';
  field.counterAxisSizingMode = 'AUTO';
  
  // Label with required indicator
  if (nodeData.properties?.label) {
    const labelContainer = figma.createFrame();
    labelContainer.layoutMode = 'HORIZONTAL';
    labelContainer.itemSpacing = 2;
    labelContainer.primaryAxisAlignItems = 'CENTER';
    labelContainer.primaryAxisSizingMode = 'AUTO';
    labelContainer.counterAxisSizingMode = 'AUTO';
    
    const label = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
    label.characters = nodeData.properties.label;
    label.fontSize = 14;
    label.fills = [{ type: 'SOLID', color: { r: 0.17, g: 0.24, b: 0.31 }, opacity: 1 }];
    labelContainer.appendChild(label);
    
    if (nodeData.properties?.required) {
      const required = figma.createText();
      await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
      required.characters = '*';
      required.fontSize = 14;
      required.fills = [{ type: 'SOLID', color: { r: 0.94, g: 0.27, b: 0.27 }, opacity: 1 }];
      labelContainer.appendChild(required);
    }
    
    field.appendChild(labelContainer);
  }
  
  // Input field with state styling
  const input = figma.createFrame();
  input.layoutMode = 'HORIZONTAL';
  input.primaryAxisAlignItems = 'CENTER';
  input.paddingLeft = 12;
  input.paddingRight = 12;
  input.paddingTop = 10;
  input.paddingBottom = 10;
  input.cornerRadius = 6;
  input.resize(nodeData.properties?.width || 280, 40);
  
  const state = nodeData.properties?.state || 'default';
  if (state === 'error') {
    input.fills = [{ type: 'SOLID', color: { r: 0.99, g: 0.95, b: 0.95 }, opacity: 1 }];
    input.strokes = [{ type: 'SOLID', color: { r: 0.94, g: 0.27, b: 0.27 }, opacity: 1 }];
  } else if (state === 'success') {
    input.fills = [{ type: 'SOLID', color: { r: 0.94, g: 0.99, b: 0.96 }, opacity: 1 }];
    input.strokes = [{ type: 'SOLID', color: { r: 0.13, g: 0.72, b: 0.41 }, opacity: 1 }];
  } else {
    input.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
    input.strokes = [{ type: 'SOLID', color: { r: 0.82, g: 0.84, b: 0.87 }, opacity: 1 }];
  }
  input.strokeWeight = 1;
  
  // Input text/placeholder
  const text = figma.createText();
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  text.characters = nodeData.properties?.value || nodeData.properties?.placeholder || 'Enter text...';
  text.fontSize = 14;
  if (nodeData.properties?.value) {
    text.fills = [{ type: 'SOLID', color: { r: 0.17, g: 0.24, b: 0.31 }, opacity: 1 }];
  } else {
    text.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 }, opacity: 1 }];
  }
  input.appendChild(text);
  
  field.appendChild(input);
  
  // Helper or error text
  if (nodeData.properties?.errorText && state === 'error') {
    const errorText = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    errorText.characters = nodeData.properties.errorText;
    errorText.fontSize = 12;
    errorText.fills = [{ type: 'SOLID', color: { r: 0.94, g: 0.27, b: 0.27 }, opacity: 1 }];
    field.appendChild(errorText);
  } else if (nodeData.properties?.helperText) {
    const helperText = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    helperText.characters = nodeData.properties.helperText;
    helperText.fontSize = 12;
    helperText.fills = [{ type: 'SOLID', color: { r: 0.55, g: 0.58, b: 0.63 }, opacity: 1 }];
    field.appendChild(helperText);
  }
  
  return field;
}

// Navigation molecule renderer
async function renderNavigation(nodeData: any): Promise<FrameNode> {
  log(`[MOLECULE] Renderuję nawigację: ${nodeData.name}`, 'debug');
  
  const nav = figma.createFrame();
  nav.layoutMode = 'HORIZONTAL';
  nav.primaryAxisAlignItems = 'CENTER';
  nav.itemSpacing = 32;
  nav.primaryAxisSizingMode = 'AUTO';
  nav.counterAxisSizingMode = 'AUTO';
  
  if (nodeData.properties?.items) {
    for (const item of nodeData.properties.items) {
      const navLink = figma.createText();
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      await figma.loadFontAsync({ family: 'Inter', style: item.active ? 'Medium' : 'Regular' });
      
      navLink.characters = item.text;
      navLink.fontSize = 14;
      navLink.fills = [{ 
        type: 'SOLID', 
        color: item.active ? { r: 0.23, g: 0.4, b: 1 } : { r: 0.42, g: 0.45, b: 0.5 }, 
        opacity: 1 
      }];
      
      if (item.active) {
        navLink.fontName = { family: 'Inter', style: 'Medium' };
      }
      
      nav.appendChild(navLink);
    }
  }
  
  log(`[MOLECULE] Nawigacja ${nodeData.name} wyrenderowana pomyślnie`, 'debug');
  return nav;
}

// Stats card molecule renderer
async function renderStatsCard(nodeData: any): Promise<FrameNode> {
  log(`[MOLECULE] Renderuję kartę statystyk: ${nodeData.name}`, 'debug');
  
  const card = figma.createFrame();
  card.layoutMode = 'VERTICAL';
  card.itemSpacing = 8;
  card.primaryAxisAlignItems = 'CENTER';
  card.counterAxisAlignItems = 'CENTER';
  card.paddingLeft = 24;
  card.paddingRight = 24;
  card.paddingTop = 20;
  card.paddingBottom = 20;
  card.cornerRadius = 12;
  card.primaryAxisSizingMode = 'AUTO';
  card.counterAxisSizingMode = 'AUTO';
  
  // Background
  card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
  card.strokes = [{ type: 'SOLID', color: { r: 0.89, g: 0.91, b: 0.94 }, opacity: 1 }];
  card.strokeWeight = 1;
  
  // Number
  if (nodeData.properties?.number) {
    const number = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    
    number.characters = nodeData.properties.number;
    number.fontSize = 32;
    number.fontName = { family: 'Inter', style: 'Bold' };
    number.fills = [{ 
      type: 'SOLID', 
      color: nodeData.properties?.color ? hexToRgb(nodeData.properties.color) : { r: 0.23, g: 0.4, b: 1 }, 
      opacity: 1 
    }];
    card.appendChild(number);
  }
  
  // Label
  if (nodeData.properties?.label) {
    const label = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    
    label.characters = nodeData.properties.label;
    label.fontSize = 14;
    label.fills = [{ type: 'SOLID', color: { r: 0.42, g: 0.45, b: 0.5 }, opacity: 1 }];
    card.appendChild(label);
  }
  
  log(`[MOLECULE] Karta statystyk ${nodeData.name} wyrenderowana pomyślnie`, 'debug');
  return card;
}

async function renderHeader(nodeData: any): Promise<FrameNode> {
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
      await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
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
      await figma.loadFontAsync({ family: 'Inter', style: navItem.active ? 'Medium' : 'Regular' });
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
        await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
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

async function renderProductGrid(nodeData: any): Promise<FrameNode> {
  const grid = figma.createFrame();
  grid.layoutMode = 'VERTICAL';
  grid.itemSpacing = 32;
  grid.primaryAxisSizingMode = 'AUTO';
  grid.counterAxisSizingMode = 'AUTO';
  
  const width = nodeData.properties?.width || 1200;
  grid.resize(width, grid.height);
  
  // Title section
  if (nodeData.properties?.title) {
    const titleSection = figma.createFrame();
    titleSection.layoutMode = 'HORIZONTAL';
    titleSection.primaryAxisAlignItems = 'CENTER';
    titleSection.counterAxisAlignItems = 'CENTER';
    titleSection.primaryAxisSizingMode = 'FIXED';
    titleSection.counterAxisSizingMode = 'AUTO';
    titleSection.resize(width, titleSection.height);
    
    const title = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    title.characters = nodeData.properties.title;
    title.fontSize = 32;
    title.fills = [{ type: 'SOLID', color: { r: 0.11, g: 0.11, b: 0.11 }, opacity: 1 }];
    titleSection.appendChild(title);
    
    grid.appendChild(titleSection);
  }
  
  // Products grid
  const products = nodeData.properties?.products || [];
  const columns = nodeData.properties?.columns || 4;
  const gap = nodeData.properties?.gap || 24;
  
  // Calculate rows needed
  const rows = Math.ceil(products.length / columns);
  
  for (let row = 0; row < rows; row++) {
    const rowFrame = figma.createFrame();
    rowFrame.layoutMode = 'HORIZONTAL';
    rowFrame.itemSpacing = gap;
    rowFrame.primaryAxisSizingMode = 'FIXED';
    rowFrame.counterAxisSizingMode = 'AUTO';
    rowFrame.resize(width, rowFrame.height);
    
    for (let col = 0; col < columns; col++) {
      const productIndex = row * columns + col;
      if (productIndex >= products.length) break;
      
      const product = products[productIndex];
      const productCard = await createProductCard(product, (width - (gap * (columns - 1))) / columns);
      rowFrame.appendChild(productCard);
    }
    
    grid.appendChild(rowFrame);
  }
  
  return grid;
}

async function createProductCard(product: any, cardWidth: number): Promise<FrameNode> {
  const card = figma.createFrame();
  card.layoutMode = 'VERTICAL';
  card.itemSpacing = 16;
  card.primaryAxisSizingMode = 'FIXED';
  card.counterAxisSizingMode = 'AUTO';
  card.resize(cardWidth, card.height);
  
  // Product image
  const imageContainer = figma.createRectangle();
  imageContainer.resize(cardWidth, cardWidth * 0.75); // 4:3 ratio
  imageContainer.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 }, opacity: 1 }];
  imageContainer.cornerRadius = 12;
  card.appendChild(imageContainer);
  
  // Product info
  const info = figma.createFrame();
  info.layoutMode = 'VERTICAL';
  info.itemSpacing = 8;
  info.primaryAxisSizingMode = 'FIXED';
  info.counterAxisSizingMode = 'AUTO';
  info.resize(cardWidth, info.height);
  
  // Product name
  if (product.name) {
    const name = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
    name.characters = product.name;
    name.fontSize = 16;
    name.fills = [{ type: 'SOLID', color: { r: 0.11, g: 0.11, b: 0.11 }, opacity: 1 }];
    info.appendChild(name);
  }
  
  // Price container
  const priceContainer = figma.createFrame();
  priceContainer.layoutMode = 'HORIZONTAL';
  priceContainer.itemSpacing = 8;
  priceContainer.primaryAxisAlignItems = 'CENTER';
  priceContainer.primaryAxisSizingMode = 'AUTO';
  priceContainer.counterAxisSizingMode = 'AUTO';
  
  // Current price
  if (product.price) {
    const price = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    price.characters = product.price;
    price.fontSize = 18;
    price.fills = [{ type: 'SOLID', color: { r: 0.11, g: 0.11, b: 0.11 }, opacity: 1 }];
    priceContainer.appendChild(price);
  }
  
  // Sale badge
  if (product.onSale) {
    const badge = figma.createFrame();
    badge.layoutMode = 'HORIZONTAL';
    badge.primaryAxisAlignItems = 'CENTER';
    badge.counterAxisAlignItems = 'CENTER';
    badge.paddingLeft = 8;
    badge.paddingRight = 8;
    badge.paddingTop = 4;
    badge.paddingBottom = 4;
    badge.cornerRadius = 12;
    badge.fills = [{ type: 'SOLID', color: { r: 0.94, g: 0.27, b: 0.27 }, opacity: 1 }];
    badge.primaryAxisSizingMode = 'AUTO';
    badge.counterAxisSizingMode = 'AUTO';
    
    const badgeText = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    badgeText.characters = 'SALE';
    badgeText.fontSize = 10;
    badgeText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
    badge.appendChild(badgeText);
    
    priceContainer.appendChild(badge);
  }
  
  info.appendChild(priceContainer);
  
  // Rating (if available)
  if (product.rating) {
    const ratingContainer = figma.createFrame();
    ratingContainer.layoutMode = 'HORIZONTAL';
    ratingContainer.itemSpacing = 4;
    ratingContainer.primaryAxisAlignItems = 'CENTER';
    ratingContainer.primaryAxisSizingMode = 'AUTO';
    ratingContainer.counterAxisSizingMode = 'AUTO';
    
    // Stars (simplified as rectangles)
    for (let i = 0; i < 5; i++) {
      const star = figma.createRectangle();
      star.resize(12, 12);
      star.fills = [{ 
        type: 'SOLID', 
        color: i < product.rating ? { r: 1, g: 0.76, b: 0.03 } : { r: 0.9, g: 0.9, b: 0.9 }, 
        opacity: 1 
      }];
      ratingContainer.appendChild(star);
    }
    
    // Rating text
    const ratingText = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    ratingText.characters = `(${product.reviews || 0})`;
    ratingText.fontSize = 12;
    ratingText.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 }, opacity: 1 }];
    ratingContainer.appendChild(ratingText);
    
    info.appendChild(ratingContainer);
  }
  
  card.appendChild(info);
  
  return card;
}

// Basic renderers
function renderFrame(): FrameNode {
  return figma.createFrame();
}

function renderRectangle(): RectangleNode {
  return figma.createRectangle();
}

async function renderText(nodeData?: any): Promise<TextNode> {
  log(`[TEXT] Renderuję tekst: ${nodeData?.name}`, 'debug', nodeData?.properties);
  
  const text = figma.createText();
  
  // ZAWSZE najpierw załaduj Inter Regular (domyślny font Figmy)
  log(`Ładuję domyślny font Inter Regular`, 'debug');
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  
  // Potem załaduj docelowy font jeśli się różni
  const font = nodeData?.properties?.font || { family: 'Inter', style: 'Regular' };
  if (font.style !== 'Regular' || font.family !== 'Inter') {
    log(`Ładuję docelowy font: ${font.family} ${font.style}`, 'debug');
    try {
      await figma.loadFontAsync(font);
      log(`Font ${font.family} ${font.style} załadowany pomyślnie`, 'debug');
    } catch (error: any) {
      log(`Błąd ładowania fontu ${font.family} ${font.style}: ${error.message}`, 'error');
    }
  }
  
  log(`[TEXT] Tekst ${nodeData?.name} wyrenderowany pomyślnie`, 'debug');
  return text;
}

async function renderButton(nodeData: any): Promise<FrameNode> {
  const button = figma.createFrame();
  button.layoutMode = 'HORIZONTAL';
  button.primaryAxisAlignItems = 'CENTER';
  button.counterAxisAlignItems = 'CENTER';
  button.paddingLeft = 16;
  button.paddingRight = 16;
  button.paddingTop = 12;
  button.paddingBottom = 12;
  button.cornerRadius = 8;
  button.primaryAxisSizingMode = 'AUTO';
  button.counterAxisSizingMode = 'AUTO';
  
  // Default button styling
  button.fills = [{ type: 'SOLID', color: { r: 0.23, g: 0.4, b: 1 }, opacity: 1 }];
  
  const buttonText = figma.createText();
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  buttonText.characters = nodeData.text || 'Button';
  buttonText.fontSize = 14;
  buttonText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
  
  button.appendChild(buttonText);
  return button;
}

// Enhanced apply properties function with detailed logging
async function applyProperties(node: SceneNode, props: any, parent?: BaseNode & ChildrenMixin) {
  log(`[PROPS] Aplikuję właściwości do węzła: ${node.name} (typ: ${node.type})`, 'debug', props);
  
  if (!props) {
    log('Brak właściwości do zastosowania', 'debug');
    return;
  }

  // Position and size - SKIP if parent has auto layout
  const parentHasAutoLayout = parent && 'layoutMode' in parent && 
                              (parent.layoutMode === 'HORIZONTAL' || parent.layoutMode === 'VERTICAL');
  
  log(`🔍 POZYCJA DEBUG: węzeł=${node.name}, x=${props.x}, y=${props.y}`, 'debug', {
    parentName: parent?.name,
    parentLayoutMode: parent && 'layoutMode' in parent ? parent.layoutMode : 'BRAK',
    parentHasAutoLayout,
    willSkipPositioning: parentHasAutoLayout && (props.x !== undefined || props.y !== undefined)
  });
  
  if ((props.x !== undefined || props.y !== undefined) && !parentHasAutoLayout) {
    log(`✅ USTAWIAM pozycję: x=${props.x}, y=${props.y} (parent bez auto layout)`, 'info');
    if (props.x !== undefined) node.x = props.x;
    if (props.y !== undefined) node.y = props.y;
  } else if (props.x !== undefined || props.y !== undefined) {
    log(`⏭️ POMIJAM pozycję x=${props.x}, y=${props.y} - parent ma auto layout ${parent && 'layoutMode' in parent ? parent.layoutMode : 'undefined'}`, 'info');
  }
  
  if (node.type === 'FRAME' || node.type === 'RECTANGLE') {
    if (props.width && props.width !== 'HUG') {
      log(`Zmieniam szerokość: ${props.width}`, 'debug');
      node.resize(props.width, node.height);
    }
    if (props.height && props.height !== 'HUG') {
      log(`Zmieniam wysokość: ${props.height}`, 'debug');
      node.resize(node.width, props.height);
    }
  }

  // Auto Layout
  if (props.autoLayout && (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE')) {
    node.layoutMode = props.autoLayout.direction === 'HORIZONTAL' ? 'HORIZONTAL' : 'VERTICAL';
    if (props.autoLayout.padding) {
      const p = props.autoLayout.padding;
      node.paddingTop = p.top ?? 0;
      node.paddingBottom = p.bottom ?? 0;
      node.paddingLeft = p.left ?? 0;
      node.paddingRight = p.right ?? 0;
    }
    if (props.autoLayout.spacing) node.itemSpacing = props.autoLayout.spacing;
    if (props.autoLayout.alignment) {
      // Mapuj CSS-like wartości na wartości Figmy
      const figmaAlignment = props.autoLayout.alignment === 'FLEX_START' ? 'MIN' : 
                            props.autoLayout.alignment === 'FLEX_END' ? 'MAX' : 
                            props.autoLayout.alignment;
      log(`Mapuję alignment: ${props.autoLayout.alignment} -> ${figmaAlignment}`, 'debug');
      node.primaryAxisAlignItems = figmaAlignment;
    }
    if (props.width === 'HUG') node.primaryAxisSizingMode = 'AUTO';
    if (props.height === 'HUG') node.counterAxisSizingMode = 'AUTO';
  }

  // Appearance
  if (props.fills && 'fills' in node) {
    const fills = props.fills.map((fill: any) => {
      const newFill: SolidPaint = {
        type: 'SOLID',
        color: hexToRgb(fill.color),
        opacity: fill.opacity ?? 1,
      };
      return newFill;
    });
    node.fills = fills;
  }

  if (props.cornerRadius !== undefined && ('cornerRadius' in node || 'topLeftRadius' in node)) {
    if (node.type === 'RECTANGLE') {
      node.cornerRadius = props.cornerRadius;
    } else if (node.type === 'FRAME' || node.type === 'COMPONENT') {
      node.topLeftRadius = props.cornerRadius;
      node.topRightRadius = props.cornerRadius;
      node.bottomLeftRadius = props.cornerRadius;
      node.bottomRightRadius = props.cornerRadius;
    }
  }

  // Text properties with enhanced logging
  if (props.content && node.type === 'TEXT') {
    const font = props.font || { family: 'Inter', style: 'Regular' };
    log(`[TEXT-PROPS] Aplikuję tekst: "${props.content}" z fontem: ${font.family} ${font.style}`, 'debug');
    
    try {
      // ZAWSZE najpierw załaduj Inter Regular
      log(`Ładuję domyślny font Inter Regular`, 'debug');
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
      
      // Potem załaduj docelowy font jeśli się różni
      if (font.style !== 'Regular' || font.family !== 'Inter') {
        log(`Ładuję docelowy font: ${font.family} ${font.style}`, 'debug');
        await figma.loadFontAsync(font);
      }
      
      log(`Font załadowany pomyślnie, ustawiam tekst: "${props.content}"`, 'debug');
      node.characters = props.content;
      log(`Tekst ustawiony pomyślnie: "${props.content}"`, 'debug');
      
      if (props.fontSize) {
        log(`Ustawiam rozmiar fontu: ${props.fontSize}`, 'debug');
        node.fontSize = props.fontSize;
      }
      if (props.font) {
        log(`Ustawiam font: ${props.font.family} ${props.font.style}`, 'debug');
        node.fontName = props.font;
      }
    } catch (error: any) {
      log(`BŁĄD podczas ustawiania tekstu: ${error.message}`, 'error', { 
        content: props.content, 
        font: font,
        nodeType: node.type,
        nodeName: node.name
      });
      throw error;
    }
  }

  // Stroke
  if (props.stroke && 'strokes' in node) {
    const strokes = props.stroke.map((stroke: any) => {
      const newStroke: SolidPaint = {
        type: 'SOLID',
        color: hexToRgb(stroke.color),
        opacity: stroke.opacity ?? 1,
      };
      return newStroke;
    });
    node.strokes = strokes;
    if (props.strokeWeight) node.strokeWeight = props.strokeWeight;
  }

  // Effects
  if (props.effects && 'effects' in node) {
    const effects = props.effects.map((effect: any) => {
      if (effect.type === 'DROP_SHADOW') {
        const shadowColor = hexToRgb(effect.color);
        const dropShadow: DropShadowEffect = {
          type: 'DROP_SHADOW',
          color: { ...shadowColor, a: effect.opacity || 0.25 },
          offset: effect.offset || { x: 0, y: 4 },
          radius: effect.radius || 4,
          spread: effect.spread || 0,
          visible: true,
          blendMode: 'NORMAL',
        };
        return dropShadow;
      }
      return effect;
    });
    node.effects = effects;
  }
}

// Enhanced render node function with detailed logging
async function renderNode(nodeData: any, parent: BaseNode & ChildrenMixin): Promise<SceneNode | null> {
  log(`[RENDER] Rozpoczynam renderowanie węzła: ${nodeData.name} (typ: ${nodeData.type})`, 'debug', nodeData);
  
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
      node = await renderIcon(nodeData);
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
    case 'NAVIGATION':
      node = await renderNavigation(nodeData);
      break;
    case 'STATS_CARD':
      node = await renderStatsCard(nodeData);
      break;
    // Atomic Design - Organisms
    case 'HEADER':
      node = await renderHeader(nodeData);
      break;
    case 'PRODUCT_GRID':
      node = await renderProductGrid(nodeData);
      break;
    default:
      log(`Unknown node type: ${nodeData.type}`, 'warn');
      return null;
  }

  if (!node) {
    log(`[RENDER] Nie udało się utworzyć węzła typu: ${nodeData.type}`, 'error');
    return null;
  }

  log(`[RENDER] Węzeł ${nodeData.name} utworzony, ustawiam właściwości...`, 'debug');
  node.name = nodeData.name;
  
  try {
    await applyProperties(node, nodeData.properties, parent);
    log(`[RENDER] Właściwości zastosowane dla węzła: ${nodeData.name}`, 'debug');
  } catch (error: any) {
    log(`[RENDER] BŁĄD podczas aplikacji właściwości dla węzła ${nodeData.name}: ${error.message}`, 'error');
    throw error;
  }
  
  parent.appendChild(node);
  log(`[RENDER] Węzeł ${nodeData.name} dodany do rodzica`, 'debug');

  if (nodeData.children && 'appendChild' in node) {
    log(`[RENDER] Renderuję ${nodeData.children.length} dzieci węzła: ${nodeData.name}`, 'debug');
    for (const childData of nodeData.children) {
      try {
        await renderNode(childData, node as BaseNode & ChildrenMixin);
      } catch (error: any) {
        log(`[RENDER] BŁĄD podczas renderowania dziecka ${childData.name}: ${error.message}`, 'error');
        throw error;
      }
    }
  }

  log(`[RENDER] Węzeł ${nodeData.name} wyrenderowany pomyślnie`, 'debug');
  return node;
}

// Create main page container
function createPageContainer(pageData: any): FrameNode {
  const container = figma.createFrame();
  container.name = pageData.name + " Container";
  
  // Set up page-like properties - VERTICAL layout for stacking
  container.layoutMode = 'VERTICAL';
  container.primaryAxisAlignItems = 'MIN'; // Align to start (left)
  container.counterAxisAlignItems = 'MIN'; // Align to start (top) 
  container.itemSpacing = 40; // Add spacing between sections
  container.paddingTop = 0;
  container.paddingBottom = 0;
  container.paddingLeft = 0;
  container.paddingRight = 0;
  
  // Full width, auto height
  container.resize(1200, 2000); // Larger initial height, will auto-adjust
  container.primaryAxisSizingMode = 'FIXED'; // Fixed width
  container.counterAxisSizingMode = 'AUTO'; // Auto height to fit content
  
  // Page background
  container.fills = [{ 
    type: 'SOLID', 
    color: { r: 1, g: 1, b: 1 }, // White background
    opacity: 1 
  }];
  
  log(`📄 Utworzono główny kontener strony: ${container.name}`, 'debug', {
    layoutMode: container.layoutMode,
    primaryAxisAlignItems: container.primaryAxisAlignItems,
    itemSpacing: container.itemSpacing,
    size: { width: container.width, height: container.height }
  });
  return container;
}

// Enhanced main render tree function
async function renderTree(json: any) {
  log("🚀 Rozpoczynam renderowanie drzewa...", 'info', { version: json.version });
  
  const pageData = json.pages[0];
  if (!pageData) {
    log('Brak zdefiniowanych stron w pliku JSON', 'error');
    return;
  }

  log(`Renderuję stronę: ${pageData.name} z ${pageData.children.length} węzłami głównymi`, 'info');
  
  const page = figma.currentPage;
  page.name = pageData.name;
  
  // Create main page container
  const pageContainer = createPageContainer(pageData);
  page.appendChild(pageContainer);

  for (let i = 0; i < pageData.children.length; i++) {
    const nodeData = pageData.children[i];
    log(`[${i+1}/${pageData.children.length}] Renderuję główny węzeł: ${nodeData.name}`, 'info');
    
    try {
      await renderNode(nodeData, pageContainer); // Render into container instead of page
      log(`✅ Węzeł ${nodeData.name} wyrenderowany pomyślnie`, 'info');
    } catch (error: any) {
      log(`❌ BŁĄD podczas renderowania węzła ${nodeData.name}: ${error.message}`, 'error');
      log(`Stack trace:`, 'error', error.stack);
      // Kontynuuj renderowanie pozostałych węzłów
    }
  }

  log("🎉 Renderowanie zakończone pomyślnie!");
  figma.notify('✅ Rendering completed!');
}

// Enhanced message handling with detailed logging
figma.ui.onmessage = async (msg) => {
  log(`📨 Otrzymano wiadomość typu: ${msg.type}`, 'info');
  console.log('📨 Full message:', msg);
  
  if (msg.type === 'render-json') {
    log('📥 Rozpoczynam przetwarzanie JSON z pliku', 'info');
    const data = parseAndValidate(msg.data);
    if (data) {
      log('✅ JSON zwalidowany, rozpoczynam renderowanie...', 'info');
      try {
        await renderTree(data);
      } catch (error: any) {
        log(`❌ KRYTYCZNY BŁĄD podczas renderowania: ${error.message}`, 'error');
        console.error('Full error:', error);
      }
    } else {
      log('❌ Walidacja JSON nie powiodła się', 'error');
    }
  }

  if (msg.type === 'render-url') {
    const url = msg.data;
    log(`Fetching data from URL: ${url}`);
    try {
      const response = await fetch(url);
      const jsonString = await response.text();
      const data = parseAndValidate(jsonString);
      if (data) {
        await renderTree(data);
      }
    } catch (e: any) {
      log(`Error fetching from URL: ${e.message}`, 'error');
    }
  }
  
  if (msg.type === 'setting-change') {
    console.log('⚙️ Setting changed:', msg.data);
    figma.clientStorage.setAsync(msg.data.setting, msg.data.value);
  }

  if (msg.type === 'log') {
    console.log('[UI]', ...msg.data);
  }
};

// UI HTML (same as before)
const uiHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Draftly Plugin</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #ffffff; height: 100vh; display: flex; flex-direction: column; }
    
    .header { padding: 16px; border-bottom: 1px solid #e1e5e9; background: white; }
    .logo { font-size: 16px; font-weight: 600; color: #2c2c2c; margin: 0; }
    
    .content { flex: 1; overflow-y: auto; padding: 16px; }
    
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    
    .bottom-nav { display: flex; border-top: 1px solid #e1e5e9; background: white; }
    .nav-item { flex: 1; padding: 12px 8px; text-align: center; cursor: pointer; border: none; background: none; color: #666; font-size: 12px; transition: all 0.2s; }
    .nav-item.active { color: #18a0fb; background: #f0f8ff; }
    .nav-item:hover { background: #f5f5f5; }
    
    .section { margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #2c2c2c; }
    .form-group { margin-bottom: 12px; }
    label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; color: #2c2c2c; }
    input[type="file"], input[type="text"] { width: 100%; padding: 8px 12px; border: 1px solid #d1d5d9; border-radius: 6px; font-size: 13px; }
    input:focus { outline: none; border-color: #18a0fb; box-shadow: 0 0 0 3px rgba(24, 160, 251, 0.1); }
    .btn-primary { width: 100%; padding: 8px 12px; background: #18a0fb; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn-primary:hover { background: #1590e8; }
    .divider { text-align: center; color: #999; font-size: 12px; margin: 16px 0; position: relative; }
    .divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e1e5e9; z-index: 1; }
    .divider span { background: white; padding: 0 12px; position: relative; z-index: 2; }
    
    .status { font-size: 12px; color: #10b981; font-weight: 500; margin-bottom: 16px; }
    
    .task-item { padding: 12px; border: 1px solid #e1e5e9; border-radius: 6px; margin-bottom: 8px; }
    .task-title { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
    .task-desc { font-size: 12px; color: #666; }
    .task-status { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500; }
    .task-status.completed { background: #dcfce7; color: #166534; }
    .task-status.pending { background: #fef3c7; color: #92400e; }
    .task-status.running { background: #dbeafe; color: #1d4ed8; }
    
    .settings-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
    .toggle { width: 40px; height: 20px; background: #e1e5e9; border-radius: 10px; position: relative; cursor: pointer; transition: background 0.2s; }
    .toggle.active { background: #18a0fb; }
    .toggle-thumb { width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: left 0.2s; }
    .toggle.active .toggle-thumb { left: 22px; }
    
    .version { text-align: center; font-size: 11px; color: #999; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="logo">Draftly</h1>
  </div>

  <div class="content">
    <div id="import-tab" class="tab-content active">
      <div class="status">✅ Plugin ready with Atomic Design System</div>
      
      <div class="section">
        <div class="section-title">Import from file</div>
        <div class="form-group">
          <label for="file-input">Choose JSON file</label>
          <input id="file-input" type="file" accept=".json">
        </div>
      </div>

      <div class="divider"><span>OR</span></div>

      <div class="section">
        <div class="section-title">Import from URL</div>
        <div class="form-group">
          <label for="url-input">Enter JSON file URL</label>
          <input id="url-input" type="text" placeholder="https://example.com/data.json">
        </div>
        <button id="url-button" class="btn-primary">Render from URL</button>
      </div>
    </div>

    <div id="task-tab" class="tab-content">
      <div class="section">
        <div class="section-title">Recent tasks</div>
        <div class="task-item">
          <div class="task-title">Design System Import</div>
          <div class="task-desc">Imported 15+ components</div>
          <span class="task-status completed">Completed</span>
        </div>
        <div class="task-item">
          <div class="task-title">Landing Page Render</div>
          <div class="task-desc">Created hero, features, CTA sections</div>
          <span class="task-status completed">Completed</span>
        </div>
        <div class="task-item">
          <div class="task-title">Shopping Cart Layout</div>
          <div class="task-desc">Rendered products, checkout flow</div>
          <span class="task-status completed">Completed</span>
        </div>
      </div>
    </div>

    <div id="settings-tab" class="tab-content">
      <div class="section">
        <div class="section-title">Render settings</div>
        <div class="settings-item">
          <div>
            <div style="font-weight: 500; font-size: 13px;">Auto Layout</div>
            <div style="font-size: 11px; color: #666;">Apply Auto Layout automatically</div>
          </div>
          <div class="toggle active" data-setting="auto-layout">
            <div class="toggle-thumb"></div>
          </div>
        </div>
        <div class="settings-item">
          <div>
            <div style="font-weight: 500; font-size: 13px;">Advanced shadows</div>
            <div style="font-size: 11px; color: #666;">Render shadow effects</div>
          </div>
          <div class="toggle active" data-setting="shadows">
            <div class="toggle-thumb"></div>
          </div>
        </div>
        <div class="settings-item">
          <div>
            <div style="font-weight: 500; font-size: 13px;">Notifications</div>
            <div style="font-size: 11px; color: #666;">Show progress notifications</div>
          </div>
          <div class="toggle active" data-setting="notifications">
            <div class="toggle-thumb"></div>
          </div>
        </div>
      </div>
      
      <div class="version">Draftly v1.0.0 - Atomic Design</div>
    </div>
  </div>

  <div class="bottom-nav">
    <button class="nav-item active" data-tab="import">
      <div>📥</div>
      <div>Import</div>
    </button>
    <button class="nav-item" data-tab="task">
      <div>📋</div>
      <div>Task</div>
    </button>
    <button class="nav-item" data-tab="settings">
      <div>⚙️</div>
      <div>Settings</div>
    </button>
  </div>

  <script>
    console.log('🚀 UI loaded with Atomic Design System!');
    
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tabId = item.getAttribute('data-tab') + '-tab';
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(tabId).classList.add('active');
      });
    });
    
    document.getElementById('file-input').addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const content = e.target.result;
          parent.postMessage({ pluginMessage: { type: 'render-json', data: content } }, '*');
        };
        reader.readAsText(file);
      }
    });
    
    document.getElementById('url-button').addEventListener('click', function() {
      const url = document.getElementById('url-input').value;
      if (url) {
        parent.postMessage({ pluginMessage: { type: 'render-url', data: url } }, '*');
      }
    });
    
    const toggles = document.querySelectorAll('.toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        this.classList.toggle('active');
        const setting = this.getAttribute('data-setting');
        const isActive = this.classList.contains('active');
        parent.postMessage({ 
          pluginMessage: { 
            type: 'setting-change', 
            data: { setting, value: isActive } 
          } 
        }, '*');
      });
    });
  </script>
</body>
</html>`;

figma.showUI(uiHTML, { width: 340, height: 420 });
console.log('🎉 Plugin initialized successfully with Atomic Design System!');