---
name: Plan artifactów wspierających naukę z Claude (Pro)
description: Jak artifacty Claude.ai Pro mogą maksymalizować skuteczność nauki z Sonnet/Opus — analiza luk i edge cases
type: plan
tags: [plan, artifact, nauka, claude-pro, edge-cases]
data_utworzenia: 2026-04-24
data_rewizji: 2026-04-25
pewnosc: 90%
subskrypcja: claude-pro
status: SPRINTY 1-4 ZAKOŃCZONE, Sprint 5 do decyzji
sprint_status:
  sprint_1_rozprawka: DONE (artifact + jsx)
  sprint_2_fiszki: DONE
  sprint_3_egzaminator: DONE
  sprint_4_dashboard: DONE
  sprint_5_trener_zadan: PROPOSED (krytyczna luka — część 1 pisemnej 35 pkt)
matura_coverage_obecne: ~60%
matura_coverage_po_sprint_5: ~95%
---

# 🚨 STATUS NA 2026-04-25 (10 dni do matury)

**Sprinty 1-4: ZAKOŃCZONE** — wszystkie 4 artifacty w Cowork inventory + dodatkowo `rozprawka-scaffolder.jsx` dla Claude.ai (Sonnet).

**Pełen audyt + Sprint 5 propozycja:** zobacz [[Podsumowanie-wykonania-Sprintów-1-4]]

**Krytyczna luka wykryta:** część 1 matury pisemnej (zadania 35 pkt) NIE jest pokryta żadnym z 4 artifactów. To 35% całej matury z polskiego. Sprint 5 (Trener Zadań CKE, ~5h budowy) by ją pokrył.

---

# ⚡ KLUCZOWA ZMIANA — Claude Pro odblokowuje artifact-as-agent

Na planie Pro artifact w claude.ai ma dostęp do:
- **`window.claude.complete(prompt)`** — wywołanie Sonnet (jakość pełna, nie Haiku) z wnętrza artifactu
- **`window.storage`** — persystencja stanu do 20 MB (między sesjami artifactu)
- **Billing:** tokeny liczone z konta Pro użytkownika (nie z limitu aplikacji)
- **Rate limit Pro:** ~45 wiadomości / 5h — **to jest twarda bariera którą trzeba zaplanować**

Skutek: artifact może być **pełnoprawnym egzaminatorem/korepetytorem** z jakością Sonnet, nie tylko HUD-em.

# Plan: artifact jako HUD do nauki w czacie z Claude

> **Cel:** maksymalna skuteczność nauki przez chat z Sonnet/Opus. Artifact = narzędzie wspierające, nie alternatywa.
> **Kluczowe odkrycie:** chat (Sonnet) uczy, artifact pokazuje stan i prowadzi dryl solo. Żadnego Haiku do oceny rozprawek.

---

## 1. Podział ról — chat vs artifact

| Funkcja | Kto robi | Dlaczego |
|---|---|---|
| Tłumaczenie błędów, Sokratyczne pytania | **Chat (Sonnet/Opus)** | Głębokie rozumienie literatury, mnemoniki na bieżąco |
| Ocena rozprawki 35 pkt CKE | **Chat (Sonnet/Opus)** | Haiku niewystarczający — analiza literacka to nie klasyfikacja |
| Symulacja komisji egzaminacyjnej | **Chat (Sonnet/Opus)** | Wcielanie się w rolę, dramaturgia, pytania pogłębiające |
| Generowanie haków pamięciowych | **Chat (Sonnet/Opus)** | Kreatywność językowa |
| Timer, scenografia, karta pytań | **Artifact** | Chat nie ma persystentnego UI |
| Licznik punktów, streak, progress bars | **Artifact** | Wizualizacja motywuje |
| Drill fiszek solo (5-10 min między sesjami) | **Artifact** | Chat nie potrzebny do mechanicznej powtórki |
| Scaffold do pisania rozprawki | **Artifact** | Struktura akapitów, licznik słów per sekcja |
| Historia/tracker postępu | **Artifact** | Widok z lotu ptaka |

**Zasada:** artifact **wizualizuje i utrwala**, chat **tłumaczy i ocenia**.

---

## 2. Krytyczna mechanika — jak chat steruje artifactem

W Cowork działa pętla:
- Chat używa `mcp__cowork__update_artifact` → modyfikuje stan HTML między turami
- Artifact czyta stan (embedded JSON lub `window.cowork.callMcpTool` dla filesystem)
- Użytkownik widzi zmiany na żywo

**To jest klucz.** Nie "artifact zamiast chatu" tylko "chat pisze do artifactu, artifact pokazuje".

Dla solo-drillu (bez chatu aktywnego):
- `window.cowork.sample()` = Haiku — OK dla "przypomnij definicję oksymoronu", **NIE** dla oceny rozprawki
- Persystencja stanu powtórek przez storage Cowork

---

## 3. Pięć artifactów-HUD — ranking ROI

### 🥇 TIER 1 — zbuduj od razu

#### A) **Egzaminator HUD** — najważniejszy
**Czas budowy:** 4-5h | **Zysk:** znacząca poprawa skuteczności symulacji

- Chat uruchamia artifact na starcie trybu Egzaminator
- Artifact pokazuje: scenografia (sala 204), 3 egzaminatorów z awatarami, karta pytań (1 jawne + 1 niejawne), **timer 15 min przygotowania**, **timer 10 min wypowiedzi**, licznik punktów 0-30
- Chat aktualizuje stan między turami: dodaje pytania pogłębiające, przyznaje punkty, wyświetla oceny cząstkowe wg kryteriów CKE
- Na koniec: karta wyniku z rozbiciem punktów + lista haków pamięciowych

**Dlaczego to działa:** uczeń widzi presję czasu i punktację w czasie rzeczywistym — symulacja staje się realna. Chat zostaje ciepłym, pomysłowym egzaminatorem.

#### B) **Rozprawka Scaffolder** — drugi priorytet
**Czas budowy:** 3h | **Zysk:** pisanie szybsze o ~20%, ocena dokładniejsza

- 5 pól tekstowych (wstęp, arg1, arg2, arg3, konkluzja) z **licznikiem słów per akapit** i limitami CKE
- Live-checklist 35 pkt CKE (treść, styl, język, ortografia, kompozycja)
- Przycisk "wyślij akapit do Claude" → chat pisze krytykę konkretnego akapitu, nie całości
- Przycisk "oceń całość" → chat dostaje pełny tekst + kryteria 35 pkt, wraca z rozbiciem
- Export: kopiuj na czysto

**Dlaczego to działa:** uczeń pisze w strukturze zamiast flow-of-consciousness. Chat ocenia precyzyjnie bo widzi zdefiniowane sekcje.

### 🥈 TIER 2 — zbuduj jeśli zostanie czas

#### C) **Fiszki Drill** — solo-dryl między sesjami chatu
**Czas budowy:** 3-4h | **Zysk:** +10-15% efektywności powtórek

