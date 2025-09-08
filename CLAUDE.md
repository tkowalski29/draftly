# Draftly Plugin - Claude Development Guidelines

## Struktura Projektu

### Główne Foldery
- `/src/main/` - Główna logika pluginu
- `/src/ui/` - Interfejs użytkownika (React)
- `/src/renderers/` - Modułowe renderery dla typów węzłów

### Architektura Rendererów - Atomic Design System

Plugin implementuje **Atomic Design System** z hierarchiczną strukturą komponentów:

```
src/renderers/
├── atoms/                 # Podstawowe elementy (nie można rozbić na mniejsze)
│   ├── icon.ts           # Ikony (prostokąty z kolorami)
│   ├── input.ts          # Pola wprowadzania danych
│   └── badge.ts          # Etykiety i znaczniki
├── molecules/             # Kombinacje atomów
│   ├── card.ts           # Karty z treścią
│   └── form-field.ts     # Kompletne pola formularza
├── organisms/             # Złożone komponenty z molekuł i atomów
│   ├── header.ts         # Nagłówki nawigacyjne
│   └── product-grid.ts   # Siatki produktów
├── button/               # Klasyczne renderery
│   ├── button.ts
│   ├── doc_button.md
│   └── example_button.json
├── frame/
│   ├── frame.ts
│   ├── doc_frame.md
│   └── example_frame.json
├── text/
│   ├── text.ts
│   ├── doc_text.md
│   └── example_text.json
└── rectangle/
    ├── rectangle.ts
    ├── doc_rectangle.md
    └── example_rectangle.json
```

#### Poziomy Atomic Design:

1. **Atoms** - Podstawowe elementy interfejsu:
   - `ICON` - Ikony różnych rozmiarów i kolorów
   - `INPUT` - Pola tekstowe z etykietami  
   - `BADGE` - Małe znaczniki z tekstem

2. **Molecules** - Kombinacje atomów:
   - `CARD` - Karty z obrazem, tytułem, opisem i akcjami
   - `FORM_FIELD` - Kompletne pola formularza z walidacją

3. **Organisms** - Złożone sekcje:
   - `HEADER` - Nagłówki z logo, nawigacją i akcjami
   - `PRODUCT_GRID` - Siatki produktów z kartami

## Konwencje Nazewnictwa

### Pliki TypeScript
- Nazwa typu w lowercase: `button.ts`, `frame.ts`, `text.ts`
- Export funkcji: `renderButton()`, `renderFrame()`, `renderText()`

### Pliki Dokumentacji
- Prefix: `doc_`
- Nazwa: `doc_[typ].md`
- Przykład: `doc_button.md`

### Pliki Przykładów  
- Prefix: `example_`
- Nazwa: `example_[typ].json`
- Przykład: `example_button.json`

## Struktura Renderera

Każdy renderer powinien:

1. **Eksportować funkcję główną**:
   ```typescript
   export function render[Type](nodeData?: any): [FigmaNodeType] {
     return figma.create[Type]();
   }
   ```

2. **Obsługiwać parametr nodeData** (dla złożonych typów jak BUTTON):
   ```typescript
   export async function renderButton(nodeData: any): Promise<FrameNode> {
     // implementacja
   }
   ```

## Dokumentacja (doc_*.md)

Każdy plik dokumentacji powinien zawierać:

1. **Opis** - Co robi renderer
2. **Parametry** - Wymagane i opcjonalne
3. **Właściwości** - Obsługiwane właściwości stylowania
4. **Domyślne ustawienia** - Co jest ustawiane domyślnie
5. **Obsługiwane efekty** - Jakie efekty wizualne są wspierane
6. **Przykład użycia** - Odniesienie do pliku example_

## Pliki Przykładów (example_*.json)

Każdy przykład powinien:

1. **Być kompletny** - Zawierać strukturę z `version` i `pages`
2. **Pokazywać różne przypadki** - Basic, styled, z efektami
3. **Być testowany** - Działać z pluginem
4. **Być udokumentowany** - Każdy przykład z komentarzem w nazwie

## Zasady Rozwoju

### Dodawanie Nowego Typu Węzła

