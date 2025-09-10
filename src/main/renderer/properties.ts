import { hexToRgb, loadFontSafely } from "../utils/index";

/**
 * Apply properties to a Figma node
 * Handles sizing, positioning, auto layout, styling, and text properties
 */
export async function applyProperties(node: SceneNode, props: any) {
  if (!props) return;

  // Rozmiar i pozycja
  if (props.x) node.x = props.x;
  if (props.y) node.y = props.y;
  if (node.type === 'FRAME' || node.type === 'RECTANGLE') {
    if (props.width && props.width !== 'HUG') node.resize(props.width, node.height);
    if (props.height && props.height !== 'HUG') node.resize(node.width, props.height);
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
    if (props.autoLayout.alignment) node.primaryAxisAlignItems = props.autoLayout.alignment;
    if (props.width === 'HUG') node.primaryAxisSizingMode = 'AUTO';
    if (props.height === 'HUG') node.counterAxisSizingMode = 'AUTO';
  }

  // Wygląd
  if (props.fills && 'fills' in node) {
    const fills = props.fills.map((fill: any) => {
      const newFill: SolidPaint = {
        type: 'SOLID',
        color: hexToRgb(fill.color),
        opacity: fill.opacity ?? 1
      };
      return newFill;
    });
    (node as any).fills = fills;
  }

  // Tekst
  if (props.text && node.type === 'TEXT') {
    const textNode = node as TextNode;
    
    // Load font BEFORE setting text
    if (props.fontFamily || props.fontWeight) {
      const loadedFont = await loadFontSafely(props.fontFamily, props.fontWeight);
      textNode.fontName = loadedFont;
    } else {
      // Load default font if no specific font requested
      const defaultFont = await loadFontSafely('Inter', 'Regular');
      textNode.fontName = defaultFont;
    }

    // Now safe to set text
    textNode.characters = props.text;

    if (props.fontSize) {
      textNode.fontSize = props.fontSize;
    }

    if (props.textColor) {
      textNode.fills = [{
        type: 'SOLID',
        color: hexToRgb(props.textColor),
        opacity: 1
      }];
    }

    if (props.textAlign) {
      textNode.textAlignHorizontal = props.textAlign;
    }
  }

  // Promień narożników
  if (props.cornerRadius && 'cornerRadius' in node) {
    (node as any).cornerRadius = props.cornerRadius;
  }

  // Opacity
  if (props.opacity !== undefined && 'opacity' in node) {
    (node as any).opacity = props.opacity;
  }

  // Effects (shadows, blur, etc.)
  if (props.effects && 'effects' in node) {
    (node as any).effects = props.effects.map((effect: any) => {
      if (effect.type === 'DROP_SHADOW') {
        return {
          type: 'DROP_SHADOW',
          color: { 
            r: effect.color?.r ?? 0, 
            g: effect.color?.g ?? 0, 
            b: effect.color?.b ?? 0, 
            a: effect.color?.a ?? 1 
          },
          offset: { x: effect.offset?.x ?? 0, y: effect.offset?.y ?? 2 },
          radius: effect.radius ?? 4,
          spread: effect.spread ?? 0,
          visible: effect.visible ?? true,
          blendMode: effect.blendMode ?? 'NORMAL'
        } as DropShadowEffect;
      }
      return effect;
    });
  }
}