- ~80 fiszek embedded jako JSON (motywy + epoki + środki + daty + cytaty)
- Algorytm spaced repetition SM-2 lite (1d/3d/7d/14d/30d)
- Persystencja stanu przez Cowork storage
- Dla trudnej fiszki — przycisk "zapytaj Claude" → otwiera chat z pre-fillem "wytłumacz mi [fiszka X], nie pamiętam haka"
- Streak counter, accuracy %, nagrody za 7-dniowy ciąg

**Dlaczego to działa:** mechaniczne powtórki NIE potrzebują Sonnet. Chat aktywuje się tylko przy zacięciach.

#### D) **Session Dashboard** — widok z lotu ptaka
**Czas budowy:** 2h | **Zysk:** orientacja + motywacja

- Countdown do matury (dni / godziny)
- Chart.js: pokrycie 32 lektur, pokrycie 76 pytań jawnych, mocne/słabe motywy
- Lista "do powtórki dziś" (chat pisze po każdej sesji)
- Plan jutra (chat proponuje na końcu sesji)

**Dlaczego to działa:** stabilizuje motywację, pokazuje konkretny postęp. Chat pisze dane, artifact renderuje.

### 🥉 TIER 3 — pomiń chyba że masz czas

#### E) **Quick Quiz Widget** — krótki warm-up
**Czas budowy:** 2h | **Zysk:** marginalny (AskUserQuestion już to robi)

- 5-10 pytań z czterema opcjami, natychmiastowy feedback
- Najlepiej NIE budować — chat z `AskUserQuestion` już renderuje to w UI

---

## 4. Proponowana ścieżka implementacji (4 dni)

**Dzień 1** (dziś, 2h): budowa Egzaminator HUD — prototyp v1 (scenografia + timer + karta pytań)
**Dzień 2** (2h): Egzaminator HUD v2 — integracja z `update_artifact` + karta wyniku
**Dzień 3** (3h): Rozprawka Scaffolder — 5 pól + liczniki + CKE checklist
**Dzień 4** (2h): Fiszki Drill — 40 fiszek (TOP motywy + środki) + SM-2 + streak

**Po 4 dniach:** zostaje ~9 dni na samą naukę z używaniem tych narzędzi. To jest realny plan.

Alternatywa minimal (2 dni, 3-4h):
- Tylko Egzaminator HUD (Tier 1A)
- Reszta z pamięci + vault + chat

---

## 5. Zalety (chat-first z artifactami)

- **Sonnet/Opus = maksymalna jakość** oceny, tłumaczenia, mnemoniki (nie downgradujemy do Haiku)
- **Artifact = trwała wizualizacja** tego, co chat robi — uczeń widzi postęp, nie tylko "czuje"
- **Symulacja egzaminu zyskuje realizm** — timer, scenografia, punkty w realnym czasie
- **Rozprawka ma strukturę** — scaffold zmusza do PEEL, chat ocenia precyzyjnie
- **Dryl solo = oszczędność tokenów** — mechaniczna powtórka nie obciąża konta
- **Persystencja między sesjami** — artifact pamięta, że fiszka X jest słaba, chat może się do tego odwołać
- **Motywacja** — streak, punkty, countdown działają

---

## 6. Wady i pułapki

- **Złożoność:** chat musi pamiętać, żeby aktualizować artifact. Jeśli zapomni — artifact jest nieaktualny
- **Koszt budowy:** 4-10h pracy = czas odjęty od nauki (ale 13 dni to jeszcze da się zmieścić)
- **Haiku w `window.cowork.sample()`:** NIE używać do zadań wymagających analizy literackiej. Tylko szybkie lookupy definicji
- **Utrata Obsidian nie jest problemem** bo Obsidian nie był kluczowy — odpada główna wada z poprzedniej wersji planu
- **Ryzyko over-engineeringu:** pokusa dodawania funkcji zamiast uczenia się. Pilnuj scope'u
- **Pojedynczy plik HTML ma limity** ~1-2 MB praktycznie — dla Fiszek to starczy, dla całego vault nie

---

## 7. Rekomendacje (ranking)

1. **Zbuduj Egzaminator HUD jako pierwszy.** To jedyny artifact, który **znacząco zmienia jakość** symulacji — symulacja bez timera i punktacji jest znacznie słabsza niż z nimi.
2. **Rozprawka Scaffolder drugi.** Matura pisemna = 35 pkt, struktura = 18 pkt z tego. Scaffold eliminuje klasę błędów.
3. **Fiszki Drill trzeci.** Wartość z gamifikacji, ale Claude z `AskUserQuestion` częściowo to zastępuje.
4. **Session Dashboard opcjonalnie.** Miły-do-posiadania, nie krytyczny.
5. **Nie buduj Quick Quiz.** `AskUserQuestion` w Cowork już robi to natywnie.
6. **Zachowaj CLAUDE.md jako źródło prawdy dla zachowania chatu.** Artifacty są wizualizacją, reguły uczenia zostają w instrukcji agenta.
7. **Każdy artifact niech ma guzik "wyślij do Claude"** z pre-fillem — to zamyka pętlę: artifact widzi problem → deleguje do Sonnet.

---

## 8. Ocena sumaryczna

- **Confidence:** 88% (wzrost z 85% po rewizji celu)
- **Werdykt zrewidowany:** artifacty **mocno wspierają** naukę chat-first. Egzaminator HUD to **game-changer** dla symulacji ustnej.
- **Minimalny ROI:** 1 artifact (Egzaminator HUD, 4-5h) → znacząco lepsze symulacje
- **Optymalny ROI:** 3 artifacty (+ Rozprawka Scaffolder + Fiszki Drill, ~10h łącznie) → pełen system
- **Ryzyko:** budowa >10h = zaczyna zjadać czas nauki. Trzymaj się scope'u.

---

## 9. Pierwszy krok

Jeśli akceptujesz plan — następny ruch to prototyp Egzaminator HUD:
- UI: scenografia + karta pytania + 2 timery + licznik punktów 0/30
- Integracja: chat wysyła `update_artifact` z nowym stanem co turę
- Test: sesja 20 min symulacji ustnej z pytaniem jawnym CKE

Powiedz "buduj Egzaminator HUD" i zaczynam.

---

## 10. 🔍 Analiza luk i edge cases — co może zepsuć skuteczność nauki

### 10.1 Luki krytyczne (fix PRZED budową)

#### L1 — Brak system prompta w `window.claude.complete()`
- **Problem:** API przyjmuje pojedynczy string, Sonnet w artifactcie NIE zna CLAUDE.md, nie wie że jest korepetytorem matury. Bez prefixu odpowiada generycznie, bez haków pamięciowych, bez stylu CKE.
- **Skutek:** jakość oceny rozprawki może spaść z poziomu chatu (Sonnet z CLAUDE.md) do "asystent ogólny".
- **Fix:** każdy prompt w artifactcie poprzedzaj **skompresowanym system-promptem** (300-500 tokenów) z rolą + kryteriami CKE + wymaganym formatem odpowiedzi. Trzymaj w `PROMPTS` stałej w JS.
- **Koszt:** ~500 tokenów × 50 wywołań/sesja = 25k tokenów overhead. Na Pro nie boli.

