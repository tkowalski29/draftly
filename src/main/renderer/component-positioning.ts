import { log } from "../utils/index";

/**
 * Positioning utilities for design system components
 */

export interface PositionBounds {
  minX: number;
  maxX: number;
  maxRowHeight: number;
}

export interface SpacingConfig {
  cardPadding: number;
  columnSpacing: number;
  rowSpacing: number;
  sectionSpacing: number;
}

/**
 * Position a single component and update bounds
 */
export function positionComponent(
  component: SceneNode, 
  x: number, 
  y: number, 
  bounds: PositionBounds,
  spacing: SpacingConfig
): number {
  component.x = x;
  component.y = y;
  
  // Track bounds
  bounds.minX = Math.min(bounds.minX, component.x);
  bounds.maxX = Math.max(bounds.maxX, component.x + component.width);
  bounds.maxRowHeight = Math.max(bounds.maxRowHeight, component.height);
  
  // Return next x position
  return x + component.width + spacing.columnSpacing;
}

/**
 * Position an array of components horizontally with spacing
 */
export function positionComponentArray(
  components: SceneNode[], 
  startX: number, 
  y: number,
  bounds: PositionBounds,
  spacing: SpacingConfig
): number {
  let currentX = startX;
  
  components.forEach((component) => {
    currentX = positionComponent(component, currentX, y, bounds, spacing);
  });
  
  return currentX - spacing.columnSpacing; // Remove last spacing
}

/**
 * Calculate layout dimensions for section cards
 */
export function calculateSectionLayout(itemCount: number, maxItemsPerRow: number = 3) {
  const itemsPerRow = Math.min(itemCount, maxItemsPerRow);
  const rows = Math.ceil(itemCount / itemsPerRow);
  
  return { itemsPerRow, rows };
}

/**
 * Create section card background
 */
export function createSectionCard(
  name: string, 
  x: number, 
  y: number, 
  width: number, 
  height: number,
  cardConfig: {
    background: string;
    cornerRadius: number;
    shadow?: any;
  }
): FrameNode {
  const card = figma.createFrame();
  card.name = `${name} Card`;
  card.x = x;
  card.y = y;
  
  // Set up auto layout
  card.layoutMode = 'HORIZONTAL';
  card.primaryAxisSizingMode = 'AUTO';
  card.counterAxisSizingMode = 'AUTO';
  card.itemSpacing = 40; // Default spacing between components
  card.paddingTop = 32;
  card.paddingBottom = 32;
  card.paddingLeft = 32;
  card.paddingRight = 32;
  card.primaryAxisAlignItems = 'MIN'; // Align to start
  card.counterAxisAlignItems = 'MIN'; // Align to start
  
  card.fills = [{
    type: 'SOLID',
    color: { 
      r: parseInt(cardConfig.background.slice(1, 3), 16) / 255,
      g: parseInt(cardConfig.background.slice(3, 5), 16) / 255,
      b: parseInt(cardConfig.background.slice(5, 7), 16) / 255
    },
    opacity: 1
  }];
  card.cornerRadius = cardConfig.cornerRadius;
  
  if (cardConfig.shadow) {
    // Ensure shadow has all required properties for Figma API
    const shadow = {
      type: 'DROP_SHADOW',
      color: cardConfig.shadow.color || { r: 0, g: 0, b: 0, a: 0.08 },
      offset: cardConfig.shadow.offset || { x: 0, y: 2 },
      radius: cardConfig.shadow.radius || 8,
      spread: cardConfig.shadow.spread || 0,
      visible: cardConfig.shadow.visible ?? true,
      blendMode: cardConfig.shadow.blendMode || 'NORMAL'
    } as DropShadowEffect;
    
    card.effects = [shadow];
  }
  
  log(`📦 Created auto layout section card: ${name}`, 'log');
  return card;
}