import { log } from "../utils/index";
import { renderNode } from "./node-renderer";
import { renderDesignSystemFolder } from "./design-system-renderer";

/**
 * Main tree renderer - handles both single files and design system folders
 */
export async function renderTree(json: any, importType?: string) {
  log(`🚀 renderTree called with importType: ${importType}`, 'log');
  
  if (!json) {
    log('Nie przekazano danych do renderowania', 'error');
    return;
  }

  try {
    // Handle design system folder import (multiple JSON files)
    if (importType === 'design-system' || importType === 'designSystemFolder' || 
        (typeof json === 'object' && !json.pages && !json.version)) {
      
      log('🎨 Renderowanie jako Design System Folder', 'log');
      await renderDesignSystemFolder(json);
      return;
    }

    // Handle single JSON file
    log('📄 Renderowanie pojedynczego pliku JSON', 'log');
    
    if (!json.pages || !Array.isArray(json.pages)) {
      log('Brak właściwości pages w JSON', 'error');
      return;
    }

    const rootFrame = figma.createFrame();
    rootFrame.name = 'Import Root';
    rootFrame.x = 0;
    rootFrame.y = 0;

    let totalHeight = 0;
    let maxWidth = 0;

    // Process each page
    for (const page of json.pages) {
      if (page.nodes || page.children) {
        const nodes = page.nodes || page.children;
        
        const pageFrame = figma.createFrame();
        pageFrame.name = page.name || 'Page';
        pageFrame.x = 0;
        pageFrame.y = totalHeight;

        let pageHeight = 0;
        let pageWidth = 0;

        // Render each node in the page
        for (const nodeData of nodes) {
          try {
            log(`🔧 Renderowanie węzła: ${nodeData.name} (${nodeData.type})`);
            const node = await renderNode(nodeData, pageFrame);
            
            if (node) {
              pageHeight = Math.max(pageHeight, node.y + node.height);
              pageWidth = Math.max(pageWidth, node.x + node.width);
            }
          } catch (error: any) {
            log(`❌ Błąd renderowania węzła ${nodeData.name}: ${error.message}`, 'error');
          }
        }

        // Adjust page frame size
        if (pageWidth > 0 && pageHeight > 0) {
          pageFrame.resize(Math.max(pageWidth + 50, 100), Math.max(pageHeight + 50, 100));
        } else {
          pageFrame.resize(100, 100);
        }

        rootFrame.appendChild(pageFrame);
        totalHeight += pageFrame.height + 50;
        maxWidth = Math.max(maxWidth, pageFrame.width);
      }
    }

    // Adjust root frame size
    rootFrame.resize(Math.max(maxWidth + 50, 200), Math.max(totalHeight + 50, 200));
    
    // Center the viewport on the created content
    figma.viewport.scrollAndZoomIntoView([rootFrame]);
    
    log('✅ Import zakończony pomyślnie');

  } catch (error: any) {
    log(`❌ Błąd podczas renderowania: ${error.message}`, 'error');
    console.error('Detailed error:', error);
  }
}