1. **Utwórz folder**: `src/renderers/[typ]/`
2. **Utwórz implementację**: `[typ].ts`
3. **Dodaj dokumentację**: `doc_[typ].md`  
4. **Utwórz przykład**: `example_[typ].json`
5. **Zaktualizuj główny renderer**: Dodaj import i case w switch
6. **Przetestuj**: Użyj pliku example do weryfikacji

### Modyfikacja Istniejącego Renderera

1. **Zaktualizuj implementację** w pliku `.ts`
2. **Zaktualizuj dokumentację** w `doc_*.md`
3. **Dodaj nowe przykłady** w `example_*.json`
4. **Przetestuj zmiany**

## Integracja z Głównym Rendererem

Główny renderer (`src/main/renderer.ts`) importuje wszystkie modułowe renderery:

```typescript
// Klasyczne renderery
import { renderButton } from "../renderers/button/button";
import { renderFrame } from "../renderers/frame/frame";
import { renderText } from "../renderers/text/text";
import { renderRectangle } from "../renderers/rectangle/rectangle";

// Atomic Design imports
import { renderIcon } from "../renderers/atoms/icon";
import { renderInput } from "../renderers/atoms/input";
import { renderBadge } from "../renderers/atoms/badge";
import { renderCard } from "../renderers/molecules/card";
import { renderFormField } from "../renderers/molecules/form-field";
import { renderHeader } from "../renderers/organisms/header";
import { renderProductGrid } from "../renderers/organisms/product-grid";

switch (nodeData.type) {
  // Klasyczne typy
  case 'BUTTON':
    node = await renderButton(nodeData);
    break;
  case 'FRAME':
    node = renderFrame();
    break;
  
  // Atomic Design - Atoms
  case 'ICON':
    node = renderIcon(nodeData);
    break;
  case 'INPUT':
    node = await renderInput(nodeData);
    break;
  case 'BADGE':
    node = await renderBadge(nodeData);
    break;
    
  // Atomic Design - Molecules
  case 'CARD':
    node = await renderCard(nodeData);
    break;
  case 'FORM_FIELD':
    node = await renderFormField(nodeData);
    break;
    
  // Atomic Design - Organisms
  case 'HEADER':
    node = await renderHeader(nodeData);
    break;
  case 'PRODUCT_GRID':
    node = await renderProductGrid(nodeData);
    break;
}
```

## Testowanie

1. **Użyj plików example_*.json** do testowania każdego typu
2. **Wczytaj przez UI pluginu** (plik lub URL)
3. **Sprawdź w Figmie** czy elementy są poprawnie generowane
4. **Przetestuj edge cases** - brak parametrów, nieprawidłowe wartości

## Najlepsze Praktyki

1. **Konsekwencja** - Trzymaj się konwencji nazewnictwa
2. **Dokumentacja** - Zawsze aktualizuj dokumentację przy zmianach
3. **Przykłady** - Dodawaj różnorodne przypadki użycia
4. **Modularność** - Każdy typ ma swój folder i odpowiedzialność
5. **Testowanie** - Każda zmiana powinna być przetestowana

## Przykłady Atomic Design System

### Główne Przykłady w folderze `examples/`
- `design-system.json` - Kompletny design system prezentujący wszystkie komponenty atomowe
- `landing-page.json` - Przykład strony docelowej z hero, features i CTA
- `shopping-cart.json` - Przykład strony koszyka zakupowego z produktami i checkout

### Struktura Przykładów Design System:
1. **design-system.json** - Organizuje komponenty według:
   - **Atoms Section** - ikony, badges, inputy
   - **Molecules Section** - karty, pola formularza
   - **Organisms Section** - nagłówki, siatki produktów

2. **landing-page.json** - Demonstruje:
   - Header z nawigacją i logo
   - Hero section z CTA
   - Features section z kartami
   - Social proof z statystykami
   - Final CTA section

3. **shopping-cart.json** - Zawiera:
   - Store header z nawigacją
   - Cart items z quantity controls
   - Order summary z cenami
   - Recommended products grid

### Narzędzia
- `webpack.config.js` - Konfiguracja budowania
- `manifest.json` - Manifest pluginu Figma
- `package.json` - Zależności Node.js

To są główne wytyczne dla rozwoju pluginu Draftly. Przestrzeganie tej struktury zapewnia:
- Łatwość dodawania nowych typów węzłów
- Przejrzystość kodu
- Dobrą dokumentację  
- Łatwe testowanie i debugging