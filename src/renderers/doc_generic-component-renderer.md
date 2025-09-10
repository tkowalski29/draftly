# Generic Component Renderer - Dokumentacja

## Opis
Generic Component Renderer to uniwersalny system renderowania komponentów w Figma oparty na konfiguracji JSON. Pozwala tworzyć dowolne komponenty bez konieczności pisania dedykowanych rendererów dla każdego typu.

## Filozofia
- **Konfigurowalność**: Wszystko definiowane przez JSON, żadnego hardcodingu
- **Uniwersalność**: Jeden renderer do wszystkich typów komponentów
- **Hierarchiczność**: Wsparcie dla zagnieżdżonych struktur (children)
- **Elastyczność**: ComponentSets, warianty, właściwości komponentów - wszystko konfigurowalne

## Interfejs ComponentConfig

### Struktura konfiguracji
```typescript
interface ComponentConfig {
  figmaNodeType: 'FRAME' | 'RECTANGLE' | 'ELLIPSE' | 'TEXT' | 'VECTOR';
  properties?: any;                    // Właściwości uniwersalne
  children?: ComponentConfig[];        // Elementy potomne
  behavior?: {                        // Zachowania specjalne
    createVariants?: boolean;         // Czy tworzyć ComponentSet
    variantGrouping?: 'single' | 'byType' | 'byProperty';
    variantGroupProperty?: string;    // Właściwość do grupowania
    componentProperties?: any;        // Właściwości komponentu
  };
}
```

## Obsługiwane typy węzłów

### FRAME
Główny kontener z auto-layout:
```json
{
  "figmaNodeType": "FRAME",
  "properties": {
    "autoLayout": {
      "direction": "HORIZONTAL",
      "padding": { "left": 16, "right": 16, "top": 10, "bottom": 10 },
      "spacing": 8
    },
    "cornerRadius": 8,
    "fills": [{ "color": "#3B82F6" }]
  }
}
```

### RECTANGLE
Prostokątny kształt:
```json
{
  "figmaNodeType": "RECTANGLE",
  "properties": {
    "width": 100,
    "height": 40,
    "cornerRadius": 4,
    "fills": [{ "color": "#E5E7EB" }]
  }
}
```

### ELLIPSE  
Okrągły kształt:
```json
{
  "figmaNodeType": "ELLIPSE",
  "properties": {
    "width": 24,
    "height": 24,
    "fills": [{ "color": "#10B981" }]
  }
}
```

### TEXT
Element tekstowy z fontami:
```json
{
  "figmaNodeType": "TEXT",
  "properties": {
    "text": "Hello World",
    "fontSize": 16,
    "fontFamily": "Inter",
    "fontWeight": "Medium",
    "textColor": "#1F2937"
  }
}
```

### VECTOR
Niestandardowe ścieżki SVG:
```json
{
  "figmaNodeType": "VECTOR",
  "properties": {
    "vectorPaths": ["M12 2L13.09 8.26L22 9L17 14L18.18 22L12 19L5.82 22L7 14L2 9L10.91 8.26L12 2Z"],
    "size": 24,
    "color": "#FFD700",
    "useStroke": false
  }
}
```

## Hierarchia - Children

### Definicja potomków
```json
{
  "figmaNodeType": "FRAME",
  "properties": {
    "autoLayout": { "direction": "HORIZONTAL" }
  },
  "children": [
    {
      "figmaNodeType": "TEXT", 
      "properties": {
        "text": "${text}",
        "fontSize": "${fontSize}"
      }
    },
    {
      "figmaNodeType": "RECTANGLE",
      "properties": {
        "width": "${iconSize}",
        "height": "${iconSize}"
      }
    }
  ]
}
```

### Rekurencyjne tworzenie
- Każde dziecko tworzone rekurencyjnie według swojej konfiguracji
- Interpolacja zmiennych `${variable}` z danych nadrzędnych
- Automatyczne `appendChild()` w kolejności definicji

## Warianty i grupowanie

### Typy grupowania
1. **single** - wszystkie warianty w jednym ComponentSet
2. **byType** - grupowanie według określonej właściwości
3. **byProperty** - grupowanie według niestandardowej właściwości

### Przykład grupowania byType
```json
{
  "behavior": {
    "createVariants": true,
    "variantGrouping": "byType",
    "variantGroupProperty": "iconType"
  },
  "variants": [
    { "name": "arrow-16", "iconType": "arrow", "size": 16 },
    { "name": "arrow-20", "iconType": "arrow", "size": 20 },
    { "name": "user-16", "iconType": "user", "size": 16 },
    { "name": "user-20", "iconType": "user", "size": 20 }
  ]
}
```
Rezultat: 2 ComponentSets - "Arrow" i "User"

## Component Properties

### Obsługiwane typy
- **TEXT** - edytowalny tekst
- **BOOLEAN** - przełączniki widoczności  
- **INSTANCE_SWAP** - wymiana komponentów

### Konfiguracja właściwości
```json
{
  "behavior": {
    "componentProperties": {
      "text": {
        "type": "TEXT",
        "defaultValue": "Button"
      },
      "showIcon": {
        "type": "BOOLEAN", 
        "defaultValue": false
      },
      "iconComponent": {
        "type": "INSTANCE_SWAP",
        "searchPattern": "[Icon]",
        "defaultValue": "[Icon] Arrow System"
      }
    }
  }
}
```

## Interpolacja zmiennych

### System szablonów
```json
{
  "properties": {
    "text": "${buttonText}",
    "fontSize": "${textSize}",
    "fills": [{ "color": "${backgroundColor}" }]
  }
}
```