#### L2 — Rate limit Pro = 45 msg / 5h może wybuchnąć w środku Egzaminatora
- **Problem:** symulacja ustna + ocena rozprawki + fiszki = łatwo przekroczyć 45 msg/5h, zwłaszcza 4-5 dni przed maturą gdy user cisnie.
- **Skutek:** artifact zawiesza się w środku symulacji, rujnuje flow i motywację.
- **Fix:** 
  - Artifact pokazuje licznik wywołań ("12/45 w tej sesji")
  - "Budżet mode" — batch'owanie: zamiast 3 wywołań (pytanie, odpowiedź, feedback) rób 1 multi-part call
  - Fallback: przy 429 pokaż "weź 15 min przerwy, pij wodę" + save state
- **Uwaga:** exact limit może być inny — zweryfikuj empirycznie pierwszego dnia

#### L3 — State desync między chatem claude.ai a artifactem
- **Problem:** user uczy się 30 min w chacie z pełnym Sonnet, potem otwiera artifact-egzaminator. Artifact nie wie, że "Dziady III" właśnie omówiliście. Traci kontekst.
- **Skutek:** powtarzanie materiału, brak adaptacji, user się nudzi.
- **Fix:** 
  - Guzik "Import sesji z czatu" w artifactcie — wklej podsumowanie ostatniej sesji, artifact zaktualizuje state
  - Guzik "Export do czatu" — artifact generuje raport ("dzisiaj ćwiczyliśmy X, słabe: Y, do powtórki: Z") → user wkleja w chat
  - Format raportu ustrukturyzowany (JSON w markdown code block) — chat i artifact go parsują

#### L4 — Sonnet w artifactcie może się **mylić** przy ocenie rozprawki
- **Problem:** Sonnet nie jest egzaminatorem CKE. Może przyznać 32/35 za tekst, który CKE da 24/35.
- **Skutek:** user myśli że umie, dostaje 24 na maturze.
- **Fix:** 
  - Hardcode'uj **oryginalny tekst kryteriów CKE 2023** w prompcie (nie parafrazę)
  - Wymuś w prompcie: "bądź **surowszy niż średni egzaminator**, nie 'życzliwy'"
  - Osobny przycisk "druga opinia" — ponowne wywołanie z prefixem "poprzednia ocena mogła być za łagodna, przeanalizuj ponownie krytycznie"
  - Okresowo (co 3 rozprawki) proś chat główny o **meta-ocenę** oceny z artifactu

#### L5 — Brak streamingu w `window.claude.complete()`
- **Problem:** user czeka 15-30 sekund w ciszy na odpowiedź Sonnet. UX psuje.
- **Fix:** 
  - Widoczny loader + wskaźnik "Sonnet analizuje..." z animacją
  - Równolegle pokazuj "tip dnia" / "cytat do zapamiętania" żeby czas nie był stracony
  - Pre-fetch: następne pytanie fiszki ładuj w tle podczas gdy user odpowiada na bieżące

### 10.2 Edge cases Egzaminatora

#### E1 — Timer 15 min przygotowania, a telefon dzwoni
- Fix: guzik pauzy (freeze state), ale tylko 2x na sesję, żeby nie było nadużyć

#### E2 — User zamyka kartę w środku symulacji
- Fix: `window.storage` zapisuje stan co 10 sekund, na restart pyta "wróć do symulacji / nowa"

#### E3 — User 3x z rzędu dostaje ten sam typ pytania
- **Problem:** losowanie bez memory = klustering
- **Fix:** ważone losowanie (antiduplicate + priority do słabych obszarów z `profil-ucznia` w storage)

#### E4 — 3 osobowości komisji (życzliwy/sceptyczny/ciekawski)
- **Fix:** każdy egzaminator = osobny prompt-suffix: `[życzliwy]: "mów spokojnie, nie pospieszam"`, `[sceptyczny]: "naprawdę? Uzasadnij"`, `[ciekawski]: "a co z innym kontekstem?"`
- Rotuj między egzaminatorami, zmienny nacisk

#### E5 — User odpowiada krótko / w ogóle nic
- **Problem:** Sonnet zareaguje empatycznie, nie dociśnie
- **Fix:** prefix promptu: "jeśli odpowiedź <30 słów, zadaj **jedno pytanie pogłębiające** zamiast oceniać"

#### E6 — Symulacja pisemna: matura = 180 min pisania ręcznie
- **Problem:** artifact = klawiatura. Motor memory nie budowana.
- **Fix:** raz w tygodniu zaleć **pisanie ręczne** i zdjęcie → upload do chatu do oceny. Artifact NIE symuluje tego aspektu

#### E7 — Brak symulacji stresu egzaminacyjnego
- **Problem:** artifact za przyjazny
- **Fix:** **tryb Hard** — timer widoczny w czerwieni od 5 min przed końcem, sceneria "komisja spogląda na zegar", żadnych podpowiedzi

#### E8 — Matura 2026 = aneks CKE publikowany ~2 tyg. przed
- **Problem:** zmiany w regulaminie, skróconej liście lektur, punktacji
- **Fix:** guzik "sprawdź aneks CKE" → link do cke.gov.pl + pole do wklejenia aktualnych zmian → artifact doda do prompta

### 10.3 Edge cases Rozprawki Scaffoldera

#### R1 — User pisze 2h, crash browsera
- Fix: **autosave co 30s** do `window.storage`, warning przy zamykaniu karty z niezapisaną zmianą

#### R2 — Liczenie słów: słowo = token? interpunkcja? skrócenia?
- Fix: użyj **tej samej definicji co CKE** — split na whitespace, skróty "np.", "tzn." = jedno słowo, cytaty liczone

#### R3 — User pisze 450 słów gdzie temat wymaga 300-400
- **Problem:** za dużo = rozwadnianie argumentu, CKE ocenia negatywnie "kompozycję"
- **Fix:** licznik z 3 kolorami: <300 czerwony, 300-400 zielony, >400 żółty + hint "rozważ skrócenie akapitu 3"

#### R4 — Kopiowanie cytatów z błędem interpunkcyjnym
- **Problem:** user przepisuje "szkiełko i oko" bez przecinków, CKE punktuje za dokładność
- **Fix:** przycisk "zweryfikuj cytat" → Sonnet porównuje z oryginałem (jeśli ma w promptcie)
- **Limit:** Sonnet nie zna wszystkich cytatów dokładnie → hardcode'uj **30 najczęstszych cytatów Pareto** w artifactcie

#### R5 — Temat wymaga lektury której user nie umie
- Fix: zanim pozwoli pisać, check "jakie 3 lektury wybierasz" → sprawdź z listą "opanowanych" w storage → jeśli ryzyko, ostrzeż

#### R6 — Porównanie 2 wersji rozprawki (wczorajsza vs dziś)
- Fix: history w `window.storage`, diff view side-by-side, trend kryteriów CKE w czasie

### 10.4 Edge cases Fiszek Drill

