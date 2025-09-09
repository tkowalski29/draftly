/**
 * Layout utility functions for Figma auto-layout
 */

export interface AutoLayoutConfig {
  direction?: 'HORIZONTAL' | 'VERTICAL';
  spacing?: number;
  padding?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  } | number;
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  fills?: Paint[];
  name?: string;
}

/**
 * Creates an auto-layout frame with specified configuration
 * @param config Auto-layout configuration
 * @returns Configured FrameNode
 */
export function createAutoLayoutFrame(config: AutoLayoutConfig = {}): FrameNode {
  const frame = figma.createFrame();
  
  // Set name if provided
  if (config.name) {
    frame.name = config.name;
  }
  
  // Enable auto-layout
  frame.layoutMode = config.direction || 'HORIZONTAL';
  
  // Set spacing
  if (config.spacing !== undefined) {
    frame.itemSpacing = config.spacing;
  }
  
  // Set padding
  if (config.padding !== undefined) {
    if (typeof config.padding === 'number') {
      frame.paddingTop = config.padding;
      frame.paddingBottom = config.padding;
      frame.paddingLeft = config.padding;
      frame.paddingRight = config.padding;
    } else {
      frame.paddingTop = config.padding.top || 0;
      frame.paddingBottom = config.padding.bottom || 0;
      frame.paddingLeft = config.padding.left || 0;
      frame.paddingRight = config.padding.right || 0;
    }
  }
  
  // Set alignment
  if (config.primaryAxisAlignItems) {
    frame.primaryAxisAlignItems = config.primaryAxisAlignItems;
  }
  
  if (config.counterAxisAlignItems) {
    frame.counterAxisAlignItems = config.counterAxisAlignItems;
  }
  
  // Set sizing modes
  if (config.primaryAxisSizingMode) {
    frame.primaryAxisSizingMode = config.primaryAxisSizingMode;
  }
  
  if (config.counterAxisSizingMode) {
    frame.counterAxisSizingMode = config.counterAxisSizingMode;
  }
  
  // Set fills
  if (config.fills) {
    frame.fills = config.fills;
  } else {
    frame.fills = []; // Transparent by default
  }
  
  return frame;
}

/**
 * Wraps components/nodes in auto-layout container
 * @param nodes Array of nodes to wrap
 * @param config Auto-layout configuration
 * @returns FrameNode containing all nodes in auto-layout
 */
export function wrapInAutoLayout(nodes: SceneNode[], config: AutoLayoutConfig = {}): FrameNode {
  const container = createAutoLayoutFrame(config);
  
  // Add all nodes to container
  nodes.forEach(node => {
    container.appendChild(node);
  });
  
  return container;
}

/**
 * Organizes variants in a grid layout using auto-layout
 * @param variants Array of component variants
 * @param config Grid configuration
 * @returns FrameNode with organized variants
 */
export function organizeVariantsInGrid(variants: ComponentNode[], config: {
  itemsPerRow?: number;
  rowSpacing?: number;
  itemSpacing?: number;
  containerName?: string;
  containerPadding?: number;
} = {}): FrameNode {
  const {
    itemsPerRow = 4,
    rowSpacing = 24,
    itemSpacing = 16,
    containerName = 'Component Variants',
    containerPadding = 20
  } = config;
  
  // Create main container
  const mainContainer = createAutoLayoutFrame({
    direction: 'VERTICAL',
    spacing: rowSpacing,
    padding: containerPadding,
    name: containerName,
    primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: 'MIN',
    primaryAxisSizingMode: 'AUTO',
    counterAxisSizingMode: 'AUTO'
  });
  
  // Group variants into rows
  const rows: ComponentNode[][] = [];
  for (let i = 0; i < variants.length; i += itemsPerRow) {
    rows.push(variants.slice(i, i + itemsPerRow));
  }
  
  // Create row containers
  rows.forEach((rowVariants, rowIndex) => {
    const rowContainer = createAutoLayoutFrame({
      direction: 'HORIZONTAL',
      spacing: itemSpacing,
      name: `Row ${rowIndex + 1}`,
      primaryAxisAlignItems: 'MIN',
      counterAxisAlignItems: 'CENTER',
      primaryAxisSizingMode: 'AUTO',
      counterAxisSizingMode: 'AUTO'
    });
    
    // Add variants to row
    rowVariants.forEach(variant => {
      // Remove from current parent if any
      if (variant.parent) {
        variant.remove();
      }
      rowContainer.appendChild(variant);
    });
    
    mainContainer.appendChild(rowContainer);
  });
  
  return mainContainer;
}