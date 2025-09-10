# Base Component Renderer - Dokumentacja

## Opis
Base Component Renderer to abstrakcyjna klasa bazowa dla wszystkich renderów komponentów w systemie Draftly. Implementuje 90% wspólnej funkcjonalności, pozwalając specjalistycznym rendererom skupić się tylko na swoich unikalnych cechach.

## Filozofia architektury
- **DRY Principle**: Wspólna logika w jednym miejscu
- **Template Method Pattern**: Główny przepływ z punktami rozszerzenia
- **Hook-based Architecture**: Podklasy override'ują tylko potrzebne metody
- **Consistency**: Jednakowe zachowanie wszystkich rendererów

## Główne funkcjonalności

### Workflow renderowania
1. **Walidacja** danych wejściowych
2. **Tworzenie wariantów** na podstawie konfiguracji  
3. **Kombinowanie wariantów** w ComponentSet
4. **Ustawianie właściwości** komponentów
5. **Pozycjonowanie** i finalizacja

### Zarządzanie wariantami
- Automatyczne grupowanie wariantów
- Wsparcie dla różnych strategii grupowania
- Merge danych z getFromParent
- Pozycjonowanie wariantów w układzie

### Component Properties
- Automatyczne tworzenie właściwości TEXT, BOOLEAN, INSTANCE_SWAP
- Bindowanie właściwości do elementów w wariantach
- Wyszukiwanie ComponentSets dla INSTANCE_SWAP

## Interfejsy i typy

### Hook Methods (do override w podklasach)
```typescript
// Główny hook - tworzenie struktury komponentu
protected abstract createComponentStructure(finalData: any): Promise<SceneNode>

// Opcjonalne hooky
protected createVariant(variantName: string, variantData: any, baseProperties: any): Promise<ComponentNode>
protected setupComponentProperties(componentSet: ComponentSetNode, nodeData: any): Promise<void>
protected getVariantGrouping(nodeData: any): { type: string, property?: string }
```

### Utility Methods (dziedziczone)
```typescript
// Zarządzanie danymi
protected mergeWithParent(baseProperties: any, variant: any): any
protected groupVariantsByProperty(variants: any[], property: string): {[key: string]: any[]}
protected extractPropertyFromVariant(variantName: string, property: string): string | null

// Pozycjonowanie
protected positionVariants(variants: ComponentNode[]): void
protected positionVariantsInGrid(variants: ComponentNode[], columns: number, spacing: number): void
```

## Strategie grupowania wariantów

### Single grouping
Wszystkie warianty w jednym ComponentSet:
```typescript
protected getVariantGrouping(nodeData: any): { type: string } {
  return { type: 'single' };
}
```

### By property grouping  
Grupowanie według określonej właściwości:
```typescript
protected getVariantGrouping(nodeData: any): { type: string, property: string } {
  return {
    type: 'byProperty',
    property: 'iconType'  // grupuje według iconType
  };
}
```

## Przepływ renderowania

### 1. Metoda render() - główny entry point
```typescript
async render(nodeData: any, targetPage?: PageNode): Promise<ComponentSetNode | ComponentSetNode[]>
```

**Kroki:**
1. Walidacja nodeData
2. Przygotowanie baseProperties
3. Tworzenie wariantów
4. Grupowanie wariantów
5. Tworzenie ComponentSet(ów)
6. Setup właściwości komponentów

### 2. Tworzenie wariantów
```typescript
protected async createVariant(variantName: string, variantData: any, baseProperties: any): Promise<ComponentNode>
```

**Kroki:**
1. `figma.createComponent()`
2. `mergeWithParent()` - merge danych
3. `createComponentStructure()` - **HOOK dla podklas**
4. `appendChild()` - dodanie struktury do komponentu
5. Ustawienie nazwy wariantu

### 3. Setup Component Properties
```typescript
protected async setupComponentProperties(componentSet: ComponentSetNode, nodeData: any): Promise<void>
```

**Kroki:**
1. Parsowanie componentProperties z nodeData
2. Dodawanie właściwości do ComponentSet
3. Wyszukiwanie ComponentSets dla INSTANCE_SWAP
4. Bindowanie właściwości do elementów w wariantach

## Przykład implementacji podklasy

### Minimalna podklasa
```typescript
export class SimpleRenderer extends BaseComponentRenderer {
  
  // Jedyna wymagana metoda - tworzy strukturę komponentu
  protected async createComponentStructure(finalData: any): Promise<SceneNode> {
    const frame = figma.createFrame();
    frame.name = 'Simple Component';
    
    // Tworzenie struktury...
    
    return frame;
  }
}
```