#### F1 — Interleaving vs blocking
- **Research:** badania pokazują **interleaving** (mieszanie tematów w sesji) > blocking dla dyskryminacji. Ale dla początkowego uczenia — blocking lepszy.
- **Fix:** tryb **"nauka"** (blocking — wszystkie fiszki z jednej epoki) vs **"egzamin"** (interleaving — losowo mieszane)

#### F2 — Lucky guess / cheat guess
- **Problem:** user zgadnie, kliknie ✅, spaced repetition myśli że umie
- **Fix:** trzyznacznikowa ocena: ✅ "pewny", ⚠️ "zgadłem", ❌ "nie wiem" — tylko ✅ awansuje, ⚠️ zostaje, ❌ reset

#### F3 — Marathon 100 fiszek w 1 dzień → klaster za 3 dni
- **Problem:** za 3 dni ma 100 fiszek do powtórzenia, niemożliwe
- **Fix:** algorytm rozkłada powtórki w oknie ±2 dni (jitter), limit dziennych powtórek (max 40)

#### F4 — Dodawanie nowych fiszek podczas gdy stare nie opanowane
- **Fix:** blokada dodawania nowych jeśli >50 zaległych; priorytet na zaległe

#### F5 — Clock drift / timezone (user podróżuje, zmiana czasu)
- Fix: używaj `Date.now()` (UTC), nie dni kalendarzowych. Interwały w godzinach.

#### F6 — "Streak" break po 14 dniach → user się zniechęca i odpuszcza
- **Problem:** efekt psychologiczny known — zerwany streak demotywuje
- **Fix:** **"streak freeze"** — 1 freeze / 7 dni automatycznie. Komunikat "zamarziłeś streak" zamiast "streak zerwany"

### 10.5 Luki w Learning Science

#### S1 — Brak generowania (tylko recognition)
- **Problem:** fiszki ABCD uczą rozpoznawania, nie produkcji. Matura = produkcja (pisanie rozprawki, mówienie).
- **Fix:** **mix fiszek**: 30% pytania otwarte (user pisze 2-3 zdania → Sonnet ocenia), 70% ABCD

#### S2 — Brak elaboracji
- **Problem:** fiszka "Kto napisał Lalkę?" → "Prus" — płytkie
- **Fix:** po poprawnej odpowiedzi: **follow-up** "wyjaśnij jak Lalka reprezentuje pozytywizm w 2 zdaniach" → Sonnet ocenia głębię

#### S3 — Feynman technique nieużywany
- **Problem:** najlepsze uczenie = wyjaśnianie innym
- **Fix:** tryb **"wytłumacz dziadkowi"** — user wyjaśnia pojęcie prostym językiem, Sonnet gra rolę dziadka: zadaje naiwne pytania

#### S4 — Brak testing effect w pełnej formie
- **Problem:** testing > re-reading, ale user nie wie kiedy się testować
- **Fix:** **"mini-test"** co 45 min pracy (alarm w artifactcie) — 3 pytania na zimno z ostatnich 2h

#### S5 — Brak desirable difficulty adjustment
- **Problem:** zbyt łatwo = nie uczy, zbyt trudno = frustruje
- **Fix:** adaptive difficulty — jeśli 3 fiszki pod rząd ✅ → podnieś poziom (przeskakuj łatwe); 3 ❌ → obniż

### 10.6 Luki w integracji z CLAUDE.md / agentami vault

#### I1 — Agent-Egzaminator (w chacie) i Egzaminator-artifact to DWIE różne implementacje tej samej idei
- **Problem:** user ma dwa źródła prawdy
- **Fix:** 
  - Agent-Egzaminator = pełna symulacja W CZACIE (dla głębokich sesji)
  - Egzaminator-artifact = SZYBKA SYMULACJA (15 min, drill)
  - Obie używają tego samego banku pytań (export JSON z vault)

#### I2 — CLAUDE.md nie wie o artifactach
- **Fix:** dodaj sekcję w CLAUDE.md: "jeśli uczeń chce drill/timer → skieruj do artifactu X"

#### I3 — Historia w vault vs w artifactcie
- **Problem:** dwa źródła historii, niespójne
- **Fix:** **artifact = źródło prawdy dla drillu**, vault = źródło prawdy dla głębokich sesji. Eksport artifact → vault raz dziennie (manualnie lub przez chat)

### 10.7 Edge cases psychologiczne

#### P1 — "Poznany efekt Dunning-Kruger" w 6. dniu
- **Problem:** po 6 dniach user czuje że "ogarnia" materiał, przestaje ćwiczyć. Po maturze zdziwiony.
- **Fix:** **Confidence-calibration check** — przed fiszką user zgaduje "umiem: 0-100%", potem widzi rzeczywisty wynik. Dashboard pokazuje kalibrację (ideał = na diagonali)

#### P2 — Zmęczenie po 90 min
- **Fix:** **forced break** po 90 min sesji — artifact blokuje się na 10 min, pokazuje "idź się napij, wróć świeży"

#### P3 — "Jutro zaczynam poważnie"
- **Fix:** **commitment button** na starcie dnia — wybierasz 3 obszary, artifact przypomina wieczorem "zrobiłeś?"

#### P4 — Lęk egzaminacyjny narastający z dnia na dzień
- **Fix:** **dzień -2 = mini-relax** — artifact przechodzi w tryb "lekki" (krótkie sesje, pozytywny feedback only, bez nowego materiału)

---

## 11. 🎯 Top 10 rekomendacji (po analizie luk)

1. **Hardcode'uj oryginalny tekst kryteriów CKE** w promptach do oceny rozprawki (L4) — najważniejsza jakość oceny
2. **Każdy `window.claude.complete()` prefixuj system-promptem roli** (L1) — bez tego Sonnet odpowiada generycznie
3. **`window.storage` + autosave co 30s** (R1, E2) — utrata 2h pracy = katastrofa motywacyjna
4. **Trzyznacznikowa ocena fiszki** (F2) — ✅/⚠️/❌ zamiast binarnej. Kluczowe dla uczciwości SR
5. **Rate limit monitor** (L2) — wyświetlaj licznik wywołań + "budżet mode"
6. **Tryb nauka (blocking) vs egzamin (interleaving)** (F1) — dwa tryby Fiszek dla różnych faz
7. **Confidence calibration** (P1) — przed każdą fiszką zgaduj pewność. Uczy metapoznania
8. **Mix recognition + production** (S1) — 70% ABCD, 30% otwarte z oceną Sonnet
9. **Export/Import JSON między chatem i artifactem** (L3) — state musi migrować, inaczej duplikacja pracy
10. **Tryb Hard dla Egzaminatora** (E7) — bez tej opcji user nie buduje odporności na stres

---

## 12. 🗓 Zrewidowany plan implementacji (z obsługą edge cases)

### Sprint 1 — Rozprawka Scaffolder v1 (4-5h)
- Scaffold 5 akapitów + liczniki słów (R3)
- Autosave co 30s (R1)
- Oryginalne kryteria CKE w promptcie (L4)
- Guzik "oceń surowo" (L4)
- Export na czysto (do kopiowania ręcznie)
- **Pomiń na v1:** weryfikacja cytatów (R4), diff historyczny (R6) — w v2

