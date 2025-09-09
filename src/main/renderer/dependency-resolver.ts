import { log } from "../utils/index";

/**
 * Resolve dependencies from settings with strict ordering
 */
export function resolveDependenciesFromSettings(folderData: {[key: string]: string}, loadOrder: string[]): string[] {
  const resolved: string[] = [];
  const remaining = new Set(Object.keys(folderData));
  
  log(`🔧 Resolving dependencies with strict order: ${loadOrder.join(' → ')}`, 'log');
  
  // First, add files in the specified load order
  for (const fileName of loadOrder) {
    if (remaining.has(fileName)) {
      resolved.push(fileName);
      remaining.delete(fileName);
      log(`📦 Added to load order: ${fileName}`, 'log');
    } else {
      log(`⚠️ File in load order not found: ${fileName}`, 'warn');
    }
  }
  
  // Then add any remaining files
  for (const fileName of remaining) {
    resolved.push(fileName);
    log(`📦 Added remaining file: ${fileName}`, 'log');
  }
  
  log(`✅ Final load order: ${resolved.join(' → ')}`, 'log');
  return resolved;
}

/**
 * Resolve dependencies using basic topological sort (legacy method)
 */
export function resolveDependencies(folderData: {[key: string]: string}): string[] {
  const resolved: string[] = [];
  const remaining = new Map<string, string[]>();
  
  // Parse dependencies from each file
  for (const [fileName, content] of Object.entries(folderData)) {
    try {
      const parsed = JSON.parse(content);
      const deps = parsed.dependencies || [];
      remaining.set(fileName, deps.filter((dep: string) => folderData.hasOwnProperty(dep)));
    } catch (error) {
      log(`❌ Error parsing ${fileName}: ${error}`, 'error');
      remaining.set(fileName, []);
    }
  }
  
  // Simple topological sort
  while (remaining.size > 0) {
    let progress = false;
    
    for (const [fileName, deps] of remaining.entries()) {
      // Check if all dependencies are resolved
      const unresolvedDeps = deps.filter(dep => !resolved.includes(dep) && remaining.has(dep));
      
      if (unresolvedDeps.length === 0) {
        resolved.push(fileName);
        remaining.delete(fileName);
        progress = true;
        log(`✅ Resolved: ${fileName} (dependencies: ${deps.join(', ') || 'none'})`, 'log');
        break;
      }
    }
    
    if (!progress) {
      // Circular dependency or missing dependency - add remaining files
      log('⚠️ Circular dependency detected or missing files. Adding remaining files in arbitrary order.', 'warn');
      for (const fileName of remaining.keys()) {
        resolved.push(fileName);
      }
      break;
    }
  }
  
  return resolved;
}