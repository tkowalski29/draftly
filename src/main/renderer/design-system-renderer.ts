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
  
  // Create main container with auto layout for the entire design system
  const mainContainer = figma.createFrame();
  mainContainer.name = 'Design System Container';
  mainContainer.x = 50;
  mainContainer.y = 50;
  
  // Set up vertical auto layout for sections
  mainContainer.layoutMode = 'VERTICAL';
  mainContainer.primaryAxisSizingMode = 'AUTO';
  mainContainer.counterAxisSizingMode = 'AUTO';
  mainContainer.itemSpacing = spacing.sectionSpacing;
  mainContainer.paddingTop = 0;
  mainContainer.paddingBottom = 0;
  mainContainer.paddingLeft = 0;
  mainContainer.paddingRight = 0;
  mainContainer.fills = []; // Transparent background
  
  figma.currentPage.appendChild(mainContainer);
  
  let yOffset = 50;
  const bounds: PositionBounds = { minX: Infinity, maxX: -Infinity, maxRowHeight: 0 };
  
  // Process each level of the atomic design hierarchy
  for (const [levelName, levelConfig] of Object.entries(hierarchy)) {
    const levelTypes = (levelConfig as any).types || [];
    const componentsInLevel = levelTypes.filter((type: string) => componentsByType[type]);
    
    if (componentsInLevel.length === 0) continue;
    
    log(`🔧 Renderowanie poziomu: ${levelName} (${componentsInLevel.join(', ')})`, 'log');
    
    const sectionCard = await renderHierarchyLevelToContainer(
      levelName, 
      componentsInLevel, 
      componentsByType, 
      spacing, 
      enableSectionCards,
      settings
    );
    
    if (sectionCard) {
      mainContainer.appendChild(sectionCard);
    }
  }
}

/**
 * Render a single hierarchy level (atoms, molecules, organisms) as a container
 */
async function renderHierarchyLevelToContainer(
  levelName: string,
  componentTypes: string[],
  componentsByType: {[key: string]: any[]},
  spacing: SpacingConfig,
  enableSectionCards: boolean,
  settings: any
): Promise<FrameNode | null> {
  // Create section card with auto layout (if enabled)
  let sectionCard: FrameNode | null = null;
  if (enableSectionCards) {
    sectionCard = createSectionCard(
      levelName,
      0, // X position (will be handled by parent auto layout)
      0, // Y position (will be handled by parent auto layout)
      0, // Width (will be auto-sized)
      0, // Height (will be auto-sized)
      {
        background: settings?.designSystem?.organization?.cardBackground || '#FFFFFF',
        cornerRadius: settings?.designSystem?.organization?.cardCornerRadius || 12,
        shadow: settings?.designSystem?.organization?.cardShadow
      }
    );
  } else {
    // Create a transparent container even if section cards are disabled
    sectionCard = figma.createFrame();
    sectionCard.name = `${levelName} Container`;
    sectionCard.layoutMode = 'HORIZONTAL';
    sectionCard.primaryAxisSizingMode = 'AUTO';
    sectionCard.counterAxisSizingMode = 'AUTO';
    sectionCard.itemSpacing = spacing.columnSpacing;
    sectionCard.fills = []; // Transparent
  }
  
  // Render components and add them to the section card
  for (const componentType of componentTypes) {
    const components = componentsByType[componentType];
    if (!components || components.length === 0) continue;
    
    log(`🔨 Renderowanie typu: ${componentType} (${components.length} komponentów)`, 'log');
    
    // Render each component
    for (const component of components) {
      const renderedComponents = await renderComponent(
        component, 
        componentType, 
        0, // X position (will be handled by auto layout)
        0, // Y position (will be handled by auto layout) 
        spacing
      );
      
      if (renderedComponents.length > 0) {
        for (const comp of renderedComponents) {
          // Reset position - auto layout will handle it
          comp.x = 0;
          comp.y = 0;
          
          if (comp.parent !== sectionCard) {
            sectionCard.appendChild(comp);
          }
        }
      }
    }
  }
  
  log(`✅ Completed section: ${levelName} with auto layout`, 'log');
  return sectionCard;
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
        // No positioning - will be handled by auto layout parent
        componentSets = [buttonSet];
      }
    } else if (componentType === 'ICON') {
      const iconResult = renderIcon(component, page);
      
      if (Array.isArray(iconResult)) {
        // Handle multiple ComponentSets - auto layout will handle spacing
        componentSets = iconResult;
      } else {
        // No positioning - will be handled by auto layout parent
        componentSets = [iconResult];
      }
    } else {
      // Handle other component types through renderNode
      const rendered = await renderNode(component, page);
      if (rendered) {
        // No positioning - will be handled by auto layout parent
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