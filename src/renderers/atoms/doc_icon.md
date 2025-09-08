# Icon Renderer

## Description
Renders a simple colored rectangular icon element as a Figma frame. Icons are the most basic visual elements in the atomic design system.

## Properties
- `size`: Icon dimensions (width and height)
- `color`: Icon color in hex format
- `x`, `y`: Position coordinates (ignored in auto layout)

## Example Usage
```json
{
  "type": "ICON",
  "name": "User Icon",
  "properties": {
    "size": 24,
    "color": "#3B82F6"
  }
}
```

## Visual Output
- Square frame with solid color fill
- No border or effects
- Used for representing simple icons in designs

## Atomic Design Level
**Atom** - Basic building block for visual indicators and decorative elements.