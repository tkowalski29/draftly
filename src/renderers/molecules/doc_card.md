# Card Renderer

## Description
Renders a complete card component with optional image, title, description, and action buttons. Cards combine multiple atoms to create content containers.

## Properties
- `width`: Card width (default: 320px)
- `image`: Boolean indicating if card has image
- `imageHeight`: Height of image area (default: 200px)
- `title`: Card title text
- `description`: Card description text
- `actions`: Array of action buttons with text and variant
- `x`, `y`: Position coordinates (ignored in auto layout)

## Action Button Properties
- `text`: Button text
- `variant`: Button style (primary, secondary, danger, etc.)

## Example Usage
```json
{
  "type": "CARD",
  "name": "Product Card",
  "properties": {
    "width": 300,
    "image": true,
    "imageHeight": 160,
    "title": "Product Name",
    "description": "Product description text here.",
    "actions": [
      {
        "text": "Buy Now",
        "variant": "primary"
      },
      {
        "text": "Add to Cart",
        "variant": "secondary"
      }
    ]
  }
}
```

## Visual Output
- Card container with background and border
- Optional image placeholder at top
- Title and description with proper typography
- Action buttons at bottom
- Proper spacing and padding throughout

## Atomic Design Level
**Molecule** - Combines text, image, and button atoms into a functional content unit.