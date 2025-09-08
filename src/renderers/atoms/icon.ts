import { hexToRgb } from "../../main/utils";

export function renderIcon(nodeData: any): RectangleNode {
  const icon = figma.createRectangle();
  const size = nodeData.properties?.size || 24;
  
  icon.resize(size, size);
  icon.cornerRadius = nodeData.properties?.cornerRadius || 0;
  
  // Domyślne wypełnienie ikony
  const iconColor = nodeData.properties?.color || '#6B7280';
  icon.fills = [{
    type: 'SOLID',
    color: hexToRgb(iconColor),
    opacity: nodeData.properties?.opacity || 1
  }];
  
  return icon;
}
