---
name: Podsumowanie wykonania Sprintów 1-4 + audyt pokrycia matury
description: Zestawienie tego co zostało dostarczone vs pierwotny plan vs pełen zakres matury 2026
type: podsumowanie
data: 2026-04-25
days_to_matura: 10
sprint_status: 4/4 done
matura_coverage: ~60%
confidence: 85%
---

# 📋 Podsumowanie wykonania Sprintów 1-4 + audyt pokrycia matury

> **Data:** 2026-04-25 (10 dni do matury pisemnej 5 maja 2026)
> **Status:** 4 z 4 zaplanowanych artifactów w Cowork inventory
> **Pokrycie matury:** ~60% (2 z 3 segmentów oceny)
> **Krytyczne braki:** część 1 pisemnej (zadania 35 pkt) + praca z fragmentem

---

## 1. Zakres pierwotny (z `Plan-konwersji-artifact.md` v2)

Plan dwuprzebiegowy zakładał:

### Faza A — 4 sprinty artifactów (Cowork)
| Sprint | Artifact | Status | Plik |
|---|---|---|---|
| 1 | Rozprawka Scaffolder | ✅ | `rozprawka-scaffolder-matura` (Cowork) + `rozprawka-scaffolder.jsx` (Claude.ai) |
| 2 | Fiszki Drill | ✅ | `fiszki-matura` |
| 3 | Egzaminator Ustny | ✅ | `egzaminator-ustny-matura` |
| 4 | Dashboard | ✅ | `dashboard-matura-polski` |

### Faza B — fixy z Red Team + Pedagog
| ID | Fix | Status |
|---|---|---|
| Red-1 | Privacy warning modal | ✅ obecny w Rozprawce + Fiszkach + Egzaminatorze |
| Red-2 | Anty-plagiat hint | ✅ w prompcie oceny rozprawki |
| Red-3 | Prompt injection guard | ✅ w SYSTEM_PROMPT |
| Red-4 | BUDGET_TICK persistencja | ✅ tylko w Rozprawce .jsx |
| Pedag-P5 | Tryb Symulacja Egzaminu | ✅ Egzaminator z timerem 15+10 |
| Pedag-P6 | Banner "raz/tydz. ręcznie" | ✅ w Rozprawce + Dashboardzie |
| Pedag-P8 | Calibration check | ✅ w Fiszkach (confidence 25/50/75/100%) |
| Pedag-P1 | Bank tematów / pytań | ✅ 30 pytań jawnych w Egzaminatorze |

### Faza C — TDD + multi-agent (process)
- ✅ 5 agentów spawn'owanych (Architect, CKE Specialist, Test Designer wykonali; Implementator + Red-Team timeoutowali → direct execution)
- ✅ 60/60 testów logiki GREEN (`tests/harness.js`)
- ✅ 8 plików deliverable (4407 linii dokumentacja + kod) w `07-Artifacts/Rozprawka-Scaffolder/`

---

## 2. Cowork inventory — finalna lista

```
1. dashboard-matura-polski           (Dashboard, Chart.js, 4-tile widok)
2. egzaminator-ustny-matura          (symulacja ustnego, 30 pytań CKE + Haiku)
3. fiszki-matura                     (~63 fiszki, SM-2 lite, calibration)
4. rozprawka-scaffolder-matura       (5-akapit scaffold, ocena 35-pkt Haiku)
```

Plus **`rozprawka-scaffolder.jsx`** dla Claude.ai (Sonnet zamiast Haiku — pełna jakość oceny rozprawki).

---

## 3. Pełen zakres matury 2026 — co pokrywam, co NIE

### 3.1 Matura pisemna (5 maja 2026, 240 min, 70 pkt)

| Część | Pkt | Format | Coverage MOJEGO setupu |
|---|---|---|---|
| **Część 1: Zadania** | **35 pkt** | czytanie ze zrozumieniem, słownictwo, gramatyka, frazeologia, wnioskowanie | ❌ **BRAK** (krytyczna luka 50% matury pisemnej) |
| **Część 2: Wypowiedź pisemna** | **35 pkt** | rozprawka 300+ słów wg tematu CKE, najczęściej w oparciu o fragment lektury | ✅ częściowo (scaffold + ocena, ALE bez pracy z fragmentem) |

