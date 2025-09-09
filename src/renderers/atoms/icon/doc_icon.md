# Icon Renderer

## Opis
Renderer do tworzenia komponentów ikon z systemem wariantów i dziedziczenia właściwości. Obsługuje różne typy kształtów (vector, rectangle, ellipse, polygon) z pełną kontrolą nad wyglądem.

## Parametry

### Struktura JSON
```json
{
  "name": "[Icon] System Name",
  "type": "ICON",
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
- `shapeType` (string) - Typ kształtu: "vector", "rectangle", "ellipse", "polygon"
- `size` (number) - Rozmiar ikony w pikselach
- `color` (string) - Kolor w formacie hex (#000000)

#### Opcjonalne:
- `strokeWidth` (number) - Grubość obrysu (domyślnie: 2)
- `opacity` (number) - Przezroczystość 0-1 (domyślnie: 1)
- `rotation` (number) - Rotacja w stopniach (domyślnie: 0)
- `cornerRadius` (number) - Promień zaokrąglenia dla prostokątów (domyślnie: 0)
- `strokeCap` (string) - Typ końcówek linii: "BUTT", "ROUND", "SQUARE" (domyślnie: "BUTT")
- `windingRule` (string) - Reguła wypełnienia: "NONZERO", "EVENODD" (domyślnie: "NONZERO")
- `useStroke` (boolean) - Czy używać obrysu zamiast wypełnienia (domyślnie: false)

#### Dla typu "vector":
- `vectorPaths` (array) - Ścieżki wektorowe:
  ```json
  "vectorPaths": [
    {
      "windingRule": "NONZERO",
      "data": "M 0.2 0.2 L 0.8 0.2 L 0.8 0.8 L 0.2 0.8 Z"
    }
  ]
  ```

## System Dziedziczenia

### getFromParent
- `true` - Wariant dziedziczy wszystkie właściwości z `properties` i nadpisuje tylko te, które są zdefiniowane w wariancie
- `false` - Wariant używa tylko swoich właściwości (brak dziedziczenia)

### Przykład dziedziczenia:
```json
{
  "properties": {
    "shapeType": "vector",
    "color": "#000000",
    "size": 20
  },
  "variants": [
    {
      "name": "small-red",
      "getFromParent": true,
      "color": "#FF0000",
      "size": 16
      // dziedziczy shapeType i vectorPaths z properties
    }
  ]
}
```

## Obsługiwane Kształty

### 1. Vector (vectorPaths wymagane)
- Tworzy kształty na podstawie ścieżek SVG
- Współrzędne znormalizowane (0-1) są automatycznie skalowane do rozmiaru ikony
- Obsługuje złożone kształty z krzywymi i liniami

### 2. Rectangle
- Prostokąt z opcjonalnym zaokrągleniem (`cornerRadius`)
- Obsługuje wypełnienie i obrys

### 3. Ellipse
- Koło/elipsa
- Automatycznie dopasowuje się do rozmiaru

### 4. Polygon
- Wielokąt (domyślnie trójkąt)
- Obsługuje tylko wypełnienie

## Renderowanie

### ComponentSet
- Tworzy ComponentSet z wariantami gdy jest więcej niż jeden wariant
- Używa konwencji nazewnictwa Figma: `Icon=ArrowRight, Size=Small`
- Automatycznie organizuje warianty w siatce

### Single Component
- Dla pojedynczego wariantu tworzy pojedynczy komponent
- Organizuje w kontenerze autolayout

### Preview Container
- Tworzy podgląd wszystkich wariantów w siatce
- Niezależny od ComponentSet (można usunąć bez wpływu na komponenty)

## Walidacja i Błędy

### Walidacja wymaganych właściwości:
- Brak `shapeType` → błąd renderowania
- Brak `size` lub `size <= 0` → błąd renderowania
- Brak `color` → błąd renderowania
- Typ "vector" bez `vectorPaths` → błąd renderowania

### Obsługa błędów:
- Nieudane warianty renderują się jako czerwone prostokąty z nazwą "ERROR: [IconType]"
- Wszystkie błędy są logowane z szczegółowymi informacjami
- Plugin kontynuuje renderowanie pozostałych wariantów

## Atomic Design Level
**Atom** - Podstawowy element wizualny w systemie atomic design.

## Przykład Użycia
Zobacz `example_icon.json` dla pełnych przykładów użycia różnych typów kształtów i systemów dziedziczenia.