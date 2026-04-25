---
name: BRIEF — matura-polski-2026 (retrospektywa)
description: Retroaktywny brief produktu rekonstruowany z istniejącego repo (sprint 1-4 done) na potrzeby SDD audit
type: brief
sprint_status: 4/4 sprints done, sprint 5 proposed
data_audytu: 2026-04-25
audit_method: reverse-engineering z artifactów + vault docs
---

# BRIEF — Matura Polski 2026

## 1. TYP PRODUKTU

System wspomagający przygotowanie do **matury z języka polskiego (poziom podstawowy, formuła 2023)** — pisemna 5 maja 2026 + ustna maj/czerwiec 2026.

Realizacja: 4 interaktywne artifacty HTML/JS + Obsidian vault (~200 plików baza wiedzy) + agenci Claude (Korepetytor/Egzaminator/Plan-Nauki/Analityk-Pytan).

## 2. GRUPA DOCELOWA

- **Persona:** Robert (robert.boguszewski@tick.pl), uczeń klasy maturalnej, 17-18 lat
- **Czas do egzaminu:** 10-13 dni (audit data: 2026-04-25)
- **Level techniczny:** średni (potrafi otworzyć przeglądarkę, wkleić klucz API, używać Obsidian)
- **Skala:** pojedynczy uczeń (single-user), ale repo open-source dla innych maturzystów
- **Język:** polski wyłącznie (UI + treść + AI prompts)

## 3. TOP 3 PAIN POINTY

1. **Brak struktury w pisaniu rozprawki** → ~50% maturzystów traci 10+ pkt na kompozycji i braku PEEL. Standard CKE wymaga 5-akapitowej struktury z limitami słów.
2. **Powtarzanie materiału bez systemu** → bez spaced repetition uczniowie zapominają 70% materiału w ciągu tygodnia. Tradycyjne fiszki papierowe nie dają adaptacji.
3. **Stres ustnego + brak symulacji presji czasu** → 15+10 min pod komisją to pierwszy raz dla większości. Brak treningu = niższy wynik o 20-30%.

## 4. TOP 5 FUNKCJI (PARETO 80/20)

1. **Rozprawka Scaffolder** — 5 akapitów PEEL, live word counter, ocena 35-pkt CKE (Sonnet/Haiku) — pokrywa 35 pkt z 70 pisemnej
2. **Fiszki Drill** — ~63 fiszek w 12 kategoriach (epoki, motywy, środki, daty, cytaty), spaced repetition SM-2 lite — pokrywa powtórki materiału
3. **Egzaminator Ustny** — symulacja z timerem 15+10 min, 30 pytań CKE + komisja AI (3 osobowości), ocena 30 pkt — pokrywa cały ustny
4. **Dashboard** — countdown, drabina stresu (auto-faza low/medium/high/peak), wykresy postępu, plan na dziś — orientacja + motywacja
5. **Vault wiedzy** — 11 epok, 40 lektur, teoria literatury, agenci Claude — głębokie deep-session

**Co NIE jest w MVP:**
- Część 1 pisemnej (zadania CKE, 35 pkt) — krytyczna luka, planowany Sprint 5
- Bank tematów historycznych dla rozprawki
- Cross-artifact data flow (błąd w rozprawce → fiszka)
- Diff historyczny ocen rozprawki w czasie

## 5. STACK + CONSTRAINTS

### Web
- **Frontend-only**, single-file HTML per artifact (vanilla JS, brak React w Cowork ver., React jsx w Claude.ai ver.)
- **CDN:** Chart.js (Cowork whitelist), brak Tailwind w Cowork (vanilla CSS)
- **Storage:** `localStorage` (Cowork sandbox) lub `window.storage` (Claude.ai Pro)
- **Brak backendu** = brak audyt-trail, brak multi-user, brak server-side

### 3 środowiska runtime (każdy artifact musi działać w 3)
1. **Claude.ai artifact** — `window.claude.complete()` (Sonnet, Pro billing)
2. **Cowork artifact** — `window.cowork.sample()` (Haiku, Cowork billing)
3. **GitHub Pages browser** — `fetch api.anthropic.com` z user's API key (any model)

