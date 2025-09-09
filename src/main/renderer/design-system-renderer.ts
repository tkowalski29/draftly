import { log } from "../utils/index";
import { ensurePageReady, findOrCreateDesignSystemPage } from "./page-management";
import { resolveDependenciesFromSettings, resolveDependencies } from "./dependency-resolver";
import { 
  positionComponent, 
  positionComponentArray, 
  calculateSectionLayout, 
  createSectionCard,
  PositionBounds,
  SpacingConfig 
} from "./component-positioning";
import { renderNode } from "./node-renderer";
import { renderButton } from "../../renderers/button/button";
import { renderIcon } from "../../renderers/atoms/icon/icon";

/**
 * Main design system folder renderer
 * Handles organizing and rendering all components by atomic design hierarchy
 */
export async function renderDesignSystemFolder(folderData: {[key: string]: string}): Promise<void> {
  log(`🎨 Rozpoczynam renderowanie Design Systemu z ${Object.keys(folderData).length} plików`);
  
  // Read settings if available
  let settings = null;
  const settingsPath = Object.keys(folderData).find(path => path.endsWith('settings.json'));
  if (settingsPath) {
    try {
      settings = JSON.parse(folderData[settingsPath]);
      log(`⚙️ Załadowano ustawienia z ${settingsPath.split('/').pop()}`, 'log');
    } catch (error: any) {
      log(`❌ Błąd parsowania ustawień: ${error.message}`, 'error');
    }
  }
  
  // Create or find design system page
  const pageName = settings?.designSystem?.pageName || '🤖 Design System';
  const page = findOrCreateDesignSystemPage(pageName);
  figma.currentPage = page;
  
  // Verify page is ready
  const pageReady = await ensurePageReady(page, 'Design System Setup');
  if (!pageReady) {
    log(`❌ Could not prepare design system page, continuing with current page: ${figma.currentPage.name}`, 'error');
  }
  
  // Parse and organize components
  const componentsByType = await parseAndOrganizeComponents(folderData, settings);
  
  // Render components by atomic design hierarchy
  await renderComponentsByHierarchy(componentsByType, settings);
  
  log('🎉 Design System został pomyślnie wygenerowany!');
}

/**
 * Parse all files and organize components by type
 */
async function parseAndOrganizeComponents(
  folderData: {[key: string]: string}, 
  settings: any
): Promise<{[key: string]: any[]}> {
  // Resolve dependencies and get sorted file order
  const sortedFiles = settings?.dependencies?.loadOrder 
    ? resolveDependenciesFromSettings(folderData, settings.dependencies.loadOrder)
    : resolveDependencies(folderData);
  
  const componentsByType: {[key: string]: any[]} = {};
  
  for (const filePath of sortedFiles) {
    try {
      const fileName = filePath.split('/').pop() || filePath;
      log(`📝 Przetwarzam plik: ${fileName}`);
      const jsonData = JSON.parse(folderData[filePath]);
      
      if (jsonData && jsonData.pages && jsonData.pages[0]) {
        // Support both old 'children' and new 'nodes' format
        const components = jsonData.pages[0].nodes || jsonData.pages[0].children;
        
        // Group components by type
        if (components && Array.isArray(components)) {
          for (const component of components) {
            const type = component.type;
            if (!componentsByType[type]) {
              componentsByType[type] = [];
            }
            componentsByType[type].push(component);
          }
        }
      }
    } catch (error: any) {
      log(`❌ BŁĄD podczas parsowania ${filePath}: ${error.message}`, 'error');
    }
  }
  
  return componentsByType;
}

/**
 * Render components organized by atomic design hierarchy
 */
async function renderComponentsByHierarchy(
  componentsByType: {[key: string]: any[]}, 
  settings: any
): Promise<void> {
  const hierarchy = settings?.designSystem?.atomicDesign?.hierarchy || getDefaultHierarchy();
  const spacing = getSpacingConfig(settings);
  const enableSectionCards = settings?.designSystem?.organization?.enableSectionCards || false;
  
  let yOffset = 50;
  const bounds: PositionBounds = { minX: Infinity, maxX: -Infinity, maxRowHeight: 0 };
  
  // Process each level of the atomic design hierarchy
  for (const [levelName, levelConfig] of Object.entries(hierarchy)) {
    const levelTypes = (levelConfig as any).types || [];
    const componentsInLevel = levelTypes.filter((type: string) => componentsByType[type]);
    
    if (componentsInLevel.length === 0) continue;
    
    log(`🔧 Renderowanie poziomu: ${levelName} (${componentsInLevel.join(', ')})`, 'log');
    
    yOffset = await renderHierarchyLevel(
      levelName, 
      componentsInLevel, 
      componentsByType, 
      yOffset, 
      bounds, 
      spacing, 
      enableSectionCards,
      settings
    );
    
    // Add spacing between sections
    yOffset += spacing.sectionSpacing;
  }
}

/**
 * Render a single hierarchy level (atoms, molecules, organisms)
 */