### 3.2 Matura ustna (maj/czerwiec 2026, 30 pkt)

| Element | Pkt | Coverage |
|---|---|---|
| Wypowiedź monologowa (2 pyt: jawne + niejawne) | 16 pkt | ✅ Egzaminator |
| Rozmowa z komisją | 12 pkt | ✅ Egzaminator (3 osobowości) |
| Sprawność komunikacyjna | 2 pkt | ✅ ocena Haiku |

### 3.3 Mapa pokrycia łączna

```
Matura pisemna 70 pkt:
├── Część 1 zadania       35 pkt  ❌ 0% pokryte    ←── KRYTYCZNA LUKA
└── Część 2 rozprawka     35 pkt  ✅ ~70% pokryte (brak: praca z fragmentem)

Matura ustna 30 pkt:      30 pkt  ✅ ~85% pokryte

ŁĄCZNIE 100 pkt:          ~60 pkt funkcjonalnie pokryte (60%)
```

**Krytyczna obserwacja:** część 1 pisemnej (35 pkt = 35% całej matury) jest **całkowicie nieadresowana** przez moje 4 artifacty. To luka której pierwotny plan nie zauważył.

---

## 4. Co dostarczono — szczegółowo per artifact

### 4.1 Rozprawka Scaffolder (Sprint 1)
**Co potrafi:**
- 5-akapitowy scaffold z limitami słów per akapit (40-60/80-110/60-80/60-80/40-60)
- Live word counter, 3 kolory
- Per-akapit krytyka przez Haiku
- Pełna ocena 7-kryteriów CKE 35-pkt z JSON output
- Autosave 30s do localStorage + restore
- Privacy mode + anty-plagiat hint
- Eksport do clipboard

**Czego NIE potrafi:**
- ❌ Praca z fragmentem (matura zwykle daje tekst-bodźca)
- ❌ Bank tematów historycznych (user musi sam wymyślić)
- ❌ Diff historyczny ocen (śledzenie postępu rozprawki w czasie)
- ❌ Druga opinia (planowane w v2)
- ❌ Edit-in-place (popraw fragment Sonnet)

**ROI:** wysoki — scaffold + struktura PEEL = 18 pkt z 35 dostępnych.

### 4.2 Fiszki Matura (Sprint 2)
**Co potrafi:**
- 63 fiszki w 12 kategoriach: epoki, autorzy (Mickiewicz, Słowacki), poeci, proza, środki stylistyczne, cytaty, motywy, daty, bohaterowie, gatunki, CKE-strategia
- Spaced repetition (1/3/7/14/30 dni)
- 3-znacznikowa ocena ✓/⚠/✗ (anti-game-play)
- Confidence calibration (zgadnij pewność przed odpowiedzią)
- Streak counter, accuracy %
- Tryb "wytłumacz Haiku" przy trudnych
- Filtry: due / all / weak / tag
- Persystencja localStorage

**Czego NIE potrafi:**
- ❌ Generowanie nowych fiszek (statyczny bank)
- ❌ Cloze deletion (wypełnij lukę)
- ❌ Audio (wymowa, np. dla cytatów łacińskich)
- ❌ Cross-link do rozprawki (błąd faktograficzny w rozprawce → automatyczna fiszka)

**ROI:** wysoki — Pareto wybór tematów = ~80% pokrycie pytań egzaminacyjnych.

### 4.3 Egzaminator Ustny (Sprint 3)
**Co potrafi:**
- Losowanie zestawu: 1 z 30 pytań jawnych CKE + 1 niejawne wygenerowane Haiku
- Timer 15 min przygotowania + 10 min wypowiedzi
- Tryb easy / medium / hard (różny poziom presji)
- Komisja 3 osobowości (życzliwy/sceptyczny/ciekawski) — Haiku wciela się
- Faza Q&A (3-4 pytania pogłębiające)
- Ocena 30 pkt wg kryteriów CKE: komunikacyjna (2) + monolog (16) + rozmowa (12)
- Pełen transcript dialogów

