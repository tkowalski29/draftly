import { log } from "../utils/index";

/**
 * Helper function to ensure we're on the correct page with retry logic
 * Used throughout the renderer to manage page switching robustly
 */
export async function ensurePageReady(targetPage: PageNode, context: string): Promise<boolean> {
  const maxRetries = 3;
  const retryDelay = 500; // 0.5 seconds for render-time checks
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Check if we're already on the correct page
    if (figma.currentPage.name === targetPage.name) {
      return true;
    }
    
    log(`🔄 ${context} - Próba ${attempt}/${maxRetries}: Przełączanie na ${targetPage.name}`, 'log');
    
    // Try to switch to the target page
    figma.currentPage = targetPage;
    
    // Wait and verify
    await new Promise(resolve => setTimeout(resolve, attempt === 1 ? 50 : retryDelay));
    
    if (figma.currentPage.name === targetPage.name) {
      log(`✅ ${context} - Strona gotowa: ${targetPage.name}`, 'log');
      return true;
    }
    
    log(`⚠️ ${context} - Nie udało się przełączyć (próba ${attempt}), aktualnie: ${figma.currentPage.name}`, 'warn');
  }
  
  log(`❌ ${context} - Nie udało się przełączyć na ${targetPage.name} po ${maxRetries} próbach`, 'error');
  return false;
}

/**
 * Find or create a design system page
 */
export function findOrCreateDesignSystemPage(pageName: string): PageNode {
  // Try to find existing page
  const existingPage = figma.root.children.find(
    child => child.type === 'PAGE' && child.name === pageName
  ) as PageNode;
  
  if (existingPage) {
    log(`🔍 Found existing design system page: ${pageName}`, 'log');
    return existingPage;
  }
  
  // Create new page
  const newPage = figma.createPage();
  newPage.name = pageName;
  log(`📄 Created new design system page: ${pageName}`, 'log');
  return newPage;
}

/**
 * Clear existing content on page if specified in settings
 */
export function clearPageContent(page: PageNode, shouldClear: boolean) {
  if (shouldClear && page.children.length > 0) {
    log(`🧹 Clearing existing content on page: ${page.name}`, 'log');
    page.children.forEach(child => child.remove());
  }
}