# 📚 Matura Polski 2026

Komplet **4 interaktywnych narzędzi** do nauki na maturę z języka polskiego (poziom podstawowy, formuła 2023, egzamin 5 maja 2026). Działają w **3 trybach**: GitHub Pages (przeglądarka), Claude Cowork (desktop), Claude Code (CLI).

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-brightgreen)](#deployment)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-60%2F60%20green-brightgreen)](#testy)

## 🎯 Co tu jest

| Narzędzie | Funkcja | Pokrycie matury |
|---|---|---|
| 📝 **Rozprawka Scaffolder** | 5-akapitowy scaffold + ocena 35-pkt CKE | Część 2 pisemna (35 pkt) |
| 🃏 **Fiszki Matura** | 63 fiszki + spaced repetition + calibration | Powtórki materiału |
| 🎓 **Egzaminator Ustny** | Symulacja ustnego z timerem + komisja AI | Ustny (30 pkt) |
| 📊 **Dashboard** | Countdown + drabina stresu + statystyki | Orientacja, motywacja |

## 🎓 Chcesz zbudować podobny projekt dla innego tematu?

Zobacz **[PLAYBOOK.md](PLAYBOOK.md)** — kompletny przewodnik replikacji tego repo dla:
- innej matury (biologia, matematyka, historia)
- certyfikatów zawodowych (ISO, AWS, ACCA)
- kursów językowych
- onboarding/training material
- compliance tools

**Stack:** 9 agentów AI w metodologii Spec-Driven TDD, 5 faz, ~1 dzień pracy, ~$50-100 tokenów.

---

## 🚀 3 sposoby użycia

### 1. Web (GitHub Pages) — najszybciej
1. Otwórz **https://[twoj-username].github.io/matura-polski-2026/** (po wdrożeniu)
2. Wpisz klucz API Anthropic (ikona 🔑) — jednorazowo, zapisuje się w Twojej przeglądarce
3. Klikaj narzędzia z listy
4. Wszystkie wywołania idą bezpośrednio do `api.anthropic.com` z Twojej przeglądarki (CORS-enabled)

> Klucz API: ~$5 wystarcza na ~tysiące zapytań. Załóż konto na [console.anthropic.com](https://console.anthropic.com).

### 2. Claude Cowork (desktop) — najwygodniej dla codziennego użytku
1. Sklonuj repo: `git clone https://github.com/[twoj-username]/matura-polski-2026.git`
2. Otwórz Cowork, wybierz folder `matura-polski-2026/`
3. Zaimportuj 4 artifacty z folderu `docs/` jako artifacty Cowork (lub poproś Claude w Cowork "zaimportuj artifacty z docs/")
4. Inferencja przez `window.cowork.sample()` (Haiku, billing z Twojego planu Cowork)

### 3. Claude Code (CLI) — najpotężniej dla deep-learning
1. Sklonuj repo: `git clone ...`
2. Otwórz w VS Code lub terminalu z Claude Code zainstalowanym
3. Claude Code automatycznie wczyta `CLAUDE.md` (rola: korepetytor matury) + ma dostęp do całego vault w `vault/`
4. Pełen Sonnet/Opus, deep-session, agenci z `vault/02-Agenci/`
5. Komendy: `/agent korepetytor`, `/agent egzaminator`, `/agent analityk-pytan` itp.

## 📂 Struktura repo

```
matura-polski-2026/
├── README.md                # ten plik
├── SETUP.md                 # detale 3 trybów użycia
├── CLAUDE.md                # rola Claude (korepetytor matury, instrukcje sesji)
├── LICENSE                  # MIT
├── package.json             # dla Node.js (testy logic.js)
├── .gitignore
├── .github/workflows/
│   └── pages.yml            # auto-deploy na GitHub Pages
├── docs/                    # ← GitHub Pages root
│   ├── index.html           # landing page
│   ├── rozprawka.html       # Rozprawka Scaffolder
│   ├── fiszki.html          # Fiszki Matura
│   ├── egzaminator.html     # Egzaminator Ustny
│   ├── dashboard.html       # Dashboard
│   └── shared/
│       └── claude-api.js    # uniwersalny wrapper inferencji
├── impl/
│   └── logic.js             # czyste funkcje (testowalne)
├── tests/
│   ├── TESTS.md             # spec testów
│   └── harness.js           # 60 testów node:test (60/60 GREEN)
└── vault/                   # baza wiedzy Obsidian (~200 plików)
    ├── 00-Baza-Wiedzy/      # epoki, lektury, teoria, język
    ├── 01-Analiza-Pytan/    # historia matur 2021-2025, przewidywania
    ├── 02-Agenci/           # 4 agenci (Korepetytor, Egzaminator, ...)
    ├── 03-Plan-Nauki/       # harmonogram, tracker, plany
    ├── 04-Fiszki/           # banki fiszek
    └── 05-Szablony/         # szablony notatek
```

## 🧠 Architektura

### Universal Claude API wrapper (`docs/shared/claude-api.js`)
Każdy artifact używa `window.matura.callClaude(prompt)` zamiast bezpośredniego API. Wrapper wykrywa kontekst i wybiera backend:

```
window.matura.callClaude(prompt)
  ├── Czy claude.ai? → window.claude.complete()  [Sonnet, Pro billing]
  ├── Czy Cowork?    → window.cowork.sample()    [Haiku, Cowork billing]
  └── Else (browser) → fetch api.anthropic.com   [user's API key]
```

### Persystencja
- `localStorage` per-domain — każdy artifact ma własny klucz (`fiszki-matura-v1`, `rozprawka-scaffolder-cowork-v1`, ...)
- Dane NIE są synchronizowane między urządzeniami — eksport ręczny przez Dashboard

### Bezpieczeństwo klucza API
- Klucz przechowywany TYLKO w `localStorage` Twojej przeglądarki
- Nigdy nie wysyłany na nasz serwer (nie ma serwera — to static site)
- Bezpośrednie wywołania do api.anthropic.com przez `anthropic-dangerous-direct-browser-access: true`
- Jeśli udostępniasz urządzenie — czyść klucz przyciskiem "🗑 Wyczyść klucz" w landing page

## 🧪 Testy

```bash
node tests/harness.js
```

Pokrycie: 60 testów dla pure functions (wordCount, parseGrade, getBudgetRemaining, migrate, composeExport, etc.). Status: 60/60 GREEN.

## 🛠 Deployment

### GitHub Pages (automatyczne via Actions)
1. Pushnij do `main` branch
2. W ustawieniach repo: Settings → Pages → Source: GitHub Actions
3. Workflow `.github/workflows/pages.yml` automatycznie deployuje folder `docs/`
4. Strona dostępna pod `https://[username].github.io/matura-polski-2026/`

### Lokalnie (do testowania)
```bash
cd docs/
python3 -m http.server 8080
# otwórz http://localhost:8080
```

## 📊 Pokrycie matury

```
Pisemna 70 pkt:
├── Część 1 zadania       35 pkt  ⚠️  brak (planowany Sprint 5)
└── Część 2 rozprawka     35 pkt  ✅ Rozprawka Scaffolder (~75%)

Ustna 30 pkt:             30 pkt  ✅ Egzaminator Ustny (~85%)

ŁĄCZNIE 100 pkt:          ~60% pokryte
```

Plus tryb chatu (Claude.ai z Sonnet/Opus, Cowork, Claude Code) — nieograniczona elastyczność.

## ⚠️ Ograniczenia

- **Część 1 pisemnej (zadania, 35 pkt)** — nie ma artifactu, ćwicz offline z arkuszami CKE 2021-2025
- **Sonnet vs Haiku** — Cowork używa Haiku (słabszy w analizie literackiej). Dla pełnej oceny CKE — użyj trybu web z kluczem API + Sonnet
- **Pisanie ręczne** — matura jest pisana ręcznie. Klawiatura nie buduje motor memory. Raz/tydz. napisz rozprawkę na papierze i sfotografuj do oceny w chacie

## 📅 Daty kluczowe

- **5 maja 2026, 9:00** — matura pisemna (240 min, 70 pkt)
- **maj/czerwiec 2026** — matura ustna (30 pkt)
- **Próg zdawalności:** 30%

## 🤝 Contributing

Pull requests welcome. Główne kierunki rozwoju:
- Sprint 5: **Trener Zadań CKE** (część 1 pisemnej, ~35 pkt)
- Rozszerzenie banku fiszek (obecnie 63, target 200+)
- Pełne 76 pytań jawnych CKE w Egzaminatorze (obecnie 30)
- Cross-artifact data flow (błąd w rozprawce → automatyczna fiszka)

## 📜 License

MIT — używaj, modyfikuj, dziel się. Zobacz [LICENSE](LICENSE).

## 🙏 Credits

Zbudowane z **Claude Sonnet/Opus** (Anthropic). Vault opracowany na podstawie oficjalnych komunikatów CKE 2023-2025.

**Wszystkie dane CKE** — weryfikuj na [cke.gov.pl](https://cke.gov.pl) przed egzaminem. Confidence danych: 90%, niektóre szczegóły mogą się zmienić w aneksach 2026.

---

🍀 **Powodzenia na maturze!**
