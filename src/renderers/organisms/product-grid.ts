import { loadFontSafely } from "../../main/utils/index";

export async function renderProductGrid(nodeData: any): Promise<FrameNode> {
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
    const titleFont = await loadFontSafely('Inter', 'Bold');
    title.fontName = titleFont;
    title.characters = nodeData.properties.title;
    title.fontSize = 32;
    title.fills = [{ type: 'SOLID', color: { r: 0.11, g: 0.11, b: 0.11 }, opacity: 1 }];
    titleSection.appendChild(title);
    
    // View All button
    if (nodeData.properties?.showViewAll) {
      const viewAll = figma.createText();
      const viewAllFont = await loadFontSafely('Inter', 'Medium');
      viewAll.fontName = viewAllFont;
      viewAll.characters = 'View All →';
      viewAll.fontSize = 16;
      viewAll.fills = [{ type: 'SOLID', color: { r: 0.23, g: 0.4, b: 1 }, opacity: 1 }];
      titleSection.appendChild(viewAll);
    }
    
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
    const nameFont = await loadFontSafely('Inter', 'Medium');
    name.fontName = nameFont;
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
    const priceFont = await loadFontSafely('Inter', 'Bold');
    price.fontName = priceFont;
    price.characters = product.price;
    price.fontSize = 18;
    price.fills = [{ type: 'SOLID', color: { r: 0.11, g: 0.11, b: 0.11 }, opacity: 1 }];
    priceContainer.appendChild(price);
  }
  
  // Original price (if on sale)
  if (product.originalPrice) {
    const originalPrice = figma.createText();
    const originalPriceFont = await loadFontSafely('Inter', 'Regular');
    originalPrice.fontName = originalPriceFont;
    originalPrice.characters = product.originalPrice;
    originalPrice.fontSize = 14;
    originalPrice.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 }, opacity: 1 }];
    // Add strikethrough effect simulation with background
    const strikethrough = figma.createRectangle();
    strikethrough.resize(originalPrice.width, 1);
    strikethrough.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 }, opacity: 1 }];
    priceContainer.appendChild(originalPrice);
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
    const badgeFont = await loadFontSafely('Inter', 'Bold');
    badgeText.fontName = badgeFont;
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
    const ratingFont = await loadFontSafely('Inter', 'Regular');
    ratingText.fontName = ratingFont;
    ratingText.characters = `(${product.reviews || 0})`;
    ratingText.fontSize = 12;
    ratingText.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 }, opacity: 1 }];
    ratingContainer.appendChild(ratingText);
    
    info.appendChild(ratingContainer);
  }
  
  card.appendChild(info);
  
  return card;
}