### Sprint 2 — Fiszki Drill v1 (4-5h)
- ~60 fiszek embedded (Pareto motywy+epoki+środki)
- SM-2 z 3-znacznikową oceną (F2)
- Jitter i limit dzienny (F3, F4)
- Streak freeze (F6)
- Tryb nauka vs egzamin (F1)
- Confidence calibration (P1)
- Follow-up otwarte 30% fiszek (S1)
- Rate limit monitor (L2)

### Sprint 3 — Egzaminator HUD v1 (5-6h)
- Scenografia + timer + karta pytań
- 3 osobowości komisji (E4)
- Tryb Hard (E7)
- Pauza 2×/sesja (E1)
- Autosave + restore (E2)
- Ważone losowanie anti-duplicate (E3)
- Stałe wywołania Sonnet z system-promptem (L1)

### Sprint 4 — Integracja (2h)
- Export JSON artifact → chat (L3)
- Import JSON chat → artifact (L3)
- Aktualizacja CLAUDE.md o istnieniu artifactów (I2)

**Łącznie:** ~15-18h. 4 dni intensywnie lub 6 dni luźniej.

**ROI:** ~70% wartości z pierwszych 2 sprintów (Scaffolder + Fiszki). Egzaminator HUD = opcja jeśli zostanie czas.

---

## 13. ⚠️ Twarde ograniczenia — tego artifact NIE zrobi

- **Nie zastąpi pełnej sesji z Sonnet w czacie** — głęboka analiza wiersza, odcinkowa dyskusja o Kordianie vs Dziadach, rozgrywka egzaminatora wcielającego się w 3 role przez 30 min → zostaje w czacie
- **Nie symuluje pisania ręcznego** (E6) — matura jest ręczna, motor memory trzeba budować offline
- **Nie symuluje prawdziwej presji komisji** — artifact to text, egzamin to 3 ludzi patrzących na ciebie. Fix: jak najwięcej ćwiczenia głośno na sucho
- **Nie wie o zmianach CKE w aneksie** (E8) — aktualizuj manualnie po 2026-04-20
- **Nie zastępuje spania** — efekt konsolidacji pamięci w śnie > każdy algorytm SR

---

## 14. ✅ Pewność i ryzyka

- **Confidence w planie:** 90% (wzrost po uwzględnieniu Pro + analizy luk)
- **Confidence w `window.claude.complete()`:** 85% — potwierdzone w dokumentacji i artykułach, ale dokładna składnia może się różnić; prototyp zweryfikuje
- **Confidence w rate limitach Pro (45/5h):** 70% — szacunek, weryfikuj empirycznie
- **Największe ryzyko:** over-engineering. 18h budowy = -18h nauki. Trzymaj się MVP.
- **Druga pułapka:** zbytnie poleganie na artifactach = spadek jakości głębokich sesji z Sonnet w czacie. Artifact to drill, nie główne danie.

---

## 15. Następny konkretny krok

Jeśli plan OK — powiedz **"buduj Sprint 1"** i zaczynam od Rozprawki Scaffoldera (najwyższe ROI z Pareto: 35 pkt matury pisemnej, 18 pkt za strukturę którą ten artifact buduje).

Alternatywnie **"buduj Sprint 2"** jeśli wolisz zacząć od Fiszek (szybszy feedback, niższy próg wejścia).

Alternatywnie **"prototyp Egzaminator HUD"** jeśli priorytetem jest ustny (który jest wcześniej — zweryfikuj datę ustnego w CKE 2026).

---

## 15b. 🔴 DRUGI PRZEBIEG — Red team + pogłębiona pedagogika

> Nowe kąty nie uwzględnione w sekcji 10-14. Zakładam Claude Pro aktywne.

### 15b.1 💰 Ekonomika rate limit Pro — policzmy to

Pro = **~45 wiadomości / 5h** (rolling window), weryfikacja empiryczna wymagana.

Typowa sesja uczenia się generuje:
- **Rozprawka pełna ocena:** 1 wywołanie (multi-criteria w 1 calle) = 1 slot
- **Rozprawka per-akapit feedback:** 5 wywołań = 5 slotów
- **Fiszka z follow-up otwartym:** 1 wywołanie ocena = 1 slot (tylko 30% fiszek)
- **Symulacja ustna 20 min:** ~6-8 wywołań (pytanie, rozmowa pogłębiająca, ocena) = 6-8 slotów
- **Chat-based deep session (Sonnet w czacie):** 10-20 slotów w zależności od długości

**Budżet 13 dni przed maturą:**
- Dzienny: ~2×45 slotów = 90 (2 okna 5h)
- 13 dni × 90 = **1170 slotów**
- Rozsądny split: 40% chat (468) + 40% artifact (468) + 20% bufor (234)

**Ryzyko:** dzień -2, user cisnie 4h symulacji → wyczerpuje dzienny limit w 2h, musi czekać 3h → przerwane tempo.

**Fix — konkret:**
- **Artifact pokazuje budget meter** (cookie counter z 5h windowem) — regeneracja co 5h
- **"Efficient mode"** — łączy N wywołań w 1 (np. 5 fiszek → 1 batch prompt "oceń 5 odpowiedzi poniżej", parsujesz strukturalnie JSON-em)
- **Pre-flight check** — przed symulacją oszacuj zużycie: "zostało 12 slotów, symulacja potrzebuje 8, OK?"
- **Cap per feature** — Rozprawka max 3 pełne oceny/dzień, Fiszki max 40 Sonnet-calls/dzień

### 15b.2 🔐 Prywatność — co zostaje na serwerach Anthropic?

- **`window.storage` = client-side only** (localStorage w praktyce) — twoje fiszki, essays, historia NIE są na serwerach Anthropic
- **`window.claude.complete()` = wysyła prompt do Anthropic** — essay, który oceniasz, przechodzi przez servery, jest logowany per privacy policy
- **Training opt-out:** sprawdź w Settings → Privacy → Data controls że twoje konwersacje **nie trenują modeli**. Anthropic domyślnie NIE trenuje na Claude.ai (w 2026), ale to weryfikuj
- **Osobiste esseje:** jeśli piszesz tematy o osobistych doświadczeniach, traktuj jako "nie-prywatne"
- **Fix:** dodaj flagę w UI "tekst wrażliwy — nie wysyłaj do oceny" → user sam redaguje przed wysyłką

### 15b.3 🧠 Taksonomia błędów — różne ścieżki naprawy

**Obecny plan:** błąd → reset do dnia 1 spaced repetition. **To jest uproszczenie.**

Typy błędów i ich prawdziwe ścieżki:

