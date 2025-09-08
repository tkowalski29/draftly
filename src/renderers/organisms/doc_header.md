# Header Renderer

## Description
Renders a complete application header with brand, logo, navigation, and action elements. Headers are complex organisms that combine multiple molecules and atoms.

## Properties
- `width`: Header width (default: 1200px)
- `brand`: Brand/company name text
- `logo`: Boolean indicating if logo placeholder should be shown
- `navigation`: Array of navigation items with text and active state
- `actions`: Array of action elements (buttons, avatars, etc.)
- `x`, `y`: Position coordinates (ignored in auto layout)

## Navigation Item Properties
- `text`: Navigation link text
- `active`: Boolean indicating active/current page

## Action Element Properties
- `type`: Action type (button, avatar)
- `text`: Button text (for button type)
- `variant`: Button variant (for button type)

## Example Usage
```json
{
  "type": "HEADER",
  "name": "Main Header",
  "properties": {
    "width": 1200,
    "brand": "Company Name",
    "logo": true,
    "navigation": [
      {"text": "Home", "active": true},
      {"text": "Products"},
      {"text": "About"},
      {"text": "Contact"}
    ],
    "actions": [
      {"type": "button", "text": "Sign In", "variant": "secondary"},
      {"type": "button", "text": "Get Started", "variant": "primary"},
      {"type": "avatar"}
    ]
  }
}
```

## Visual Output
- Full-width header container with background
- Left-aligned brand and logo
- Center-aligned navigation menu
- Right-aligned action buttons and elements
- Proper spacing and typography throughout

## Atomic Design Level
**Organism** - Complex header combining brand, navigation, and action elements into a complete interface section.