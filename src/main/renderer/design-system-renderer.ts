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
import { renderGenericComponent } from "../../renderers/generic-component-renderer";
import { renderButtonWithInheritance } from "../../renderers/molecules/button/button-renderer";
import { renderIconWithInheritance } from "../../renderers/atoms/icon/icon-renderer";

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
  
  // Parse and organize components by sections
  const componentsBySection = await parseAndOrganizeComponentsBySections(folderData, settings);
  
  // Render components by sections hierarchy
  await renderComponentsByHierarchy(componentsBySection, settings);
  
  log('🎉 Design System został pomyślnie wygenerowany!');
}

/**
 * Parse all files and organize components by sections (with file filtering)
 */
async function parseAndOrganizeComponentsBySections(
  folderData: {[key: string]: string}, 
  settings: any
): Promise<{[key: string]: any[]}> {
  const hierarchy = settings?.designSystem?.atomicDesign?.hierarchy || getDefaultHierarchy();
  const componentsBySection: {[key: string]: any[]} = {};
  
  // Initialize sections
  for (const sectionName of Object.keys(hierarchy)) {
    componentsBySection[sectionName] = [];
  }
  
  // Resolve dependencies and get sorted file order
  const sortedFiles = settings?.dependencies?.loadOrder 
    ? resolveDependenciesFromSettings(folderData, settings.dependencies.loadOrder)
    : resolveDependencies(folderData);
  
  for (const filePath of sortedFiles) {
    try {
      const fileName = filePath.split('/').pop() || filePath;
      log(`📝 Przetwarzam plik: ${fileName}`);
      const jsonData = JSON.parse(folderData[filePath]);
      
      if (jsonData && jsonData.pages && jsonData.pages[0]) {
        // Support both old 'children' and new 'nodes' format
        const components = jsonData.pages[0].nodes || jsonData.pages[0].children;
        
        if (components && Array.isArray(components)) {
          // Find which section(s) this file belongs to
          const sectionsForFile = findSectionsForFile(fileName, hierarchy);
          
          for (const sectionName of sectionsForFile) {
            const sectionConfig = hierarchy[sectionName] || {};
            for (const component of components) {
              // Add metadata about source file, section, and renderer
              const componentWithMetadata = {
                ...component,
                _sourceFile: fileName,
                _section: sectionName,
                _renderer: sectionConfig.renderer || null
              };
              componentsBySection[sectionName].push(componentWithMetadata);
            }
          }
        }
      }
    } catch (error: any) {
      log(`❌ BŁĄD podczas parsowania ${filePath}: ${error.message}`, 'error');
    }
  }
  
  return componentsBySection;
}

/**
 * Find which sections a file should be rendered in
 */
function findSectionsForFile(fileName: string, hierarchy: any): string[] {
  const sections: string[] = [];
  
  for (const [sectionName, sectionConfig] of Object.entries(hierarchy)) {
    const config = sectionConfig as any;
    
    // Check if section has file filters
    if (config.files && Array.isArray(config.files)) {
      // Check both exact match and filename-only match
      const matchesFile = config.files.some((filePath: string) => 
        filePath === fileName || filePath.endsWith('/' + fileName)
      );
      
      if (matchesFile) {
        sections.push(sectionName);
        log(`📂 File ${fileName} matched section: ${sectionName}`, 'log');
      }
    } else {
      // If no file filter, include in all sections (backward compatibility)
      sections.push(sectionName);
    }
  }
  
  return sections;
}

/**
 * Legacy function - kept for potential fallback
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
 * Render components organized by sections hierarchy
 */
async function renderComponentsByHierarchy(
  componentsBySection: {[key: string]: any[]}, 
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
  
  // Process each section defined in hierarchy
  for (const [sectionName, sectionConfig] of Object.entries(hierarchy)) {
    const components = componentsBySection[sectionName] || [];
    
    if (components.length === 0) continue;
    
    const sourceFiles = [...new Set(components.map(c => c._sourceFile))];
    log(`🔧 Renderowanie sekcji: ${sectionName} (${components.length} komponentów z plików: ${sourceFiles.join(', ')})`, 'log');
    
    const sectionCard = await renderSectionToContainer(
      sectionName, 
      components,
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
 * Render a single section as a container
 */
async function renderSectionToContainer(
  sectionName: string,
  components: any[],
  spacing: SpacingConfig,
  enableSectionCards: boolean,
  settings: any
): Promise<FrameNode | null> {
  // Create section card with auto layout (if enabled)
  let sectionCard: FrameNode | null = null;
  if (enableSectionCards) {
    sectionCard = createSectionCard(
      sectionName,
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
    sectionCard.name = `${sectionName} Container`;
    sectionCard.layoutMode = 'HORIZONTAL';
    sectionCard.primaryAxisSizingMode = 'AUTO';
    sectionCard.counterAxisSizingMode = 'AUTO';
    sectionCard.itemSpacing = spacing.columnSpacing;
    sectionCard.fills = []; // Transparent
  }
  
  // Render components and add them to the section card
  log(`🔨 Renderowanie sekcji: ${sectionName} (${components.length} komponentów)`, 'log');
  
  for (const component of components) {
    const renderedComponents = await renderComponent(
      component, 
      component.type, 
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
  
  log(`✅ Completed section: ${sectionName} with auto layout`, 'log');
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
    
    if (componentType === 'GENERIC') {
      // Use renderer type from settings (via _renderer metadata)
      const rendererType = component._renderer;
      
      if (rendererType === 'BUTTON_INHERITANCE') {
        // Use button renderer with inheritance (from settings)
        log(`🎯 Using ButtonRenderer with inheritance for: ${component.name}`, 'log');
        const buttonResult = await renderButtonWithInheritance(component, page);
        componentSets = Array.isArray(buttonResult) ? buttonResult : [buttonResult];
        
      } else if (rendererType === 'ICON_INHERITANCE') {
        // Use icon renderer with inheritance (from settings)
        log(`🎯 Using IconRenderer with inheritance for: ${component.name}`, 'log');
        const iconResult = await renderIconWithInheritance(component, page);
        componentSets = Array.isArray(iconResult) ? iconResult : [iconResult];
        
      } else if (component.name && component.name.includes('[Button]')) {
        // Fallback: Use button renderer with inheritance (name-based)
        log(`🔄 Fallback to ButtonRenderer for: ${component.name}`, 'log');
        const buttonResult = await renderButtonWithInheritance(component, page);
        componentSets = Array.isArray(buttonResult) ? buttonResult : [buttonResult];
        
      } else if (component.name && component.name.includes('[Icon]')) {
        // Fallback: Use icon renderer with inheritance (name-based)
        log(`🔄 Fallback to IconRenderer for: ${component.name}`, 'log');
        const iconResult = await renderIconWithInheritance(component, page);
        componentSets = Array.isArray(iconResult) ? iconResult : [iconResult];
        
      } else {
        // Use generic renderer for other configurable components
        log(`🎨 Using generic renderer for: ${component.name}`, 'log');
        const genericResult = await renderGenericComponent(component, page);
        componentSets = Array.isArray(genericResult) ? genericResult : [genericResult];
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
      types: ["GENERIC", "ICON", "BADGE", "AVATAR", "INPUT", "TEXT", "DIVIDER"]
    },
    molecules: {
      level: 1,
      types: ["GENERIC", "BUTTON", "CARD", "FORM_FIELD"]
    },
    organisms: {
      level: 2,
      types: ["GENERIC", "HEADER", "PRODUCT_GRID"]
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