# Draftly Renderers - Dokumentacja

## Przegląd systemu

Draftly implementuje system renderów komponentów oparty na **Atomic Design** i dziedziczeniu. Każdy renderer dziedziczy po `BaseComponentRenderer` i implementuje tylko swoją specjalistyczną funkcjonalność.

## Architektura

```
BaseComponentRenderer (abstrakcyjna klasa bazowa)
├── ButtonRenderer (molecules/button)
├── IconRenderer (atoms/icon)
└── GenericComponentRenderer (uniwersalny)
```

## Dostępne renderery

### 🏗️ Base Component Renderer
**Plik**: `base-component-renderer.ts` | [📋 Dokumentacja](doc_base-component-renderer.md)

Abstrakcyjna klasa bazowa implementująca 90% wspólnej funkcjonalności:
- Zarządzanie wariantami i ComponentSets
- Component Properties (TEXT, BOOLEAN, INSTANCE_SWAP)  
- Pozycjonowanie i layouting
- Hook-based architecture dla podklas

### 🔧 Generic Component Renderer  
**Plik**: `generic-component-renderer.ts` | [📋 Dokumentacja](doc_generic-component-renderer.md) | [📄 Przykłady](doc_example_generic-component-renderer.json)

Uniwersalny renderer oparty na konfiguracji JSON:
- Dowolne komponenty bez hardcodingu
- Hierarchiczne struktury (children)
- Interpolacja zmiennych `${variable}`
- Obsługa wszystkich typów węzłów Figma

**Przykład użycia:**
```json
{
  "componentConfig": {
    "figmaNodeType": "FRAME",
    "properties": {
      "autoLayout": {"direction": "HORIZONTAL"},
      "cornerRadius": "${cornerRadius}"
    },
    "children": [
      {"figmaNodeType": "TEXT", "properties": {"text": "${text}"}}
    ]
  }
}
```

### 🎨 Icon Renderer (Atoms)
**Plik**: `atoms/icon/icon-renderer.ts` | [📋 Dokumentacja](atoms/icon/doc_icon-renderer.md) | [📄 Przykłady](atoms/icon/doc_example_icon-renderer.json)

Specjalistyczny renderer dla ikon:
- Typy kształtów: `vector`, `rectangle`, `ellipse`
- Niestandardowe ścieżki SVG
- Grupowanie według `iconType`
- ComponentSets gotowe do INSTANCE_SWAP

**Przykład użycia:**
```json
{
  "type": "GENERIC",
  "properties": {
    "shapeType": "vector",
    "size": 20,
    "color": "#000000",
    "vectorPaths": ["M9 18L15 12L9 6"]
  }
}
```

### 🔲 Button Renderer (Molecules)
**Plik**: `molecules/button/button-renderer.ts` | [📋 Dokumentacja](molecules/button/doc_button-renderer.md) | [📄 Przykłady](molecules/button/doc_example_button-renderer.json)

Zaawansowany renderer przycisków:
- Złożona struktura: tekst + ikony + linie separujące
- Dynamic sizing (HUG) 
- Component Properties z INSTANCE_SWAP
- Integracja z Icon Renderer
- Warianty stanów (default, hover, active, disabled)

**Przykład użycia:**
```json
{
  "type": "GENERIC",
  "componentConfig": {
    "behavior": {
      "componentProperties": {
        "text": {"type": "TEXT"},
        "leftIconEnabled": {"type": "BOOLEAN"},
        "leftIcon": {"type": "INSTANCE_SWAP", "searchPattern": "[Icon]"}
      }
    }
  }
}
```

## Atomic Design Hierarchy

### Atoms (src/renderers/atoms/)
Podstawowe, niepodzielne elementy:
- **Icon** - ikony różnych typów i rozmiarów

### Molecules (src/renderers/molecules/) 
Kombinacje atomów:
- **Button** - przyciski z tekstem i ikonami

### Organisms (src/renderers/organisms/)
*Planowane* - złożone sekcje z molekuł i atomów

## Konwencje plików

### Dokumentacja
- `doc_[name].md` - dokumentacja renderera
- `doc_example_[name].json` - przykłady użycia

### Implementacja  
- `[name]-renderer.ts` - główna implementacja
- Folder per komponent: `atoms/icon/`, `molecules/button/`

## Jak dodać nowy renderer

### 1. Utwórz strukturę folderów
```
src/renderers/[level]/[component]/
├── [component]-renderer.ts
├── doc_[component]-renderer.md  
└── doc_example_[component]-renderer.json
```

### 2. Rozszerz BaseComponentRenderer
```typescript
export class NewRenderer extends BaseComponentRenderer {
  protected async createComponentStructure(finalData: any): Promise<SceneNode> {
    // Implementacja specyficzna dla komponentu
    return figma.createFrame();
  }
}
```

### 3. Zarejestruj w głównym systemie
Dodaj import i mapping w `design-system-renderer.ts`

## Integracja rendererów

### Dependencies w JSON
```json
{
  "dependencies": ["icon-config.json"],
  "pages": [...]
}
```

### Kolejność renderowania
1. **Atoms** (ikony) - tworzą ComponentSets
2. **Molecules** (buttony) - używają ikon do INSTANCE_SWAP  
3. **Organisms** - używają molekuł i atomów

### INSTANCE_SWAP Integration
```typescript
// Button automatycznie znajduje ComponentSets ikon
const iconSets = this.findAllComponentSetsRecursively(figma.currentPage, '[Icon]');
```

## Najlepsze praktyki

### Dla twórców rendererów
1. **Dziedzicz po BaseComponentRenderer** - 90% funkcjonalności za darmo
2. **Override tylko potrzebne hooky** - `createComponentStructure()` zazwyczaj wystarcza  
3. **Używaj consistent naming** - `[Type] Name System` dla ComponentSets
4. **Loguj operacje** - dla debugging i user feedback

### Dla użytkowników JSON
1. **Definiuj dependencies** - ikony przed buttonami
2. **Używaj getFromParent** - dla dziedziczenia właściwości
3. **Consistent naming patterns** - `[Icon]`, `[Button]` dla wyszukiwania
4. **Grupuj warianty logicznie** - state+size, iconType, etc.

## Rozwiązywanie problemów

### Component Properties nie działają
- Sprawdź czy elementy mają poprawne nazwy (`Text`, `Left Icon Instance`)
- Sprawdź logi w konsoli Figma
- Sprawdź czy struktura komponentu jest poprawna

### INSTANCE_SWAP nie znajduje ikon  
- Sprawdź czy ComponentSets mają `[Icon]` w nazwie
- Sprawdź kolejność renderowania (ikony przed buttonami)
- Sprawdź dependencies w JSON

### Warianty nie grupują się
- Sprawdź `getVariantGrouping()` w rendererze
- Sprawdź czy właściwość grupująca istnieje w danych
- Sprawdź logi grupowania wariantów

## Roadmap

### Planowane atoms
- **Input** - pola tekstowe z walidacją  
- **Badge** - kolorowe znaczniki statusu
- **Avatar** - zdjęcia/inicjały użytkowników

### Planowane molecules
- **Card** - karty z obrazem i tekstem
- **Form Field** - kompletne pola formularza
- **Navigation Item** - elementy menu

### Planowane organisms
- **Header** - nagłówki z logo i nawigacją
- **Product Grid** - siatki produktów 
- **Footer** - stopki z linkami

---

📚 **Więcej informacji**: Sprawdź dokumentację poszczególnych rendererów dla szczegółowych przykładów i API.