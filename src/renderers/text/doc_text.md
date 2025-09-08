# Text Renderer Documentation

## Opis
Renderer do tworzenia elementów tekstowych w Figmie. Obsługuje różne czcionki, rozmiary i stylowanie tekstu.

## Parametry

### Wymagane
- `type`: "TEXT"
- `name`: Nazwa elementu tekstowego

### Opcjonalne
- `properties`: Obiekt z właściwościami stylowania

### Właściwości (properties)
- `content`: Treść tekstowa do wyświetlenia
- `fontSize`: Rozmiar czcionki (domyślnie używany system)
- `font`: Obiekt czcionki
  - `family`: Nazwa rodziny czcionki (np. "Inter")
  - `style`: Styl czcionki (np. "Regular", "Bold", "Medium")
- `fills`: Tablica wypełnień (kolory tekstu)
- `x`, `y`: Pozycja tekstu

## Domyślne ustawienia
- Font: System default lub Inter Regular
- Kolor: Czarny
- Rozmiar: System default

## Obsługiwane właściwości
- Różne rodziny czcionek (wymaga załadowania przez Figma API)
- Style czcionek (Regular, Bold, Medium, Light, etc.)
- Kolory tekstu przez fills
- Pozycjonowanie

## Ważne uwagi
- Właściwość `content` jest wymagana do wyświetlenia tekstu
- Tekst może być używany jako dziecko Frame z Auto Layout

## Przykład użycia
Zobacz `example_text.json` w tym samym folderze.