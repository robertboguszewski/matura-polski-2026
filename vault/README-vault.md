---
name: README
description: Jak używać vault Obsidian do przygotowania do matury 2026
type: readme
tags: [start, readme, matura-2026]
---

# 📖 Jak używać tego vault

## Czym to jest?

Kompletny vault Obsidian do przygotowania do **matury 2026 z języka polskiego (poziom podstawowy)**. Zawiera bazę wiedzy, analizę pytań z ostatnich 5 lat, instrukcje dla 4 agentów przygotowujących i harmonogram nauki.

## Pierwsze kroki (5 min)

1. **Zainstaluj Obsidian** → https://obsidian.md
2. **Otwórz folder jako vault:** File → Open vault → wybierz folder `Matura Polski`
3. **Zacznij od:** [[MOC]] — mapa całego vault
4. **Włącz Graph view** (`Ctrl+G`) — zobaczysz mapę powiązań między notatkami
5. **Przeczytaj w tej kolejności:**
   - [[00-Baza-Wiedzy/Struktura-matury-2026|Struktura matury 2026]] — co, jak, ile punktów
   - [[01-Analiza-Pytan/Statystyka-lektur-w-pytaniach|📈 Analiza Pareto (lektury 80/20)]] — **najważniejsze**: 11 lektur P1 = ~90% pokrycia, 25 lektur (P1+P2) = ~98%
   - [[01-Analiza-Pytan/Przewidywania-2026|🔮 Przewidywania 2026]] — 10 motywów i 15 krytycznych lektur
   - [[03-Plan-Nauki/Harmonogram-do-matury|🗓 Harmonogram 13 dni do pisemnej]]

## Struktura folderów

```
Matura Polski/
├── MOC.md                        ← główny indeks (Start tu)
├── README.md                     ← ten plik
├── 00-Baza-Wiedzy/               ← cała teoria i lektury
│   ├── Epoki/                    ← 11 epok literackich
│   ├── Lektury/                  ← wszystkie lektury obowiązkowe
│   ├── Teoria-Literatury/        ← środki stylistyczne, gatunki, motywy
│   └── Jezyk-i-Pisanie/          ← rozprawka, nauka o języku, ustny
├── 01-Analiza-Pytan/             ← historia matur 2021–2025, przewidywania
├── 02-Agenci/                    ← 4 agenci-nauczyciele (prompty do Claude/ChatGPT)
├── 03-Plan-Nauki/                ← harmonogram i trackery
├── 04-Fiszki/                    ← fiszki do powtórek
└── 05-Szablony/                  ← szablony notatek
```

## Jak uczyć się z tego vault

### Codzienna rutyna (90 min / dzień)

| Czas | Co robisz | Gdzie |
|------|-----------|-------|
| 10 min | Plan dnia + przegląd tracker-a | [[03-Plan-Nauki/Plan-dzienny]] |
| 30 min | Nauka jednej lektury / epoki | [[MOC#Baza wiedzy]] |
| 20 min | Fiszki (powtórka) | [[04-Fiszki/Fiszki-motywy]], [[04-Fiszki/Fiszki-epoki]], [[04-Fiszki/Fiszki-srodki-stylistyczne]] |
| 30 min | Ćwiczenie — Agent-Egzaminator | [[02-Agenci/Agent-Egzaminator|Agent-Egzaminator]] |

### Co 3-4 dni

- Symulacja ustnego z [[02-Agenci/Agent-Egzaminator|Agent-Egzaminator]]
- Przegląd: [[01-Analiza-Pytan/Przewidywania-2026]]

### Raz w tygodniu

- Pisemna rozprawka → ocena przez [[02-Agenci/Agent-Korepetytor|Agent-Korepetytor]]
- Aktualizacja [[03-Plan-Nauki/Tracker-postepu]]

## Agenci — jak z nich korzystać

Każdy agent to prompt/instrukcja do LLM (Claude, ChatGPT). Otwórz plik agenta, skopiuj prompt, wklej do LLM razem z materiałem, który chcesz przerobić.

- 📅 [[02-Agenci/Agent-Plan-Nauki|Agent-Plan-Nauki]] — układa plan na dzisiaj / tydzień
- 🎓 [[02-Agenci/Agent-Egzaminator|Agent-Egzaminator]] — symuluje egzamin ustny i pisemny
- 👨‍🏫 [[02-Agenci/Agent-Korepetytor|Agent-Korepetytor]] — tłumaczy trudne tematy, ocenia rozprawki
- 🔬 [[02-Agenci/Agent-Analityk-Pytan]] — typuje najbardziej prawdopodobne tematy

## Skróty klawiszowe Obsidian (niezbędne)

- `Ctrl+O` — szybkie otwarcie pliku
- `Ctrl+E` — edit/preview toggle
- `Ctrl+G` — graph view
- `Ctrl+Shift+F` — wyszukiwanie w całym vault
- `[[` — wstawienie linku do innej notatki
- `#` — tag

## Status i wiarygodność informacji

- **Źródło listy lektur i pytań jawnych:** CKE (komunikaty 2024–2025)
- **Data budowy vault:** 2026-04-22 | **Do matury pisemnej:** 13 dni (05.05.2026)
- **Pewność danych:** 85% — zawsze weryfikuj aktualną wersję dokumentów na https://cke.gov.pl przed egzaminem
- **Spójność wikilinków:** ~93% (1200+ linków, nieliczne placeholdery i fleksja pozostały)
- **Co może się różnić:** drobne zmiany w komunikatach CKE publikowanych w kwietniu/maju 2026

## Wsparcie

Jeśli coś jest niejasne, otwórz [[MOC]] i znajdź odpowiednią sekcję. Każda lektura ma wikilinki do epoki, motywów i powiązanych lektur — kliknij, żeby skoczyć.

Powodzenia na maturze 🍀
