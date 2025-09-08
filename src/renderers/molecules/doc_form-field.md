# Form Field Renderer

## Description
Renders a complete form field with label, input, validation states, and helper/error text. Form fields combine input atoms with enhanced functionality and feedback.

## Properties
- `label`: Field label text
- `placeholder`: Input placeholder text
- `value`: Pre-filled value (optional)
- `width`: Field width (default: 300px)
- `state`: Field state (default, error, success, disabled)
- `required`: Boolean indicating required field
- `helperText`: Helper text for guidance
- `errorText`: Error message when state is error
- `x`, `y`: Position coordinates (ignored in auto layout)

## Available States
- `default`: Normal input state
- `error`: Red border and error text
- `success`: Green border indicating valid input
- `disabled`: Grayed out, non-interactive state

## Example Usage
```json
{
  "type": "FORM_FIELD",
  "name": "Email Field",
  "properties": {
    "label": "Email Address",
    "placeholder": "user@example.com",
    "width": 320,
    "state": "success",
    "required": true,
    "helperText": "We'll use this to send you updates"
  }
}
```

## Visual Output
- Label with optional required indicator
- Styled input field with state-based colors
- Helper text or error message below
- Proper spacing and typography
- Visual feedback for different states

## Atomic Design Level
**Molecule** - Enhanced input atom with label, validation, and feedback systems.