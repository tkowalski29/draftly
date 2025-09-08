# Product Grid Renderer

## Description
Renders a responsive grid of product cards. Product grids are complex organisms that arrange multiple card molecules in a structured layout.

## Properties
- `columns`: Number of columns in grid (default: 3)
- `spacing`: Space between grid items (default: 24)
- `products`: Array of product items with card properties
- `x`, `y`: Position coordinates (ignored in auto layout)

## Product Item Properties
Each product inherits card properties:
- `title`: Product title
- `description`: Product description
- `image`: Boolean for image display
- `imageHeight`: Height of product image
- `price`: Product price (displayed as action)
- `actions`: Additional action buttons

## Example Usage
```json
{
  "type": "PRODUCT_GRID",
  "name": "Featured Products",
  "properties": {
    "columns": 3,
    "spacing": 24,
    "products": [
      {
        "title": "Product One",
        "description": "Product description here",
        "image": true,
        "imageHeight": 200,
        "price": "$99.99",
        "actions": [{"text": "Add to Cart", "variant": "primary"}]
      }
    ]
  }
}
```

## Visual Output
- Grid container with specified columns
- Even spacing between product cards
- Responsive layout that adapts to content
- Each product rendered as complete card
- Proper alignment and spacing

## Atomic Design Level
**Organism** - Complex grid layout combining multiple card molecules into a structured product showcase.