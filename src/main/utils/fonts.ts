/**
 * Font utility functions
 */

/**
 * Bezpieczne ładowanie fontów z fallbackami
 * @param family Nazwa rodziny fontów
 * @param style Styl fontu
 * @returns Załadowaną czcionkę do użycia w fontName
 */
export async function loadFontSafely(family: string = 'Inter', style: string = 'Regular'): Promise<FontName> {
  const fallbacks = [
    { family, style },
    { family: 'Inter', style: 'Regular' },
    { family: 'Roboto', style: 'Regular' },
    { family: 'Arial', style: 'Regular' }
  ];
  
  for (const font of fallbacks) {
    try {
      await figma.loadFontAsync(font);
      return font;
    } catch (error) {
      // Continue to next fallback
    }
  }
  
  console.error('❌ Could not load any fallback font');
  // Return default that should always work
  const defaultFont = { family: 'Arial', style: 'Regular' };
  try {
    await figma.loadFontAsync(defaultFont);
    return defaultFont;
  } catch {
    throw new Error('Could not load any font');
  }
}