| Typ błędu | Przykład | Właściwa naprawa |
|---|---|---|
| **Knowledge gap** | "Kto napisał Kordiana?" — "Nie wiem" | Reset SR + re-expose, pełne tłumaczenie |
| **Misconception** | "Słowacki napisał Dziady" | Tablica kontrastowa (SK vs MD), hak mnemoniczny, ponowne sprawdzenie za 1d |
| **Careless error** | "Mickiewicz" → literówka "Mikiewicz" | Bez resetu SR, tylko ostrzeżenie |
| **Language confusion** | Miesza "metonimia" z "synekdochą" | Tablica porównawcza + 3 przykłady kontrastujące |
| **Retrieval failure (tip-of-tongue)** | "Wiem że to coś z B..." | Cued recall zamiast free recall, podpowiedź pierwszej litery |
| **Partial knowledge** | Wie autora, nie pamięta roku | Micro-fiszka tylko na brakującą część |

**Fix w artifactcie:**
- Po błędzie fiszki: dropdown "co poszło?" → {nie wiem, pomyliłem, literówka, prawie wiedziałem, znam ale nie mogłem przywołać}
- Różne ścieżki recovery per typ
- Metadata "typ błędu" zapisywana w storage dla profilu ucznia

### 15b.4 🌙 Pre-sleep review + tryb wieczorny

**Research (Dang 2010, Stickgold):** materiał powtórzony **15-30 min przed snem** konsoliduje się silniej niż materiał powtórzony w ciągu dnia.

**Aktualny plan:** brak

**Fix:**
- **Tryb wieczorny** w artifactcie (aktywny po 21:00)
- Specjalny zestaw: **5-7 najważniejszych faktów dnia** (chat/artifact oznacza "worth consolidating")
- Brak nowego materiału, brak stresu, spokojny ton
- Cicha kolorystyka (ciepłe tony, brak czerwieni)
- Po sesji: "dobranoc, mózg właśnie zabiera się do roboty"

### 15b.5 📊 Drabina ekspozycji na stres egzaminacyjny

**Problem:** user idzie na maturę psychicznie "cold" bo ćwiczy w komforcie domu. Stres = 20-30% spadek performance.

**Fix — gradacja w czasie:**

| Dni do matury | Poziom stresu | Cechy |
|---|---|---|
| 13-10 | Low | Brak timera, komfortowy feedback, humor |
| 9-6 | Medium | Soft timer, bardziej rzeczowy feedback, symulacja 1×/tydz |
| 5-3 | High | Strict timer, ton surowy, pełna symulacja 1×/dzień |
| 2-1 | Peak | Pełna symulacja w warunkach identycznych (cisza, czas, presja), 2×/dzień |
| 0 | OFF | Artifact wyłączony. Spanie, spokój, jedzenie. |

**Artifact sam wykrywa fazę** (countdown do 2026-05-05) i automatycznie zmienia tryb.

### 15b.6 🧩 Teoria obciążenia poznawczego (Sweller)

**Trzy rodzaje obciążenia:**
- **Zewnętrzne** (bad) — niepotrzebne elementy UI, zbędne animacje, skomplikowane instrukcje
- **Istotne** (good) — głębokie przetwarzanie materiału — TU zachodzi uczenie
- **Wewnętrzne** — inherent difficulty tematu

**Red team obecnego planu:**
- Egzaminator HUD z 3 osobowościami komisji + scenografia + timer + licznik punktów + karta pytań = **za dużo naraz** na ekranie
- Cognitive load się wyczerpuje na UI → mniej na materiał

**Fix:**
- **Minimalny UI mode** podczas wypowiedzi (ukryj wszystko poza pytaniem i timerem)
- Powroty do rozszerzonego UI tylko podczas feedbacku
- **Zasada 7±2** elementów na ekranie (Miller)
- **Progressive disclosure** — szczegóły na klik, nie wszystko naraz

### 15b.7 🧲 Habit design — Fogg B=MAP

Formula: **Zachowanie = Motywacja × Ability × Prompt**

**Obecny plan luka:** silna Motywacja (matura) + wysokie Ability (vault, Pro) + **słaby Prompt**. User musi sam pamiętać żeby otworzyć.

**Fix:**
- **Scheduled task** (Cowork skill: `schedule`) — codzienny prompt o 18:00: "otwórz artifact, 5 min fiszek"
- **Minimum viable session** — 5-min tryb "one-tap" → user klika, dostaje 3 fiszki, zamknięte. Nawyk budowany na niskim progu
- **Tiny habit**: "po porannej kawie → 3 fiszki". Wiążesz z istniejącym nawykiem
- **Nagroda natychmiastowa** (nie odłożona) — po 5 min sesji widoczne: "masz 5 dni z rzędu, keep it"

### 15b.8 🎯 Deliberate practice — 4 kryteria Ericssona

Dobra praktyka = (1) specyficzny cel, (2) natychmiastowy feedback, (3) repetycja, (4) strefa rozszerzona.

**Audyt:**
| Artifact | Cel | Feedback | Repetycja | Stretch |
|---|---|---|---|---|
| Rozprawka Scaffolder | ✅ | ✅ (Sonnet) | ⚠️ (każda nowa rozprawka) | ⚠️ (brak narastającej trudności) |
| Fiszki Drill | ✅ | ✅ | ✅ | ❌ brak adaptacji |
| Egzaminator HUD | ✅ | ✅ | ⚠️ | ❌ brak progresji trudności |

**Fix:**
- **Adaptive difficulty** — po 3 ✅ z rzędu, Egzaminator losuje pytanie z kategorii "hard" (pytania kombinowane, niejawne, metaforyczne). Po 3 ❌ — "easy"
- **Rozprawka stretch mode** — temat o narastającym poziomie abstrakcji: tydz 1 konkretny motyw, tydz 2 porównanie epok, tydz 3 temat z twistem CKE
- **Deliberate targeting** — artifact wie które 3 lektury user NIE umie → 70% pytań z tego poola

### 15b.9 🔴 Red team — jak user GRA-PLAYUJE system?

Możliwe exploity:

| Exploit | Symptom | Mitigacja |
|---|---|---|
| **Klika ✅ szybko** | 100 fiszek/10 min, 100% ✅, ale nie umie na prawdziwym teście | **Random spot-check** — co 20 fiszek Sonnet zadaje pytanie z ostatniej odpowiedzi bez warningu |
| **Copy-paste cheatsheet** do rozprawki | 35/35 za rozprawkę napisaną "z książki" | **Styl-check** przez Sonnet: "czy tekst brzmi jak napisany przez maturzystę?" |
| **Poleganie na Sonnet** zamiast myślenia | User prosi o gotową tezę, kopiuje | Odmowa: "nie piszę tezy za ciebie, naprowadzam" (już w CLAUDE.md) + detekcja patternu |
| **Marathon bez rest** | 6h fiszek w dniu -3 | **Forced break** po 90 min, blokada na 15 min |
| **Pomija trudne obszary** | Zawsze wybiera "łatwe" fiszki | Brak trybu "wybieram" — artifact losuje |
| **Placebo learning** — subjective "umiem" vs actual | Confidence 90%, accuracy 40% | **Calibration dashboard** — pokazuj rozbieżność |

### 15b.10 🚨 Scenariusze katastroficzne