### Źródła danych
1. **Właściwości nadrzędne** - z głównego obiektu `properties`
2. **Dane wariantu** - z konkretnego wariantu
3. **Merge z getFromParent** - dziedziczenie od rodzica

## Specjalne obsługi

### Vector paths scaling
```javascript
// Automatyczne skalowanie ścieżek SVG do rozmiaru ikony
if (data.vectorPaths && data.size) {
  const scaledPaths = data.vectorPaths.map(path => ({
    windingRule: path.windingRule || 'NONZERO',
    data: scaledData  // Przeskalowane współrzędne
  }));
}
```

### Font loading
```javascript
// Bezpieczne ładowanie fontów z fallbackiem
if (config.figmaNodeType === 'TEXT') {
  const font = await loadFontSafely(
    data.fontFamily || 'Inter',
    data.fontWeight || 'Regular'
  );
  textNode.fontName = font;
}
```

## Przykłady użycia

### Prosty button
```json
{
  "name": "Simple Button",
  "type": "GENERIC",
  "componentConfig": {
    "figmaNodeType": "FRAME",
    "properties": {
      "autoLayout": {
        "direction": "HORIZONTAL",
        "padding": { "left": 16, "right": 16, "top": 8, "bottom": 8 },
        "spacing": 8
      },
      "cornerRadius": 6,
      "fills": [{ "color": "${backgroundColor}" }]
    },
    "children": [
      {
        "figmaNodeType": "TEXT",
        "properties": {
          "text": "${text}",
          "fontSize": 14,
          "textColor": "${textColor}"
        }
      }
    ]
  },
  "properties": {
    "text": "Click me",
    "backgroundColor": "#3B82F6", 
    "textColor": "#FFFFFF"
  }
}
```

### Card z ikoną
```json
{
  "componentConfig": {
    "figmaNodeType": "FRAME",
    "properties": {
      "autoLayout": { "direction": "VERTICAL", "spacing": 12 },
      "padding": { "left": 16, "right": 16, "top": 16, "bottom": 16 },
      "cornerRadius": 8,
      "fills": [{ "color": "#FFFFFF" }]
    },
    "children": [
      {
        "figmaNodeType": "RECTANGLE",
        "properties": {
          "width": "${iconSize}",
          "height": "${iconSize}",
          "fills": [{ "color": "${iconColor}" }],
          "cornerRadius": 4
        }
      },
      {
        "figmaNodeType": "TEXT",
        "properties": {
          "text": "${title}",
          "fontSize": "${titleSize}",
          "fontWeight": "Bold"
        }
      },
      {
        "figmaNodeType": "TEXT", 
        "properties": {
          "text": "${description}",
          "fontSize": "${descSize}",
          "textColor": "#6B7280"
        }
      }
    ]
  }
}
```

### Icon z wariantami
```json
{
  "componentConfig": {
    "figmaNodeType": "VECTOR",
    "properties": {
      "vectorPaths": ["${iconPath}"],
      "size": "${size}",
      "color": "${color}"
    },
    "behavior": {
      "createVariants": true,
      "variantGrouping": "byType",
      "variantGroupProperty": "iconType"
    }
  },
  "variants": [
    {
      "name": "arrow-16",
      "iconType": "arrow", 
      "size": 16,
      "iconPath": "M9 18L15 12L9 6"
    },
    {
      "name": "arrow-20",
      "iconType": "arrow",
      "size": 20, 
      "iconPath": "M9 18L15 12L9 6"
    }
  ]
}
```

## Integracja z innymi rendererami

### Wykorzystanie w ButtonRenderer
```javascript
// ButtonRenderer używa Generic Renderer dla podstawowej struktury
const genericRenderer = new GenericComponentRenderer();
const buttonStructure = await genericRenderer.createComponent(
  nodeData.componentConfig,
  finalData
);
```

### Wykorzystanie w IconRenderer  
```javascript
// IconRenderer rozszerza Generic Renderer o specjalistyczne funkcje ikon
class IconRenderer extends GenericComponentRenderer {
  // Dodatkowa logika dla ikon...
}
```

## Logowanie i debugging

### Kluczowe logi
- `🎨 Creating ${config.figmaNodeType} node`
- `✅ Created component with ${children.length} children`
- `🔧 Setting up component properties: ${propertyNames}`
- `🔗 Created ComponentSet with ${variants.length} variants`
- `❌ Vector path parsing failed: ${error}`
- `⚠️ Font loading fallback: ${fontFamily} → Inter`

## Zalety Generic Renderer

### Elastyczność
- Jeden renderer obsługuje wszystkie typy komponentów
- Nowe typy dodawane przez JSON bez zmian kodu
- Pełna kontrola nad strukturą i właściwościami

### Maintainability  
- Mniej kodu do utrzymania
- Centralne miejsce dla logiki renderowania
- Łatwiejsze dodawanie nowych funkcjonalności

### Konsystencja
- Jednakowe podejście do wszystkich komponentów
- Standardowe zachowania i logowanie
- Przewidywalne API

## Ograniczenia

### Złożoność konfiguracji
- Duże JSON-y dla złożonych komponentów
- Wymaga dobrego zrozumienia struktury Figma
- Debugging przez logi zamiast breakpointów

### Performance
- Więcej obliczeń runtime niż hardcoded renderery
- Interpolacja zmiennych dla każdej właściwości
- Rekurencyjne parsowanie hierarchii

## Powiązane pliki
- `generic-component-renderer.ts` - główna implementacja
- `doc_example_generic-component-renderer.json` - przykłady użycia  
- `base-component-renderer.ts` - klasa bazowa (dla porównania)
- `properties.ts` - system aplikacji właściwości