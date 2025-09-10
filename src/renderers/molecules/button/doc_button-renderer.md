# Button Renderer - Dokumentacja

## Opis
Button Renderer to zaawansowany renderer dziedziczący po `BaseComponentRenderer`, który tworzy komponenty przycisków w Figma. Renderuje złożone buttony z tekstem, ikonami po lewej i prawej stronie, oraz liniami separującymi - wszystko z pełnymi właściwościami komponentów.

## Funkcjonalności

### Główne cechy
- **Dziedziczenie**: Wykorzystuje 90% funkcjonalności z `BaseComponentRenderer`
- **Auto Layout**: Automatyczne układanie poziome z centrowanymi elementami
- **Dynamic Sizing**: Buttony automatycznie dopasowują rozmiar do zawartości (HUG)
- **Component Properties**: Pełne wsparcie dla interaktywnych właściwości komponentów
- **INSTANCE_SWAP**: Automatyczna integracja z ComponentSets ikon
- **Warianty**: Wsparcie dla stanów (default, hover, active, disabled) i rozmiarów

### Struktura buttona
Button składa się z 5 głównych elementów (zawsze tworzone, widoczność kontrolowana właściwościami):
1. **Left Icon Instance** - ikona po lewej stronie
2. **Line Before Left Icon** - linia separująca przed lewą ikoną  
3. **Text** - główny tekst buttona
4. **Line Before Right Icon** - linia separująca przed prawą ikoną
5. **Right Icon Instance** - ikona po prawej stronie

## Parametry konfiguracji

### Wymagane
- `text` - tekst wyświetlany w buttonie (np. `"Button"`)
- `backgroundColor` - kolor tła w formacie hex (np. `"#3B82F6"`)
- `textColor` - kolor tekstu w formacie hex (np. `"#FFFFFF"`)

### Layout i rozmiary
- `paddingX` - padding poziomy (domyślnie `16`)
- `paddingY` - padding pionowy (domyślnie `10`)
- `itemSpacing` - odstęp między elementami (domyślnie `8`)
- `cornerRadius` - promień narożników (domyślnie `8`)

### Tekst
- `fontSize` - rozmiar czcionki (domyślnie `16`)
- `fontFamily` - rodzina czcionki (domyślnie `"Inter"`)
- `fontWeight` - waga czcionki (domyślnie `"Medium"`)

### Ikony
- `iconSize` - rozmiar ikon (domyślnie `20`)
- `lineHeight` - wysokość linii separujących (domyślnie `16`)

### Stan i style
- `opacity` - przezroczystość całego buttona (domyślnie `1`)

## Component Properties

Button Renderer automatycznie tworzy następujące właściwości komponentu:

### TEXT Properties
- `text` - edytowalny tekst buttona

### BOOLEAN Properties  
- `leftIconEnabled` - widoczność lewej ikony
- `leftIconLine` - widoczność linii przed lewą ikoną
- `rightIconEnabled` - widoczność prawej ikony  
- `rightIconLine` - widoczność linii przed prawą ikoną

### INSTANCE_SWAP Properties
- `leftIcon` - wybór ComponentSet dla lewej ikony
- `rightIcon` - wybór ComponentSet dla prawej ikony

## Warianty i stany

### Domyślne warianty
Button obsługuje następujące kombinacje stanów i rozmiarów:

#### Stany
- `default` - normalny stan
- `hover` - stan po najechaniu myszką
- `active` - stan aktywny/wciśnięty
- `disabled` - stan nieaktywny

#### Rozmiary  
- `small` - mały button (fontSize: 14, padding: 12x8, iconSize: 16)
- `medium` - średni button (fontSize: 16, padding: 16x10, iconSize: 20) 
- `large` - duży button (fontSize: 18, padding: 20x12, iconSize: 24)

### Przykład konfiguracji wariantów
```json
{
  "variants": [
    {
      "name": "default-medium",
      "state": "default",
      "size": "medium"
    },
    {
      "name": "hover-medium",
      "state": "hover", 
      "size": "medium",
      "backgroundColor": "#2563EB"
    },
    {
      "name": "disabled-medium",
      "state": "disabled",
      "size": "medium", 
      "backgroundColor": "#E5E7EB",
      "textColor": "#9CA3AF",
      "opacity": 0.6
    }
  ]
}
```

## Integracja z Icon Renderer

Button automatycznie wyszukuje ComponentSets ikon na stronie:
- Szuka wszystkich ComponentSets zawierających `[Icon]` w nazwie
- Tworzy INSTANCE_SWAP properties z listą dostępnych ikon
- Automatycznie binduje właściwości do instancji ikon w buttonach