| Scenariusz | Prawdopodobieństwo | Impakt | Plan B |
|---|---|---|---|
| Artifact crashuje dzień -1 | 10% | wysoki | Backup: drukowane fiszki Pareto, vault .md readable |
| Pro rate limit exhausted dzień -2 w środku symulacji | 25% | średni | Fallback: vault + chat session w oknie wolnym |
| Sonnet model change mid-prep (4.6 → 4.7) | 30% | niski-średni | Lock na konkretną wersję jeśli API pozwala; rekalibracja ocen |
| User traci motywację po 6 dniu | 40% | wysoki | Meeting z parent/tutor zaplanowane na dzień 7; accountability |
| CKE aneks zmienia listę lektur (2 tyg. przed) | 5% | ekstremalny | Subskrypcja maili CKE, codzienny check na cke.gov.pl |
| User choruje dzień -3 do -1 | 15% | wysoki | Plan pivotu: core 11 lektur P1 only, odpuść P2 |

### 15b.11 🎭 Transfer-appropriate processing (Morris 1977)

**Prawda niewygodna:** uczysz się w warunkach A (dom, klawiatura, cisza) → testują cię w warunkach B (szkoła, ręka, presja). **Pamięć jest warunkowa.**

**Co już obsłużyłem w 10.2 E6:** raz/tydzień pisanie ręczne. **Dodaj:**
- **Practice in exam clothes** — raz przetestuj w koszuli, nie w piżamie. Ubiór = kontekstowy anchor
- **Practice w hałasie** — symuluj szkolny korytarz (YouTube classroom noise). Odporność na rozproszenie
- **Morning practice** — matura = 9:00. Jeśli ćwiczysz wieczorem, motor memory nie przenosi. Raz w tyg. sesja 9:00

### 15b.12 🏁 Wyjście z artifactu — kiedy przestać

**Zasada:** artifact to środek, nie cel.

**Dzień -1 do -0:**
- Artifact **wyłączony** (lub "spokojny mode": tylko przegląd notatek, żadnego testowania)
- User śpi 8h, je śniadanie, idzie na egzamin
- **Nie ucz się w autobusie** — efekt "cramming last minute" > szkodzi

**Sygnały że już dość:**
- 3 dni z rzędu plateau (accuracy nie rośnie) → zmień strategię, nie ilość
- Confidence rośnie, accuracy spada → artifact daje fałszywe poczucie kompetencji → pauza + real check z chat
- User zirytowany przy każdej sesji → przerwa 1 dzień

### 15b.13 🎲 Social proof / accountability

**Luka:** user uczy się sam. Słaba egzekucja.

**Fix:**
- Artifact ma przycisk **"Report weekly"** → generuje PDF/MD z postępem
- User wysyła do rodzica/korepetytora/przyjaciela
- Sam akt zewnętrznego raportowania podnosi compliance o ~20% (badania implementation intentions)
- **Commitment device** — "obiecuję X przed [osoba]" wyświetlana na dashboardzie

### 15b.14 🧪 Samotest skuteczności — jak wiem że to działa?

**Problem:** budujesz artifact, używasz go, nie wiesz czy pomaga.

**Metryka główna:** **próbna matura przed + po**.
- **Dzień -13:** pełna 180-min rozprawka + ustny przez vault/chat. Ocena Sonnet. Baseline.
- **Dzień -7:** powtórka tego samego. Wzrost = działa.
- **Dzień -2:** final check. Stable high = gotowy.

Bez tego trzy sprinty = optimization bez wiedzy czy w dobrym kierunku.

---

## 15c. 🎯 Top 5 NOWYCH rekomendacji (z pass 2)

Najwyższy impact z rzeczy nie uwzględnionych wcześniej:

1. **Budget meter + efficient mode** (15b.1) — bez tego rate limit zrujnuje symulację w najważniejszym momencie
2. **Taksonomia błędów z ścieżkami recovery** (15b.3) — obecny plan miesza typy błędów, różne potrzebują różnej naprawy
3. **Drabina ekspozycji na stres** (15b.5) — auto-adaptacja trybu przez countdown. Jeden config, duży efekt
4. **Baseline + midpoint + final test** (15b.14) — jedyny sposób żeby wiedzieć czy artifact realnie pomaga. Bez tego strzelasz w ciemno
5. **Minimum viable session 5-min** (15b.7) — nawyk buduje się na niskim progu. Bez tego user omija dni

---

## 15d. ✅ Zrewidowana pewność planu po pass 2

- **Confidence:** 92% (wzrost z 90%)
- **Największe utrzymujące się ryzyko:** over-engineering. Pierwotny plan był 15-18h, pass 2 dodał koncepcje warte kolejnych 5-8h. **Trzymaj się Sprintów 1-3 i nie dokładaj fajerwerków.**
- **Największy zysk z pass 2:** budget meter (15b.1) i baseline test (15b.14) — oba kosztują <2h implementacji a chronią przed katastrofą

---

## 15e. 🆕 SPRINT 5 — Trener Zadań CKE (część 1 pisemnej, 35 pkt)