### Constraints prawne
- **Brak treści chronionej** — nie kopiujemy arkuszy CKE, tylko pytania jawne CKE 2026 (publiczne)
- **MIT License** — open source, fork-friendly
- **Brak PII** w storage (tylko notatki ucznia, brak imienia/email)
- **Disclaimer** — "use at your own risk", treść AI nie jest oficjalną interpretacją CKE

## 6. BUDŻET TOKENS + CZAS

- **Budżet implementacyjny (poniesiony):** ~$80 tokens (1 dzień intensywnej sesji)
- **Budżet eksploatacyjny dla ucznia:** ~$5-10 (klucz API Anthropic na 13 dni nauki) lub Pro plan ($20/mies)
- **Czas budowy:** 1 dzień intensywnej pracy z Claude Code/Cowork (rzeczywisty)
- **Estymacja audytu (ten dokument):** $25-50 tokens, 3-4h

## 7. KONWENCJE BRANŻOWE (CKE 2023)

- **Punktacja matury pisemnej:** 70 pkt (35 zadania + 35 rozprawka)
- **Punktacja matury ustnej:** 30 pkt (2 komunikacyjna + 16 monolog + 12 rozmowa)
- **Próg zdawalności:** 30% (~21 pkt z 70 pisemnej, ~9 pkt z 30 ustnej)
- **Min słów rozprawki:** 300 — poniżej = 0 pkt z "Kompetencji literackich" AUTO
- **Pytania jawne ustne:** 76 ogłoszone przez CKE na 2026-2028
- **Lista lektur obowiązkowych:** ~40 (Mickiewicz, Słowacki, Prus, Reymont, ... — pełna w `vault/00-Baza-Wiedzy/Lektury/`)

## 8. MINIMUM VIABLE TEST (Definition of Done)

**Mierzalne kryteria sukcesu setupu (na audit data):**

- [x] User może napisać pełną rozprawkę 350+ słów w Rozprawce Scaffolder i dostać ocenę 35-pkt JSON
- [x] User może powtórzyć ≥30 fiszek dziennie z spaced repetition (SM-2 lite, 1d/3d/7d/14d/30d)
- [x] User może zasymulować ustny: losowanie 1 jawnego CKE + 1 niejawnego AI, timer 15+10 min, ocena 30-pkt
- [x] Dashboard pokazuje countdown + drabinę stresu + agreguje state z fiszek
- [x] Wszystkie 4 artifacty działają w 3 środowiskach (Claude.ai, Cowork, GitHub Pages)
- [x] Repo zdeployowane na GitHub Pages, public access bez instalacji
- [x] PLAYBOOK.md pozwala dowolnemu deweloperowi sklonować workflow dla innej matury

**Co JESZCZE nie jest w DoD:**
- [ ] Pełne pokrycie 76 pytań jawnych CKE w Egzaminatorze (mam 30/76 = 39%)
- [ ] Część 1 pisemnej (Trener Zadań CKE) — Sprint 5
- [ ] Praca z fragmentem-bodźcem w Rozprawce
- [ ] Cross-artifact data flow

## Confidence

- **Audit accuracy:** 90% (pełen dostęp do kodu + dokumentacji w `vault/`)
- **BRIEF reconstruction:** 85% (rekonstrukcja post-fact, niektóre intencje user'a mogą być inferowane)
- **Coverage estimate:** 60% pełnej matury (50% pisemnej × 2 segmenty + 85% ustnej)

---

## Linki referencyjne (vault)

- [Plan-konwersji-artifact](../../vault/03-Plan-Nauki/Plan-konwersji-artifact.md)
- [Podsumowanie-wykonania-Sprintów-1-4](../../vault/03-Plan-Nauki/Podsumowanie-wykonania-Sprintów-1-4.md)
- [CLAUDE.md (rola korepetytora)](../../CLAUDE.md)
- [Struktura-matury-2026](../../vault/00-Baza-Wiedzy/Struktura-matury-2026.md)
- [Pytania-jawne-ustne-2026](../../vault/01-Analiza-Pytan/Pytania-jawne-ustne-2026.md)
