# Avatar Renderer

## Description
Renders a circular avatar component with initials or image placeholder. Avatars represent users and are commonly used in headers, profiles, and user lists.

## Properties
- `size`: Avatar diameter in pixels (default: 40)
- `backgroundColor`: Background color in hex format (default: #3B82F6)
- `initials`: User initials to display (default: 'U')
- `imageUrl`: URL to user image (shows placeholder if provided)
- `x`, `y`: Position coordinates (ignored in auto layout)

## Example Usage
```json
{
  "type": "AVATAR",
  "name": "User Avatar",
  "properties": {
    "size": 48,
    "backgroundColor": "#10B981",
    "initials": "JD"
  }
}
```

## Visual Output
- Perfect circle with specified size
- Background color from properties
- White initials text centered
- Camera emoji for image placeholders
- Responsive sizing for text based on avatar size

## Atomic Design Level
**Atom** - Basic user representation element used throughout interfaces.