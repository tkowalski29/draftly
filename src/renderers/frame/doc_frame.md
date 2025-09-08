# Frame Renderer Documentation

## Opis
Renderer do tworzenia ramek (Frame) w Figmie. Frame to podstawowy kontener, który może zawierać inne elementy i obsługuje Auto Layout.

## Parametry

### Wymagane
- `type`: "FRAME"
- `name`: Nazwa ramki

### Opcjonalne
- `properties`: Obiekt z właściwościami stylowania
- `children`: Tablica dzieci do umieszczenia w ramce

### Właściwości (properties)
- `x`, `y`: Pozycja ramki
- `width`, `height`: Rozmiar ramki (lub "HUG" dla Auto Layout)
- `fills`: Tablica wypełnień tła
- `cornerRadius`: Zaokrąglenie rogów
- `autoLayout`: Ustawienia Auto Layout
  - `direction`: "HORIZONTAL" lub "VERTICAL"
  - `spacing`: Odstęp między elementami
  - `alignment`: Wyrównanie elementów
  - `padding`: Padding wewnętrzny (top, bottom, left, right)
- `stroke`: Obramowanie
- `strokeWeight`: Grubość obramowania
- `effects`: Efekty wizualne (cienie)

## Auto Layout
Frame obsługuje Auto Layout, który pozwala na automatyczne układanie dzieci:
- `direction`: Kierunek układania (HORIZONTAL/VERTICAL)
- `spacing`: Odstęp między elementami
- `alignment`: Wyrównanie na osi głównej
- `padding`: Wewnętrzny padding

## Obsługiwane efekty
- DROP_SHADOW: Cień pod ramką
- Obramowanie (stroke)
- Zaokrąglone rogi
- Wypełnienia (fills)

## Przykład użycia
Zobacz `example_frame.json` w tym samym folderze.