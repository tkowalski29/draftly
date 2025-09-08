import { log } from "./utils";

// Ten plik będzie zawierał logikę do parsowania i walidacji JSONa

export function parseAndValidate(jsonString: string): any | null {
  try {
    const parsed = JSON.parse(jsonString);

    if (parsed.version !== '1.0') {
      log('Błąd walidacji: Nieobsługiwana wersja specyfikacji.', 'error');
      return null;
    }

    if (!parsed.pages || !Array.isArray(parsed.pages)) {
      log('Błąd walidacji: Brak lub nieprawidłowy format pola "pages".', 'error');
      return null;
    }

    // Tutaj można dodać bardziej szczegółową walidację każdego węzła

    log("JSON sparsowany i zwalidowany pomyślnie.");
    return parsed;
  } catch (e: any) {
    log(`Błąd parsowania JSON: ${e.message}`, 'error');
    return null;
  }
}
