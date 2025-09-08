import { hexToRgb } from "../../main/utils";

export async function renderDivider(nodeData: any): Promise<FrameNode> {
  const divider = figma.createFrame();
  divider.name = nodeData.name;
  
  // Divider properties
  const width = nodeData.properties?.width || 200;
  const height = nodeData.properties?.height || 1;
  const color = nodeData.properties?.color || '#E5E7EB';
  const orientation = nodeData.properties?.orientation || 'horizontal';
  
  // Set dimensions based on orientation
  if (orientation === 'vertical') {
    divider.resize(height, width);
  } else {
    divider.resize(width, height);
  }
  
  // Set color
  const rgbColor = hexToRgb(color);
  divider.fills = [{ 
    type: 'SOLID', 
    color: rgbColor, 
    opacity: 1 
  }];
  
  // Remove border if any
  divider.strokes = [];
  
  return divider;
}