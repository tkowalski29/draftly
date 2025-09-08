# Rectangle Renderer Documentation

## Opis
Renderer do tworzenia prostokątów w Figmie. Prostokąt to podstawowy kształt geometryczny z możliwością zaokrąglenia rogów, wypełnienia i obramowania.

## Parametry

### Wymagane
- `type`: "RECTANGLE"
- `name`: Nazwa prostokąta

### Opcjonalne
- `properties`: Obiekt z właściwościami stylowania

### Właściwości (properties)
- `x`, `y`: Pozycja prostokąta
- `width`, `height`: Rozmiar prostokąta
- `fills`: Tablica wypełnień tła
- `cornerRadius`: Zaokrąglenie rogów (jednakowe dla wszystkich rogów)
- `stroke`: Obramowanie
- `strokeWeight`: Grubość obramowania
- `effects`: Efekty wizualne (cienie)

## Domyślne ustawienia
- Brak wypełnienia (przezroczysty)
- Brak obramowania
- Brak zaokrąglenia rogów
- Rozmiar: 100x100 (Figma default)

## Obsługiwane właściwości
- **Wypełnienia (fills)**: Kolory tła z opcją przezroczystości
- **Obramowanie (stroke)**: Kolor i grubość obramowania
- **Zaokrąglone rogi**: Jednolite zaokrąglenie wszystkich rogów
- **Efekty**: Cienie, blur i inne efekty wizualne
- **Pozycja i rozmiar**: Pełna kontrola nad wymiarami

## Różnice od Frame
- Rectangle nie obsługuje Auto Layout
- Rectangle nie może zawierać dzieci
- Rectangle ma prostsze właściwości zaokrąglenia (jednolite dla wszystkich rogów)
- Rectangle jest bardziej wydajny dla prostych kształtów

## Przypadki użycia
- Tła i podkłady
- Proste kształty dekoracyjne
- Separatory i linie
- Ikony i znaczniki
- Elementy UI bez potrzeby zawierania dzieci

## Przykład użycia
Zobacz `example_rectangle.json` w tym samym folderze.