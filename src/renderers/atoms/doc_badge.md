# Badge Renderer

## Description
Renders a styled badge/tag element with text and color variants. Badges are used for status indicators, categories, and labels.

## Properties
- `text`: Text content displayed in badge
- `variant`: Badge style variant (default, primary, success, warning, danger)
- `size`: Badge size (small, medium, large)
- `x`, `y`: Position coordinates (ignored in auto layout)

## Available Variants
- `default`: Gray background with dark text
- `primary`: Blue background with white text
- `success`: Green background with white text
- `warning`: Orange background with white text
- `danger`: Red background with white text

## Example Usage
```json
{
  "type": "BADGE",
  "name": "Status Badge",
  "text": "Active",
  "properties": {
    "variant": "success",
    "size": "medium"
  }
}
```

## Visual Output
- Rounded rectangular background
- Centered text with appropriate contrast
- Color scheme based on variant
- Responsive sizing based on content

## Atomic Design Level
**Atom** - Small, reusable labeling element for status and categorization.