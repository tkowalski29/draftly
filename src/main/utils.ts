// Proste funkcje pomocnicze
import { logger } from './logger';

/**
 * Wysyła wiadomość do UI w celu jej zalogowania w konsoli deweloperskiej przeglądarki.
 * @param message Wiadomość do zalogowania.
 * @param type Typ logu (log, warn, error).
 */
export function log(message: string, type: 'log' | 'warn' | 'error' = 'log', data?: any, importType?: string, filesCount?: number) {
  // Convert type to match logger interface
  const logType = type === 'log' ? 'info' : type === 'warn' ? 'warn' : 'error';
  logger.log(message, logType, data, importType, filesCount);
}

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

/**
 * Konwertuje kolor w formacie hex (#RRGGBB) na obiekt RGB używany przez Figmę.
 * @param hex Kolor w formacie hex.
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 }; // Zwróć czarny w przypadku błędu
}
