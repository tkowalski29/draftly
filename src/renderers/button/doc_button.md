# Button Renderer

## Opis
Renderer do tworzenia komponentów przycisków z systemem wariantów i dziedziczenia właściwości. Obsługuje różne stany (hover, focus, disabled), rozmiary i warianty kolorystyczne z pełną kontrolą nad stylowaniem.

## Parametry

### Struktura JSON
```json
{
  "name": "[Button] System Name",
  "type": "BUTTON",
  "properties": {
    // Podstawowe właściwości dziedziczone przez warianty
  },
  "variants": [
    {
      "name": "variant-name",
      "getFromParent": true/false,
      // Właściwości wariantu
    }
  ]
}
```

### Podstawowe Właściwości (properties/variants)

#### Wymagane:
- `text` lub `content` (string) - Tekst wyświetlany na przycisku
- `backgroundColor` (string|object) - Kolor tła w formacie hex (#FFFFFF) lub RGB {r, g, b}
- `textColor` (string|object) - Kolor tekstu w formacie hex lub RGB
- `fontSize` (number) - Rozmiar czcionki w pikselach
- `paddingX` (number) - Padding poziomy w pikselach
- `paddingY` (number) - Padding pionowy w pikselach

#### Opcjonalne:
- `state` (string) - Stan przycisku: "default", "hover", "active", "focus", "disabled", "loading"
- `size` (string) - Rozmiar: "xs", "sm", "md", "lg", "xl" lub "small", "medium", "large"
- `variant` (string) - Wariant: "primary", "secondary", "success", "danger", "warning", "ghost"
- `opacity` (number) - Przezroczystość 0-1 (domyślnie: 1)
- `cornerRadius` (number) - Promień zaokrąglenia (domyślnie: 8)
- `itemSpacing` (number) - Odstęp między elementami (domyślnie: 8)
- `fontFamily` (string) - Rodzina czcionki (domyślnie: "Inter")
- `fontWeight` (string) - Waga czcionki (domyślnie: "Medium")
- `iconSize` (number) - Rozmiar ikon (domyślnie: 20)
- `iconColor` (string|object) - Kolor ikon
- `showLeftIcon` (boolean) - Czy pokazać lewą ikonę (domyślnie: true)
- `showRightIcon` (boolean) - Czy pokazać prawą ikonę (domyślnie: true)

#### Efekty wizualne:
- `shadowOpacity` (number) - Przezroczystość cienia 0-1
- `shadowX` (number) - Przesunięcie cienia X (domyślnie: 0)
- `shadowY` (number) - Przesunięcie cienia Y (domyślnie: 2)
- `shadowRadius` (number) - Promień rozmycia cienia (domyślnie: 4)
- `hasFocusRing` (boolean) - Czy pokazać pierścień fokusa
- `focusColor` (object) - Kolor pierścienia fokusa {r, g, b, a}
- `focusRadius` (number) - Promień pierścienia fokusa (domyślnie: 4)

## System Dziedziczenia

### getFromParent
- `true` - Wariant dziedziczy wszystkie właściwości z `properties` i nadpisuje tylko te, które są zdefiniowane w wariancie
- `false` - Wariant używa tylko swoich właściwości (brak dziedziczenia)

### Przykład dziedziczenia:
```json
{
  "properties": {
    "text": "Button",
    "backgroundColor": "#3B82F6",
    "textColor": "#FFFFFF",
    "fontSize": 16,
    "paddingX": 16,
    "paddingY": 10
  },
  "variants": [
    {
      "name": "primary-large",
      "getFromParent": true,
      "fontSize": 18,
      "paddingX": 20,
      "paddingY": 12
      // dziedziczy text, backgroundColor, textColor z properties
    }
  ]
}
```

## Obsługiwane Stany

### 1. Default
- Podstawowy stan przycisku
- Bez dodatkowych efektów

### 2. Hover
- Stan najechania myszką
- Zazwyczaj z cieniem (`shadowOpacity`)

### 3. Active  
- Stan wciśnięcia przycisku
- Często ciemniejszy kolor tła

### 4. Focus
- Stan fokusa klawiatury
- Z pierścieniem fokusa (`hasFocusRing`)

### 5. Disabled
- Stan wyłączony
- Obniżona przezroczystość (`opacity`)
- Szary kolor tekstu

### 6. Loading
- Stan ładowania
- Podobny do default ale może mieć inne stylowanie

## Renderowanie

### ComponentSet
- Tworzy ComponentSet z wariantami gdy jest więcej niż jeden wariant
- Używa konwencji nazewnictwa Figma: `State=Default, Size=Medium, Variant=Primary`
- Automatycznie organizuje warianty w siatce

### Single Component
- Dla pojedynczego wariantu tworzy pojedynczy komponent
- Organizuje w kontenerze autolayout

### Preview Container
- Tworzy podgląd wszystkich wariantów w siatce
- Niezależny od ComponentSet (można usunąć bez wpływu na komponenty)

## Walidacja i Błędy

### Walidacja wymaganych właściwości:
- Brak `text` lub `content` → błąd renderowania
- Brak `backgroundColor` → błąd renderowania
- Brak `textColor` → błąd renderowania
- Brak `fontSize` → błąd renderowania
- Brak `paddingX` lub `paddingY` → błąd renderowania

### Obsługa błędów:
- Nieudane warianty renderują się jako czerwone prostokąty z komunikatem błędu
- Wszystkie błędy są logowane z szczegółowymi informacjami
- Plugin kontynuuje renderowanie pozostałych wariantów

## Kompatybilność Wsteczna

Renderer nadal obsługuje starą strukturę `config` z `states`, `sizes`, `colors` dla zachowania kompatybilności z istniejącymi plikami JSON.

## Przykład Użycia
Zobacz `example_button.json` dla pełnych przykładów użycia różnych wariantów i systemów dziedziczenia.