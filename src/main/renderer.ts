/**
 * Main renderer - simplified and modular
 * Most functionality has been moved to utils/ folder for better organization
 */

// Import all utilities from the utils folder
export {
  // Core rendering functions
  renderTree,
  renderDesignSystemFolder,
  renderNode,
  
  // Property management
  applyProperties,
  
  // Page management
  ensurePageReady,
  findOrCreateDesignSystemPage,
  clearPageContent,
  
  // Dependency resolution
  resolveDependencies,
  resolveDependenciesFromSettings,
  
  // Component positioning
  positionComponent,
  positionComponentArray,
  calculateSectionLayout,
  createSectionCard,
  
  // Types
  type PositionBounds,
  type SpacingConfig
} from "./renderer/index";

// Re-export logging and other utilities that external modules might need
export { log, hexToRgb, loadFontSafely, type AutoLayoutConfig } from "./utils/index";