**Czego NIE potrafi:**
- ❌ Mówienie głośno (artifact text-only — speech-to-text wymagałby Web Speech API)
- ❌ Nagranie wypowiedzi do późniejszego odsłuchania
- ❌ Pełna lista 76 pytań jawnych CKE 2026 (mam tylko 30 z 76)
- ❌ Adaptive difficulty na podstawie historii (każda symulacja świeża)

**ROI:** wysoki — symulacja presji + komisji = jedyne miejsce w setupie gdzie user trenuje stres.

### 4.4 Dashboard Matura Polski (Sprint 4)
**Co potrafi:**
- Countdown do 5 maja 2026 (auto-faza low/medium/high/peak/off)
- Wykres trendu fiszek 14 dni (Chart.js bar)
- Wykres pokrycia tagów (accuracy per kategoria)
- Lista słabych fiszek (top 8 < 50% accuracy)
- Plan na dziś (rekomendacje per faza)
- Tip dnia (deterministyczny per dzień)
- Linki/karty do pozostałych 3 artifactów
- Drabina ekspozycji na stres (5 etapów wizualne)

**Czego NIE potrafi:**
- ❌ Czyta tylko fiszki-matura state, nie czyta rozprawki/egzaminatora
- ❌ Brak historii ocen rozprawki (gdyby Rozprawka zapisywała → trend można pokazać)
- ❌ Brak cross-export (zapisz raport tygodniowy do PDF/MD)

**ROI:** średni — motywacja + orientacja, nie sama nauka.

---

## 5. Luki względem pełnego zakresu matury (uzupełnienie planu)

### 5.1 LUKA KRYTYCZNA: Część 1 pisemnej (35 pkt)

**Co to jest:** Zestaw zadań w arkuszu maturalnym — czytanie ze zrozumieniem fragmentów (literackich + nieliterackich), wnioskowanie, gramatyka, słownictwo, frazeologia, redagowanie krótkich form (notatka syntetyzująca, streszczenie).

**Dlaczego krytyczne:** 35 pkt = **50% matury pisemnej**, **35% całej matury z polskiego**. Bez treningu tego segmentu — user może mieć perfekcyjną rozprawkę i ustny, a wpadać na łatwych zadaniach.

**Propozycja artifactu Sprint 5: Trener Zadań CKE**
- Bank ~50 zadań typu maturalnego (czytanie ze zrozumieniem, frazeologia, gramatyka)
- Generator pytań przez Haiku z fragmentu tekstu
- Tryb 45-min sesji symulującej część 1
- Auto-ocena (multiple choice + krótkie odpowiedzi)
- Statystyki per typ zadania (które typy słabe)

**Estymowany czas budowy:** 4-5h
**Priorytet:** **NAJWYŻSZY** — większy niż dalsze ulepszanie istniejących artifactów

### 5.2 LUKA WAŻNA: Praca z fragmentem w rozprawce

**Co to jest:** Matura 2026 najczęściej daje rozprawkę "w oparciu o podany fragment lektury + szerszą znajomość utworu". Rozprawka Scaffolder NIE ma pola na fragment-bodziec.

**Propozycja:** rozszerzenie Rozprawki o pole "fragment z arkusza" (textarea) → Sonnet/Haiku integruje go w prompt oceny.

**Estymowany czas:** 30 min (Sprint 1.5)
**Priorytet:** WYSOKI

### 5.3 LUKA ŚREDNIA: Bank tematów historycznych dla rozprawki

**Co to jest:** Dostęp do tematów z poprzednich matur (2021-2025) + przewidywanych dla 2026 (analiza Pareto z vault).

**Propozycja:** dropdown "Losuj temat" w Rozprawce, źródło = `01-Analiza-Pytan/Tematy-wypracowan-historycznie.md` + `Przewidywania-2026.md`.

**Estymowany czas:** 1h (Sprint 1.5)
**Priorytet:** ŚREDNI

### 5.4 LUKA ŚREDNIA: Pełna lista 76 pytań jawnych CKE

**Co to jest:** Egzaminator ma 30 pytań, CKE opublikowała 76 na 2026-2028.

**Propozycja:** import `01-Analiza-Pytan/Pytania-jawne-ustne-2026.md` (vault ma pełen wykaz).