> **Status:** PROPOSED (do decyzji user'a)
> **Powód powstania:** audyt po Sprintach 1-4 wykrył że pierwotny plan (15a-15d) skupiał się na rozprawce + ustnym + drillu, ale **pominął część 1 pisemnej** = 35 pkt = 50% matury pisemnej = 35% całej matury z polskiego.
> **Estymowany czas:** 5-6h (Sprint 5A) lub 6h (5A+5B+5C komplet)

### 15e.1 Co to jest część 1 pisemnej

Arkusz maturalny ma dwie części:
- **Część 1 (45-60 min, 35 pkt):** zestaw zadań — czytanie ze zrozumieniem fragmentów (literackich + nieliterackich), gramatyka, słownictwo, frazeologia, redagowanie krótkich form (notatka syntetyzująca, streszczenie ~100 słów)
- **Część 2 (180 min, 35 pkt):** rozprawka 300+ słów (POKRYTE przez Rozprawkę Scaffolder)

Bez treningu Część 1, user może mieć perfekcyjną rozprawkę i ustny, a wpadać na łatwych zadaniach.

### 15e.2 Sprint 5A — Trener Zadań (główny artifact)

**Cel:** Cowork artifact symulujący część 1 arkusza maturalnego.

**Features MVP:**
- Bank ~40-50 zadań w 5 typach:
  - Czytanie ze zrozumieniem fragmentu literackiego (10-15 zadań)
  - Czytanie ze zrozumieniem tekstu nieliterackiego (publicystyka, esej, reportaż) (10-15)
  - Gramatyka (części mowy, składnia) (5-10)
  - Frazeologia + słownictwo (związki frazeologiczne, synonimy) (5-10)
  - Redagowanie notatki syntetyzującej / streszczenia (5)
- Generator dodatkowych zadań przez Haiku (z fragmentu wpisanego przez user'a)
- Tryb sesji 45 min z timerem (jak na maturze)
- Auto-grading: MCQ + krótka odpowiedź (Haiku-grading dla otwartych)
- Statystyki per typ zadania (wykres słabych obszarów)
- Persystencja localStorage

**Architektura:** vanilla JS HTML, light-mode, `window.cowork.sample()`, Chart.js (statystyki).

**Estymowany czas budowy:** 4-5h.

### 15e.3 Sprint 5B — patch Rozprawki: pole fragmentu

**Co:** Matura 2026 najczęściej daje rozprawkę "w oparciu o fragment lektury z arkusza". Obecna Rozprawka Scaffolder nie ma pola na ten fragment.

**Fix:**
- Dodać `<textarea>` "Fragment z arkusza" pod TopicBar
- Włączyć fragment do `buildGradePrompt` (Sonnet/Haiku ocenia czy rozprawka rzeczywiście odnosi się do fragmentu)
- Update obu wersji: `rozprawka-scaffolder-matura` (Cowork) + `rozprawka-scaffolder.jsx` (Claude.ai)

**Estymowany czas:** 30 min (Cowork update_artifact) + 15 min (jsx Edit).

### 15e.4 Sprint 5C — patch Egzaminatora: pełne 76 pytań CKE

**Co:** Egzaminator ma 30 z 76 pytań jawnych CKE 2026-2028.

**Fix:** import pełnej listy z `/01-Analiza-Pytan/Pytania-jawne-ustne-2026.md` (vault).

**Estymowany czas:** 30 min (zmiana danych w PYTANIA_JAWNE).

### 15e.5 Pokrycie matury PRZED i PO Sprincie 5

```
PRZED Sprint 5 (stan obecny):
├── Część 1 zadania (35 pkt)    ❌ 0%   ←── KRYTYCZNA LUKA
├── Część 2 rozprawka (35 pkt)  ✅ 75%  (brak pracy z fragmentem)
└── Ustny (30 pkt)              ✅ 85%  (30 z 76 pytań)
ŁĄCZNIE: ~60% pokrycia matury

PO Sprint 5 (jeśli zbudujesz):
├── Część 1 zadania (35 pkt)    ✅ 80%  (Trener Zadań)
├── Część 2 rozprawka (35 pkt)  ✅ 90%  (z fragmentem)
└── Ustny (30 pkt)              ✅ 95%  (76 pytań)
ŁĄCZNIE: ~88% pokrycia matury
```

### 15e.6 Argumenty ZA i PRZECIW Sprintowi 5

**ZA:**
- Pokrywa 35 pkt = 35% matury (część 1 pisemnej)
- 5-6h budowy = 1 dzień intensywny (z 10 dostępnych)
- Bez tego user może zdać ustny i rozprawkę a wpaść na zadaniach

**PRZECIW:**
- 4 artifacty już to dużo do opanowania
- Część 1 można ćwiczyć offline z arkuszami CKE 2021-2025 (PDF)
- Każda godzina budowy = godzina nie-nauki

**Rekomendacja:** zbuduj **5A (Trener Zadań)** — najwyższe ROI. Pomiń 5B i 5C jeśli braknie czasu, łatwo dorobić później.

**Alternatywa minimalna:** pomiń Sprint 5 całkowicie, w zamian:
- Pobierz 3-5 arkuszy CKE 2021-2025 z cke.gov.pl
- Trenuj część 1 offline (papier + stoper 45 min)
- Sprawdzaj samodzielnie + rozwiązywanie wątpliwych z chatem Sonnet

---

## 15f. 📋 Status Sprintów 1-4 — co zostało dostarczone

### Cowork artifact inventory (aktualny stan)
1. **`rozprawka-scaffolder-matura`** — 5-akapit scaffold + ocena 35-pkt Haiku
2. **`fiszki-matura`** — 63 fiszki, SR, calibration, 3-znacznikowa ocena
3. **`egzaminator-ustny-matura`** — symulacja ustnego, timer 15+10, komisja 3 osobowości
4. **`dashboard-matura-polski`** — countdown, drabina stresu, Chart.js, agreguje fiszki state

### Plus Claude.ai artifact
- **`rozprawka-scaffolder.jsx`** w `/07-Artifacts/Rozprawka-Scaffolder/impl/` — Sonnet quality (lepsze niż Haiku w analizie literackiej)

### Faza C — TDD + dokumentacja
- 60/60 testów logiki GREEN (`tests/harness.js`)
- 8 plików w `/07-Artifacts/Rozprawka-Scaffolder/` (4407 linii)
- Red-Team review + Pedagogy review

### Adresowane wcześniej zidentyfikowane luki (sekcje 10, 15b)
- ✅ Privacy warning (P3) — wszystkie 4 artifacty
- ✅ Anti-plagiat hint (Red Team A2) — w prompcie oceny
- ✅ Prompt injection guard (A3) — w SYSTEM_PROMPT
- ✅ Budget tracking + persistence (L2, B5) — w Rozprawce
- ✅ Banner ręczne pisanie (P6) — Rozprawka + Dashboard
- ✅ Calibration check (P8) — Fiszki przed odsłonięciem
- ✅ Bank tematów (P1) — Egzaminator (30 pytań CKE)
- ✅ Drabina stresu (15b.5) — Dashboard auto-mode
- ✅ Tryb Hard (E7) — Egzaminator difficulty selector
- ✅ 3-znacznikowa ocena (F2) — Fiszki ✓/⚠/✗

### Niezrealizowane luki (z PEDAGOGY_REPORT)
- ❌ P2 progresja między rozprawkami (history)
- ❌ P4 typy błędów + linki do vault
- ❌ P7 self-explanation prompts
- ❌ P9 elaborative interrogation
- ❌ Cross-artifact data flow (błąd w rozprawce → fiszka)

→ Zobacz pełen audyt w [[Podsumowanie-wykonania-Sprintów-1-4]]

---

## 16. Źródła

Research 2026-04-24, WebSearch + dokumentacja MCP:

- Anthropic Support: [What are Artifacts?](https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)
- Anthropic Blog: [Build with artifacts](https://www.claude.com/blog/build-with-artifacts)
- Simon Willison: [Build and share AI-powered apps with Claude](https://simonwillison.net/2025/Jun/25/ai-powered-apps-with-claude/) — źródło składni `window.claude.complete()`
- Albato: [Claude Artifacts 2026 Guide](https://albato.com/blog/publications/how-to-use-claude-artifacts-guide)
- P0stman: [Claude Artifacts limits](https://p0stman.com/articles/claude-artifacts-limits)
- Eigent.ai: [Live artifacts guide](https://eigent.ai/guides/claude-live-artifacts)

**Weryfikacja empiryczna:** dokładny kształt API `window.claude.complete()`, stabilność `window.storage` i rate limit Pro → potwierdź w pierwszej godzinie budowy Sprintu 1.

---

## 🔗 Powiązane

- [[02-Agenci/Agent-Egzaminator]]
- [[02-Agenci/Agent-Korepetytor]]
- [[05-Szablony/wypracowanie-szablon]]
- [[05-Szablony/fiszka-szablon]]
- [[03-Plan-Nauki/Harmonogram-do-matury]]
