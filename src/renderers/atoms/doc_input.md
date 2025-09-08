# Input Renderer

## Description
Renders a basic input field with label, placeholder text, and helper text. Input fields are fundamental form atoms in the design system.

## Properties
- `label`: Input field label text
- `placeholder`: Placeholder text shown inside input
- `helperText`: Small helper text below input
- `width`: Input field width (default: 240px)
- `x`, `y`: Position coordinates (ignored in auto layout)

## Example Usage
```json
{
  "type": "INPUT",
  "name": "Email Input",
  "properties": {
    "label": "Email Address",
    "placeholder": "Enter your email",
    "width": 300,
    "helperText": "We'll never share your email"
  }
}
```

## Visual Output
- Label text above input field
- Styled input box with border and placeholder
- Helper text below input (if provided)
- Inter font family used throughout

## Atomic Design Level
**Atom** - Basic form input element that can be combined into larger form structures.