### Zaawansowana podklasa z hookami
```typescript
export class AdvancedRenderer extends BaseComponentRenderer {
  
  // Hook - struktura komponentu
  protected async createComponentStructure(finalData: any): Promise<SceneNode> {
    // Implementacja specyficzna dla tego komponentu
  }
  
  // Hook - niestandardowe grupowanie
  protected getVariantGrouping(nodeData: any): { type: string, property?: string } {
    return { type: 'byProperty', property: 'customProperty' };
  }
  
  // Hook - niestandardowe właściwości
  protected async setupComponentProperties(componentSet: ComponentSetNode, nodeData: any): Promise<void> {
    await super.setupComponentProperties(componentSet, nodeData);
    
    // Dodatkowe właściwości specyficzne dla tego komponentu
  }
  
  // Hook - niestandardowe tworzenie wariantów
  protected async createVariant(variantName: string, variantData: any, baseProperties: any): Promise<ComponentNode> {
    const variant = await super.createVariant(variantName, variantData, baseProperties);
    
    // Dodatkowe modyfikacje wariantu
    
    return variant;
  }
}
```

## Zarządzanie danymi

### mergeWithParent()
Łączy dane z wariantu z danymi bazowymi:
```typescript
protected mergeWithParent(baseProperties: any, variant: any): any {
  if (!variant.getFromParent) {
    return variant;  // Variant ma własne dane
  }
  return { ...baseProperties, ...variant };  // Merge z bazą
}
```

### extractPropertyFromVariant()
Wyciąga wartość właściwości z nazwy wariantu:
```typescript
// variant.name = "State=hover, Size=large"
extractPropertyFromVariant(variant.name, 'State')  // → "hover"
extractPropertyFromVariant(variant.name, 'Size')   // → "large"  
```

## Component Properties System

### Obsługiwane typy
1. **TEXT** - edytowalny tekst
2. **BOOLEAN** - przełączniki widoczności
3. **INSTANCE_SWAP** - wybór komponentów

### Automatyczne wyszukiwanie ComponentSets
```typescript
// Wyszukuje ComponentSets na stronie według wzorca nazwy
findComponentSetsByPattern(pattern: string): ComponentSetNode[]

// Przykład: szuka wszystkich ComponentSets zawierających "[Icon]"
const iconSets = this.findComponentSetsByPattern('[Icon]');
```

### Bindowanie właściwości
Base renderer automatycznie binduje właściwości do elementów w wariantach:
- Wyszukuje elementy po nazwie (`findChild()`)
- Tworzy `componentPropertyReferences`
- Obsługuje TEXT, BOOLEAN i INSTANCE_SWAP

## Pozycjonowanie wariantów

### Automatyczny grid layout
```typescript
protected positionVariants(variants: ComponentNode[]): void {
  const columns = Math.ceil(Math.sqrt(variants.length));
  const spacing = 100;
  this.positionVariantsInGrid(variants, columns, spacing);
}
```

### Niestandardowe pozycjonowanie
```typescript
protected positionVariantsInGrid(variants: ComponentNode[], columns: number, spacing: number): void {
  variants.forEach((variant, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    variant.x = col * spacing;
    variant.y = row * spacing;
  });
}
```

## Logowanie i debugging

### Kluczowe logi
- `🚀 Starting render for: [componentName]`
- `📦 Created [X] variants for: [componentName]`  
- `🔧 Setting up component properties`
- `✅ [X] ComponentSet(s) created successfully`
- `❌ Error in render: [error]`

### Debug informacje
- Liczba wariantów na grupę
- Właściwości dodane do ComponentSet
- Błędy bindowania właściwości

## Zalety Base Renderer

### Dla programistów
- **Mniej kodu**: 90% funkcjonalności gotowej
- **Konsystencja**: Jednakowe API i zachowania
- **Testowalne**: Wspólna logika przetestowana raz
- **Maintainable**: Zmiany w jednym miejscu

### Dla użytkowników
- **Przewidywalność**: Wszystkie komponenty działają podobnie
- **Funkcjonalność**: Component Properties, warianty, grupowanie
- **Performance**: Zoptymalizowane algorytmy

## Ograniczenia

### Dla prostych przypadków
- Overhead dla bardzo prostych komponentów
- Wymuszona struktura może być zbyt sztywna

### Dla specjalnych przypadków  
- Trudne do handle'owania bardzo niestandardowe wymagania
- Hook pattern może być ograniczający

## Przykłady użycia w praktyce

### ButtonRenderer
```typescript
// Dziedziczy całą logikę wariantów, właściwości, pozycjonowania
// Override'uje tylko createComponentStructure() - tworzy button z ikonami
```

### IconRenderer  
```typescript  
// Dziedziczy zarządzanie wariantami i ComponentSet
// Override'uje getVariantGrouping() - grupuje według iconType
// Override'uje createComponentStructure() - tworzy vector ikony
```

### GenericRenderer
```typescript
// Rozszerza Base Renderer o system konfiguracji JSON
// Override'uje createComponentStructure() - parsuje config JSON
```

## Powiązane pliki
- `base-component-renderer.ts` - główna implementacja
- `button-renderer.ts` - przykład specjalistycznej podklasy
- `icon-renderer.ts` - przykład z custom grouping
- `generic-component-renderer.ts` - przykład rozszerzenia funkcjonalności