# Draftly Examples - Atomic Design System

This folder contains example JSON files that demonstrate the Draftly plugin's Atomic Design System capabilities.

## Available Examples

### 🎨 Design System (`design-system.json`)
A comprehensive design system showcase featuring all atomic design components:
- **Atoms**: Icons, Inputs, Badges
- **Molecules**: Form Fields, Cards  
- **Organisms**: Headers, Product Grids

Perfect for creating component libraries and style guides.

### 🚀 Landing Page (`landing-page.json`)
A complete marketing landing page featuring:
- Hero section with CTA buttons
- Features showcase with cards
- Social proof with statistics
- Final call-to-action section
- Professional header with navigation

### 🛒 Shopping Cart (`shopping-cart.json`)
An e-commerce shopping cart interface including:
- Store header with navigation
- Cart items with quantity controls
- Order summary with pricing breakdown
- Promo code input
- Recommended products grid
- Complete checkout flow

## How to Use

1. **Open Figma** and load the Draftly plugin
2. **Go to Import tab** in the plugin UI
3. **Choose one of these methods**:
   - Upload a JSON file from this folder
   - Use a URL pointing to one of these examples
4. **Click render** and watch the magic happen!

## Atomic Design Structure

The examples follow atomic design principles:

```
Atoms (Basic UI elements)
├── Icons - Simple colored rectangles representing icons
├── Inputs - Form input fields with labels
└── Badges - Small status/category labels

Molecules (Component combinations)  
├── Cards - Content cards with images, titles, descriptions
└── Form Fields - Complete form inputs with validation states

Organisms (Complex sections)
├── Headers - Navigation headers with logo, menu, actions
└── Product Grids - Responsive product displays with cards
```

## Customization

Each example can be customized by modifying:
- **Colors**: Change hex color values in `fills` properties
- **Spacing**: Adjust `padding` and `spacing` in `autoLayout`
- **Content**: Update `text`, `title`, `description` fields
- **Sizing**: Modify `width`, `height`, and component dimensions
- **Layout**: Change `direction` and `alignment` in `autoLayout`

## Tips

- Start with `design-system.json` to understand all components
- Use `landing-page.json` for marketing pages
- Use `shopping-cart.json` for e-commerce interfaces
- Mix and match components to create custom layouts
- All examples use the Inter font family for consistency

## Support

If you encounter any issues:
1. Check that all required fonts are available in Figma
2. Ensure your JSON syntax is valid
3. Verify that component properties match the expected structure
4. Check the browser console for detailed error messages

Happy designing! 🎨