### Wymagania dla ikon
- ComponentSet musi mieć `[Icon]` w nazwie (np. `[Icon] Arrow System`)
- ComponentSet musi mieć `defaultVariant`
- Ikony muszą być stworzone **przed** buttonami (kolejność w pliku JSON)

## Auto Layout i Sizing

### Właściwości layoutu
```typescript
// Frame buttona
layoutMode: 'HORIZONTAL'
primaryAxisAlignItems: 'CENTER'  
counterAxisAlignItems: 'CENTER'
primaryAxisSizingMode: 'AUTO'    // Szerokość dopasowana do zawartości
counterAxisSizingMode: 'AUTO'    // Wysokość dopasowana do zawartości

// Komponent nadrzędny też ustawiony na AUTO
variant.primaryAxisSizingMode: 'AUTO'
variant.counterAxisSizingMode: 'AUTO'
```

### Layout poszczególnych elementów
- **Left/Right Icon**: `FIXED` sizing, `CENTER` align
- **Text**: `HUG` sizing, `CENTER` align  
- **Lines**: `FIXED` sizing, `CENTER` align

## Rekurencyjne wyszukiwanie elementów

Button Renderer używa zaawansowanego algorytmu wyszukiwania elementów:
- **Problem**: Elementy (Text, ikony) znajdują się w Frame wewnątrz wariantu
- **Rozwiązanie**: `findNodeRecursively()` przeszukuje całą hierarchię
- **Bindowanie**: Właściwości są prawidłowo bindowane do zagnieżdżonych elementów

## Przykłady użycia

### Podstawowy button
```json
{
  "name": "[Button] Primary",
  "type": "GENERIC",
  "componentConfig": {
    "figmaNodeType": "FRAME",
    "properties": {
      "text": "${text}",
      "backgroundColor": "${backgroundColor}",
      "textColor": "${textColor}",
      "fontSize": "${fontSize}",
      "paddingX": "${paddingX}",
      "paddingY": "${paddingY}"
    },
    "behavior": {
      "createVariants": true,
      "componentProperties": {
        "text": {
          "type": "TEXT",
          "defaultValue": "Button"
        },
        "leftIconEnabled": {
          "type": "BOOLEAN", 
          "defaultValue": false
        },
        "leftIcon": {
          "type": "INSTANCE_SWAP",
          "searchPattern": "[Icon]"
        }
      }
    }
  },
  "properties": {
    "text": "Primary Button",
    "backgroundColor": "#3B82F6", 
    "textColor": "#FFFFFF",
    "fontSize": 16
  }
}
```

### Button z ikonami
```json
{
  "variants": [
    {
      "name": "with-icons",
      "getFromParent": true,
      "leftIconEnabled": true,
      "rightIconEnabled": true,
      "leftIconLine": true
    }
  ]
}
```

## Zależności

### Wymagane importy
- `BaseComponentRenderer` - klasa bazowa
- `log, loadFontSafely` - utilities

### Wymagane na stronie
- ComponentSets ikon z wzorcem `[Icon]` w nazwie
- Poprawna kolejność renderowania (ikony przed buttonami)

## Logowanie

Button Renderer loguje kluczowe operacje:
- `🎨 Rendering component: [nazwa]`
- `✅ Created [left/right] icon instance from ComponentSet: [nazwa]`  
- `📋 Setting up button component properties for: [nazwa]`
- `✅ Added [TYPE] property: [nazwa]`
- `🔗 Binding properties in variant: [wariant]`
- `✅ Bound [element] in variant: [wariant]`
- `❌ [Element] not found in variant: [wariant]`

## Rozwiązywanie problemów

### Ikony nie są widoczne
- Sprawdź czy ComponentSets ikon istnieją na stronie
- Sprawdź czy mają `[Icon]` w nazwie
- Sprawdź czy ikony są renderowane przed buttonami

### Właściwości nie działają  
- Sprawdź logi w konsoli Figmy
- Sprawdź czy elementy są prawidłowo nazwane (`Text`, `Left Icon Instance`)
- Sprawdź czy struktura komponentu jest poprawna

### Button ma stały rozmiar
- Problem rozwiązany - button automatycznie się dopasowuje
- Sprawdź czy `primaryAxisSizingMode` i `counterAxisSizingMode` są ustawione na `'AUTO'`

## Powiązane pliki
- `button-renderer.ts` - główna implementacja
- `doc_example_button-renderer.json` - przykłady użycia  
- `base-component-renderer.ts` - klasa bazowa
- `icon-renderer.ts` - renderer ikon do integracji