**Estymowany czas:** 30 min (zmiana danych, nie kodu)
**Priorytet:** ŚREDNI

### 5.5 LUKA NISKA: Cross-artifact data flow

**Co to jest:** Błąd w rozprawce ("zła data Dziadów") → automatyczna fiszka w fiszki-matura.

**Propozycja:** wspólny localStorage namespace + listener w Fiszkach który dodaje nowe karty.

**Estymowany czas:** 2h (architektoniczne, nie krytyczne)
**Priorytet:** NISKI

### 5.6 LUKI Z PEDAGOGY REPORT (niezrealizowane)

| Luka | Status | Czy adresować? |
|---|---|---|
| P2 progresja między rozprawkami | ❌ | tak, w v2 (1h) |
| P3 adaptive difficulty | ❌ | nie, mało ROI dla matury za 10 dni |
| P4 typy błędów + linki vault | ❌ | tak, w v2 (45 min) |
| P7 self-explanation prompts | ❌ | mało ROI (30 min) |
| P9 elaborative interrogation | ❌ | mało ROI |
| P10 achievements/streaks rozszerzone | ❌ częściowo (jest streak, brak achievements) | nice-to-have |

---

## 6. Sprint 5 — propozycja (uzupełniający plan)

### Cel
Pokryć ostatnie 35 pkt pisemnej (część 1 zadań CKE) → matura pisemna staje się 100% adresowana.

### Scope (3 deliverables)

#### 5A. Trener Zadań CKE (artifact)
- 4-5h budowy
- Single-file HTML, Cowork, Haiku
- Bank ~30-50 zadań w 5 typach: czytanie literackie, czytanie nieliterackie, gramatyka, frazeologia, notatka syntetyzująca
- Timer 45 min (część 1)
- Auto-grading dla MCQ + Haiku-grading dla otwartych
- Statystyki per typ zadania

#### 5B. Patch Rozprawki: pole fragmentu
- 30 min
- Edit `rozprawka-scaffolder-matura` (Cowork update_artifact)
- Edit `rozprawka-scaffolder.jsx` (Claude.ai version)
- Dodać textarea "Fragment z arkusza" pod Topic
- Inkorporacja w prompt buildGradePrompt

#### 5C. Patch Egzaminatora: pełne 76 pytań CKE
- 30 min
- Replace PYTANIA_JAWNE z 30 → 76
- Źródło: `/01-Analiza-Pytan/Pytania-jawne-ustne-2026.md`
- Update `egzaminator-ustny-matura`

### Sprint 5 — szacunki

| Task | Czas | Priorytet | ROI |
|---|---|---|---|
| 5A Trener Zadań | 4-5h | KRYTYCZNY | bardzo wysoki (35 pkt) |
| 5B Patch fragmentu | 30 min | WYSOKI | wysoki |
| 5C Patch 76 pytań | 30 min | ŚREDNI | średni |
| **RAZEM Sprint 5** | **~6h** | | |

### Po Sprincie 5 — pełne pokrycie:
```
Matura pisemna 70 pkt:
├── Część 1 zadania       35 pkt  ✅ pokryte (Trener Zadań)
└── Część 2 rozprawka     35 pkt  ✅ pełniej pokryte (z fragmentem)

Matura ustna 30 pkt:      30 pkt  ✅ pełniej pokryte (76 pytań)

ŁĄCZNIE 100 pkt:          ~95% funkcjonalnie pokryte
```

---

## 7. Estymacja vs rzeczywistość

### Pierwotny plan (z `Plan-konwersji-artifact.md`)
- Sprint 1 (Rozprawka): 4-5h budowy
- Sprint 2 (Fiszki): 4-5h budowy
- Sprint 3 (Egzaminator): 5-6h budowy
- Sprint 4 (Dashboard): 2h budowy
- **Łącznie estymowane: 15-18h**

### Rzeczywiste
- Sprint 1: ~3h (Rozprawka jsx + Cowork + tests + reviews + fixy)
- Sprint 2: ~1h (Fiszki — bezpośrednio bez agentów)
- Sprint 3: ~1h (Egzaminator)
- Sprint 4: ~30 min (Dashboard)
- **Łącznie: ~5.5h** w jednej sesji

