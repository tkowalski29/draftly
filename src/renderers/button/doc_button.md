# Button Renderer Documentation

## Opis
Renderer do tworzenia przycisków w Figmie. Tworzy przycisk jako Frame z Auto Layout i tekstem wewnątrz.

## Parametry

### Wymagane
- `type`: "BUTTON"
- `name`: Nazwa przycisku

### Opcjonalne
- `text`: Tekst wyświetlany na przycisku
- `properties`: Obiekt z właściwościami stylowania

### Właściwości (properties)
- `content`: Alternatywny sposób podania tekstu
- `fontSize`: Rozmiar czcionki (domyślnie 16)
- `font`: Obiekt czcionki (domyślnie Inter Medium)
- `fills`: Tablica wypełnień tła
- `cornerRadius`: Zaokrąglenie rogów
- `autoLayout`: Ustawienia Auto Layout
- `stroke`: Obramowanie
- `strokeWeight`: Grubość obramowania
- `effects`: Efekty wizualne (cienie)

## Domyślne ustawienia
- Layout: HORIZONTAL
- Padding: 16px (left/right), 12px (top/bottom)
- Spacing: 8px
- Corner radius: 8px
- Background: Niebieski (#3366FF)
- Text color: Biały
- Font: Inter Medium, 16px

## Obsługiwane efekty
- DROP_SHADOW: Cień pod przyciskiem
- Obramowanie (stroke)
- Zaokrąglone rogi

## Przykład użycia
Zobacz `example_button.json` w tym samym folderze.