async function renderHierarchyLevel(
  levelName: string,
  componentTypes: string[],
  componentsByType: {[key: string]: any[]},
  startY: number,
  bounds: PositionBounds,
  spacing: SpacingConfig,
  enableSectionCards: boolean,
  settings: any
): Promise<number> {
  let yOffset = startY;
  let sectionMinX = Infinity;
  let sectionMaxX = -Infinity;
  let sectionHeight = 0;
  
  // First pass: calculate section bounds
  for (const componentType of componentTypes) {
    const components = componentsByType[componentType];
    if (!components || components.length === 0) continue;
    
    let xOffset = 50;
    const rowStartY = yOffset + spacing.cardPadding;
    
    // Calculate positions for each component (without rendering)
    for (const component of components) {
      // Estimate component dimensions (rough estimation)
      const estimatedWidth = 200; // Default component width
      const estimatedHeight = 100; // Default component height
      
      // Update section bounds
      sectionMinX = Math.min(sectionMinX, xOffset - spacing.cardPadding);
      sectionMaxX = Math.max(sectionMaxX, xOffset + estimatedWidth + spacing.cardPadding);
      
      xOffset += estimatedWidth + spacing.columnSpacing;
    }
    
    // Move to next row
    yOffset += 100 + spacing.rowSpacing; // Estimated row height
    sectionHeight = yOffset - startY;
  }
  
  // Create section card FIRST (if enabled) so it appears behind components
  let sectionCard: FrameNode | null = null;
  if (enableSectionCards && sectionMinX !== Infinity) {
    const cardWidth = sectionMaxX - sectionMinX;
    const cardHeight = sectionHeight;
    
    sectionCard = createSectionCard(
      levelName,
      sectionMinX,
      startY,
      cardWidth,
      cardHeight,
      {
        background: settings?.designSystem?.organization?.cardBackground || '#FFFFFF',
        cornerRadius: settings?.designSystem?.organization?.cardCornerRadius || 12,
        shadow: settings?.designSystem?.organization?.cardShadow
      }
    );
  }
  
  // Reset for actual rendering
  yOffset = startY;
  bounds.maxRowHeight = 0;
  
  // Second pass: actually render components
  for (const componentType of componentTypes) {
    const components = componentsByType[componentType];
    if (!components || components.length === 0) continue;
    
    log(`🔨 Renderowanie typu: ${componentType} (${components.length} komponentów)`, 'log');
    
    let xOffset = 50;
    const rowStartY = yOffset + spacing.cardPadding;
    
    // Render each component
    for (const component of components) {
      const renderedComponents = await renderComponent(component, componentType, xOffset, rowStartY, spacing);
      
      if (renderedComponents.length > 0) {
        // Update bounds
        for (const comp of renderedComponents) {
          bounds.minX = Math.min(bounds.minX, comp.x);
          bounds.maxX = Math.max(bounds.maxX, comp.x + comp.width);
          bounds.maxRowHeight = Math.max(bounds.maxRowHeight, comp.height);
        }
        
        // Update x position for next component
        const lastComponent = renderedComponents[renderedComponents.length - 1];
        xOffset = lastComponent.x + lastComponent.width + spacing.columnSpacing;
      }
    }
    
    // Move to next row
    yOffset += bounds.maxRowHeight + spacing.rowSpacing;
    bounds.maxRowHeight = 0; // Reset for next row
  }
  
  return yOffset;
}

/**
 * Render a single component with proper handling for different types
 */
async function renderComponent(
  component: any, 
  componentType: string, 
  x: number, 
  y: number, 
  spacing: SpacingConfig
): Promise<SceneNode[]> {
  const page = figma.currentPage;
  
  try {
    await ensurePageReady(page, `Renderowanie ${componentType}`);
    
    let componentSets: SceneNode[] = [];
    
    if (componentType === 'BUTTON') {
      const buttonSet = await renderButton(component);
      if (buttonSet) {
        buttonSet.x = x;
        buttonSet.y = y;
        componentSets = [buttonSet];
      }
    } else if (componentType === 'ICON') {
      const iconResult = renderIcon(component, page);
      
      if (Array.isArray(iconResult)) {
        // Handle multiple ComponentSets - position them horizontally
        let currentX = x;
        iconResult.forEach((iconSet) => {
          iconSet.x = currentX;
          iconSet.y = y;
          currentX += iconSet.width + spacing.columnSpacing;
        });
        componentSets = iconResult;
      } else {
        iconResult.x = x;
        iconResult.y = y;
        componentSets = [iconResult];
      }
    } else {
      // Handle other component types through renderNode
      const rendered = await renderNode(component, page);
      if (rendered) {
        rendered.x = x;
        rendered.y = y;
        componentSets = [rendered];
      }
    }
    
    // Set component names
    componentSets.forEach((comp, index) => {
      const componentName = component.name || `${componentType} Component${index > 0 ? ` ${index + 1}` : ''}`;
      comp.name = componentName;
    });
    
    log(`✅ Stworzono ${componentSets.length} ComponentSet(s) dla ${component.name || componentType}`);
    return componentSets;
    
  } catch (error: any) {
    log(`❌ BŁĄD tworzenia ComponentSet ${componentType}: ${error.message}`, 'error');
    return [];
  }
}

/**
 * Get default atomic design hierarchy
 */
function getDefaultHierarchy() {
  return {
    atoms: {
      level: 0,
      types: ["ICON", "BADGE", "AVATAR", "INPUT", "TEXT", "DIVIDER"]
    },
    molecules: {
      level: 1,
      types: ["BUTTON", "CARD", "FORM_FIELD"]
    },
    organisms: {
      level: 2,
      types: ["HEADER", "PRODUCT_GRID"]
    }
  };
}

/**
 * Get spacing configuration from settings
 */
function getSpacingConfig(settings: any): SpacingConfig {
  const spacing = settings?.designSystem?.organization?.spacing;
  return {
    cardPadding: spacing?.cardPadding || 32,
    columnSpacing: spacing?.columnSpacing || 40,
    rowSpacing: spacing?.rowSpacing || 60,
    sectionSpacing: spacing?.sectionSpacing || 100
  };
}