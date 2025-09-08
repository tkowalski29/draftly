# JSON to Figma Renderer

This project is a Figma plugin that renders components, pages, and layouts from a structured JSON file.

## Project Structure

- `src/`: Source code
  - `ui/`: React code for the plugin's UI
  - `main/`: Main plugin code that interacts with the Figma API
- `dist/`: Bundled output for Figma
- `manifest.json`: Figma plugin manifest
- `package.json`: Project dependencies and scripts

## How to Build

This project requires a bundler like Webpack or Vite to compile the source code into a format Figma can use.

1.  Install dependencies: `npm install`
2.  Run the build command: `npm run build` (Note: script is a placeholder)
3.  Load the plugin in Figma by pointing to the `manifest.json` file.
