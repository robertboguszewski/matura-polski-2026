# 🛠 SETUP — szczegółowe instrukcje 3 trybów użycia

## Tryb 1: Web (GitHub Pages) — przeglądarka

### Krok 1: Klucz API Anthropic (jednorazowo)
1. Załóż konto na [console.anthropic.com](https://console.anthropic.com)
2. Doładuj kredyt (min $5 — wystarczy na ~tysiące zapytań)
3. **API Keys → Create Key** → skopiuj klucz `sk-ant-api03-...`

### Krok 2: Otwórz stronę
Otwórz w przeglądarce: `https://[twoj-username].github.io/matura-polski-2026/`

### Krok 3: Wprowadź klucz
- Kliknij **🔑 Ustaw klucz API** w nagłówku
- Wklej klucz, wybierz model (zalecane: `claude-sonnet-4-5`)
- Klucz zapisuje się TYLKO w localStorage tej przeglądarki

### Krok 4: Korzystaj
Kliknij dowolny artifact z 4-tile siatki. Wszystkie wywołania idą bezpośrednio do `api.anthropic.com`.

### Koszty (orientacyjnie, modele 4.5)
| Operacja | Tokens | Koszt |
|---|---|---|
| 1 krytyka akapitu rozprawki | ~1500 in / 600 out | ~$0.014 |
| 1 pełna ocena rozprawki | ~3500 in / 1200 out | ~$0.029 |
| 1 fiszka "wytłumacz" | ~400 in / 250 out | ~$0.005 |
| 1 sesja egzaminatora (10 wywołań) | ~12000 / 4000 | ~$0.10 |
| **Łącznie sesja 90 min nauki** | | **~$0.30-0.50** |

13 dni × $0.50 = ~$6.50. Bezpieczny budżet $10 starczy.

---

## Tryb 2: Claude Cowork (desktop)

### Wymagania
- Claude Cowork zainstalowane (https://claude.ai/download)
- Aktywna subskrypcja umożliwiająca artifacty Cowork

### Krok 1: Pobierz repo
```bash
git clone https://github.com/[username]/matura-polski-2026.git
cd matura-polski-2026
```

### Krok 2: Otwórz w Cowork
- Cowork → **Settings → Working Directory** → wybierz folder `matura-polski-2026/`

### Krok 3: Zaimportuj artifacty
W chacie Cowork wpisz:
> Zaimportuj artifacty z folderu `docs/`: rozprawka.html, fiszki.html, egzaminator.html, dashboard.html — każdy jako osobny Cowork artifact.

Claude w Cowork sam wywoła `mcp__cowork__create_artifact` 4 razy.

**Alternatywa:** Cowork może już mieć je zainstalowane jeśli korzystałeś z tego setupu wcześniej (`fiszki-matura`, `rozprawka-scaffolder-matura`, etc.).

### Tryb inferencji
Artifacty same wykryją Cowork i użyją `window.cowork.sample()` (Claude Haiku, billing z Cowork).

### Persystencja
`localStorage` w sandboxie iframe — przeżywa zamknięcie/otwarcie sidebara Cowork.

---

## Tryb 3: Claude Code (CLI) — najpotężniejszy

### Wymagania
- Claude Code zainstalowane (https://claude.com/code)
- VS Code lub terminal

### Krok 1: Pobierz repo
```bash
git clone https://github.com/[username]/matura-polski-2026.git
cd matura-polski-2026
```

### Krok 2: Uruchom Claude Code
```bash
claude
```

### Krok 3: Claude wczyta `CLAUDE.md`
Plik `CLAUDE.md` w głównym katalogu definiuje rolę Claude'a:
- **Rola:** osobisty korepetytor matury polskiej (poziom podstawowy, formuła 2023)
- **Cele:** maksymalny wynik, mnemoniki, automatyzmy egzaminacyjne, motywacja
- **Tryby:** Egzaminator / Korepetytor / Powtórka / Analiza / Pisanie

### Krok 4: Wybierz tryb sesji
Po uruchomieniu, Claude zaproponuje tryb. Możesz też wpisać:

```
"Jestem 10 dni przed maturą. Zacznij od testu diagnostycznego — 10 pytań z różnych obszarów."
```

albo

```
"Załóż tryb Egzaminator. Wylosuj zestaw ustny."
```

### Co Claude Code ma na wyciągnięcie ręki
- **Cały vault `vault/`** — 200+ plików .md (epoki, lektury, teoria, fiszki, plany)
- **Agenci `vault/02-Agenci/`** — predefinowane prompty dla 4 ról (Korepetytor, Egzaminator, Plan-Nauki, Analityk-Pytan)
- **Historia `vault/06-Historia-Nauki/`** — Claude może czytać profil ucznia + historię odpowiedzi (jeśli prowadzisz)
- **Pełen Sonnet/Opus** — najwyższa jakość analizy literackiej

### Przykłady komend
- `"Wylosuj 5 fiszek z motywów. Sprawdzaj jedną po drugiej."`
- `"Zacznij symulację ustnego — wylosuj zestaw."`
- `"Napisz fragment rozprawki, oceń, zaproponuj poprawki."`
- `"Wytłumacz mi różnicę między romantyzmem a Młodą Polską na 5 konkretnych przykładach."`
- `"Sprawdź co wiem o Lalce — pytania kontrolne, dropdown ABCD."`

---

## Tryb hybrydowy (zalecany)

Najlepsze rezultaty: **łącz tryby**.

| Czynność | Najlepszy tryb |
|---|---|
| Codziennie rano: przegląd dnia | Tryb 1 (web) → Dashboard |
| Drill fiszek 20 min | Tryb 2 (Cowork) lub Tryb 1 (web) |
| Pisanie rozprawki + ocena | Tryb 1 (web) z Sonnet 4.5 |
| Symulacja ustnego | Tryb 1 (web) z Sonnet 4.5 LUB Tryb 3 (Code) |
| Deep-session "wytłumacz mi epokę" | **Tryb 3 (Code)** z pełnym vault |
| Powtórki przed snem (5-7 fiszek) | Tryb 2 (Cowork) — szybkie |

---

## 🐛 Troubleshooting

### "Klucz API nie działa"
- Sprawdź czy zaczyna się od `sk-ant-`
- Sprawdź kredyt na console.anthropic.com
- Sprawdź czy nie wygasł (klucze nie wygasają, ale możesz je revoke'ować)

### "CORS error"
- Anthropic API powinno działać z header `anthropic-dangerous-direct-browser-access: true`
- Jeśli nie działa, możliwe że Anthropic zmienił politykę — sprawdź docs

### "Rate limit"
- Plan Pro Anthropic ma rate limity per okno
- Web tryb (klucz API): zależy od Twojego tier'a w Anthropic Console
- Cowork: ~45 wiadomości / 5h
- Claude Code: zależnie od subskrypcji

### "Artifact się nie ładuje w Cowork"
- Sprawdź czy folder jest w Working Directory
- Sprawdź czy plik .html istnieje w `.artifacts/[id]/index.html`
- Spróbuj odświeżyć Cowork (Cmd+R)

### "Storage pełny"
- Każdy artifact ma osobny klucz w localStorage (~50 KB każdy)
- Przeglądarka powinna mieć min 5 MB per domain
- Wyczyść cache przeglądarki jeśli problem trwa

---

## 📝 FAQ

**Q: Czy moje dane są wysyłane na jakiś serwer?**
A: NIE (poza wywołaniami inferencji). Klucz API i Twoja praca pozostają w localStorage przeglądarki. Wywołania inferencji idą BEZPOŚREDNIO do api.anthropic.com (przez Twoją przeglądarkę). Nie ma backendu.

**Q: Czy mogę używać innych modeli (np. GPT)?**
A: Nie out-of-the-box. Architektura zakłada Anthropic API. Można forkować i przepisać `claude-api.js`.

**Q: Czy działa offline?**
A: Częściowo. Scaffold rozprawki, fiszki (przeglądanie), Dashboard — TAK. Wszystko co wymaga inferencji (ocena, krytyka, "wytłumacz") — NIE.

**Q: Czy moge dodawać własne fiszki?**
A: W Sprintach 1-4: NIE (statyczny bank). W Sprincie 5+: planowane.

**Q: Czy działa na telefonie?**
A: Tak, responsive design. Tryb 1 (web) najlepszy na mobile.

---

🚀 Powodzenia. Otwieraj `index.html` i jedziemy.