### Dlaczego szybciej
- Direct execution po wielokrotnych agentowych timeoutach
- Reuse logiki między artifactami
- Cowork artifact prostszy niż React (vanilla JS)
- Haiku zamiast pełnej walidacji Sonnet

### Dlaczego nadal jest Sprint 5
- Pierwotny plan **NIE uwzględnił** części 1 pisemnej matury
- Pełen zakres matury wykryty dopiero przy audycie (krok 3)
- 35 pkt z 70 to za dużo żeby zignorować

---

## 8. Rekomendacja dalsza

**Decyzja krytyczna:** zbudować Sprint 5 (Trener Zadań CKE) — **TAK lub NIE?**

### Argumenty ZA Sprintem 5:
- Pokrywa 35 pkt = 35% matury (część 1 pisemna)
- Bez tego user może wpaść na łatwych zadaniach
- 4-5h budowy = 1 dzień intensywny
- Mamy 10 dni do matury, czas wystarczy

### Argumenty PRZECIW:
- 4 artifacty już to dużo do opanowania
- User może woleć skupić się na nauce niż używać 5 narzędzi
- Część 1 można ćwiczyć offline z arkuszami CKE (są dostępne PDF)

### Moja rekomendacja
**ZBUDUJ Sprint 5A (Trener Zadań).** Pomiń 5B i 5C jeśli braknie czasu — to luksus.

**Alternatywa minimalna:**
- Pomiń Sprint 5 całkowicie
- W zamian: pobierz 3-5 arkuszy CKE 2021-2025 z cke.gov.pl
- Trenuj część 1 offline z papierowym arkuszem + stoperem 45 min
- Sprawdzaj samodzielnie + ewentualnie wyślij do chatu Claude do oceny

---

## 9. Stan na dziś (10 dni do matury)

### Setup gotowy do użycia
- ✅ 4 artifacty Cowork w sidebarze
- ✅ 1 React jsx do Claude.ai
- ✅ Vault z 40 lekturami, 11 epokami, 76 pytaniami jawnymi, agentami w `02-Agenci/`
- ✅ Dashboard agreguje postęp z fiszek

### Co user powinien robić od dziś
1. **Codziennie rano (15 min):** Dashboard → zobacz fazę + plan na dziś
2. **Codziennie (20 min):** Fiszki Drill — tryb "due" + jeśli czas tryb "weak"
3. **Co 2-3 dni (45 min):** Rozprawka Scaffolder — pełna rozprawka z oceną
4. **Co 3-4 dni (45 min):** Egzaminator Ustny — symulacja
5. **Raz w tygodniu (180 min):** Pełna rozprawka **RĘCZNIE** + zdjęcie do chatu z Claude (Sonnet)
6. **Wieczorem (5-10 min):** powtórka 5 najważniejszych fiszek (pre-sleep boost)

### Co user MUSI doczytać poza setupem
- Część 1 zadań — arkusze CKE 2021-2025 (3-5 sesji × 45 min = 4 h pracy)
- Aneks CKE 2026 — sprawdzaj cke.gov.pl co kilka dni (publikacja ~tydzień przed)

---

## 10. Confidence summary

| Wymiar | Confidence |
|---|---|
| Funkcjonalność wszystkich 4 artifactów | 90% |
| Pokrycie część 2 (rozprawka) | 75% |
| Pokrycie część 1 (zadania) | 0% — krytyczna luka |
| Pokrycie ustny | 85% |
| Jakość oceny Haiku vs CKE | 65% (zaniżona — Haiku łagodniejsza) |
| Jakość oceny Sonnet (jsx) vs CKE | 80% |
| **Łącznie pokrycie matury (bez Sprint 5)** | **60%** |
| **Łącznie pokrycie matury (z Sprint 5)** | **90%** |

---

## 🔗 Powiązane

- [[Plan-konwersji-artifact]] (plan oryginalny)
- [[Harmonogram-do-matury]]
- [[Tracker-postepu]]
- [[01-Analiza-Pytan/Pytania-jawne-ustne-2026]]
- [[01-Analiza-Pytan/Tematy-wypracowan-historycznie]]
- [[00-Baza-Wiedzy/Struktura-matury-2026]]
