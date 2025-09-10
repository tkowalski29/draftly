# Icon Renderer - Dokumentacja

## Opis
Icon Renderer to specjalistyczny renderer dziedziczący po `BaseComponentRenderer`, który tworzy komponenty ikon w Figma. Renderuje ikony jako wektory lub prostokąty z możliwością konfiguracji różnych właściwości wizualnych.

## Funkcjonalności

### Główne cechy
- **Dziedziczenie**: Wykorzystuje 90% funkcjonalności z `BaseComponentRenderer`
- **Grupowanie wariantów**: Automatyczne grupowanie według `iconType`
- **Typy kształtów**: Obsługuje `vector`, `rectangle`, `ellipse`
- **Wektory**: Można definiować niestandardowe ścieżki SVG
- **ComponentSet**: Tworzy ComponentSet gotowy do INSTANCE_SWAP

### Obsługiwane parametry

#### Wymagane
- `shapeType` - typ kształtu (`'vector'`, `'rectangle'`, `'ellipse'`)
- `size` - rozmiar ikony w pikselach (np. `16`, `20`, `24`)
- `color` - kolor ikony w formacie hex (np. `"#000000"`)

#### Opcjonalne
- `strokeWidth` - grubość obrysu (domyślnie `2`)
- `opacity` - przezroczystość `0-1` (domyślnie `1`)
- `rotation` - obrót w stopniach (domyślnie `0`)
- `vectorPaths` - tablica ścieżek SVG dla typu `vector`
- `cornerRadius` - promień narożników (domyślnie `0`)
- `strokeCap` - zakończenie linii (`'BUTT'`, `'ROUND'`, `'SQUARE'`)
- `windingRule` - reguła wypełnienia (`'NONZERO'`, `'EVENODD'`)
- `useStroke` - czy używać obrysu zamiast wypełnienia (domyślnie `false`)

## Typy kształtów

### Vector
Tworzy VectorNode z niestandardowymi ścieżkami SVG:
```json
{
  "shapeType": "vector",
  "size": 24,
  "color": "#FF0000",
  "vectorPaths": [
    "M12 2L13.09 8.26L22 9L17 14L18.18 22L12 19L5.82 22L7 14L2 9L10.91 8.26L12 2Z"
  ]
}
```

### Rectangle
Tworzy prostokątną ikonę:
```json
{
  "shapeType": "rectangle", 
  "size": 20,
  "color": "#0066CC",
  "cornerRadius": 4
}
```

### Ellipse
Tworzy okrągłą ikonę:
```json
{
  "shapeType": "ellipse",
  "size": 16,
  "color": "#00AA00"
}
```

## Warianty i grupowanie

### Automatyczne grupowanie
Icon Renderer automatycznie grupuje warianty według właściwości `iconType`:
- `iconType: "arrow"` → grupa "Arrow" 
- `iconType: "user"` → grupa "User"
- `iconType: "star"` → grupa "Star"

### Przykład wariantów
```json
{
  "variants": [
    {
      "name": "small-16",
      "iconType": "arrow",
      "size": 16
    },
    {
      "name": "medium-20", 
      "iconType": "arrow",
      "size": 20
    },
    {
      "name": "large-24",
      "iconType": "arrow", 
      "size": 24
    }
  ]
}
```

## Integracja z ButtonRenderer

Icon Renderer tworzy ComponentSets, które mogą być używane przez ButtonRenderer do właściwości INSTANCE_SWAP:

```json
{
  "componentProperties": {
    "leftIcon": {
      "type": "INSTANCE_SWAP",
      "searchPattern": "[Icon]",
      "defaultValue": "[Icon] Arrow System"
    }
  }
}
```

## Walidacja i błędy

### Wymagane pola
Renderer sprawdza obecność wymaganych pól i loguje błędy:
- Brak `shapeType` → błąd walidacji
- Nieprawidłowy `size` (≤ 0) → błąd walidacji  
- Brak `color` → błąd walidacji

### Fallback dla vector
Jeśli `vectorPaths` są puste dla typu `vector`, renderer tworzy prostokątny placeholder.

## Przykłady użycia

### Podstawowa ikona
```json
{
  "name": "[Icon] User System",
  "type": "GENERIC",
  "properties": {
    "shapeType": "vector",
    "size": 20,
    "color": "#333333"
  }
}
```

### Ikona z wieloma wariantami
```json
{
  "name": "[Icon] Arrow System", 
  "type": "GENERIC",
  "variants": [
    {
      "name": "size-16",
      "iconType": "arrow",
      "size": 16,
      "color": "#000000"
    },
    {
      "name": "size-20",
      "iconType": "arrow", 
      "size": 20,
      "color": "#000000"
    },
    {
      "name": "size-24",
      "iconType": "arrow",
      "size": 24,
      "color": "#000000"
    }
  ]
}
```

## Logowanie

Renderer loguje kluczowe operacje:
- `🎨 Creating icon shape: [typ], size: [rozmiar], color: [kolor]`
- `✅ Icon ComponentSet [nazwa] ready for INSTANCE_SWAP`
- `❌ Icon validation failed: [błędy]`

## Powiązane pliki
- `icon-renderer.ts` - główna implementacja
- `doc_example_icon-renderer.json` - przykłady użycia
- `base-component-renderer.ts` - klasa bazowa