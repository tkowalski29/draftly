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