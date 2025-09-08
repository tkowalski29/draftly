// Proste funkcje pomocnicze

/**
 * Wysyła wiadomość do UI w celu jej zalogowania w konsoli deweloperskiej przeglądarki.
 * @param message Wiadomość do zalogowania.
 * @param type Typ logu (log, warn, error).
 */
export function log(message: string, type: 'log' | 'warn' | 'error' = 'log') {
  figma.ui.postMessage({ type: 'log', data: [message, type] });
  console[type](message);
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
