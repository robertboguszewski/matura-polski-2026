---
title: matura-polski-2026 — Architecture (reverse-engineered, frozen v1)
audit_date: 2026-04-25
audit_type: retrospective SDD reverse-engineering
sprint_status: 4/4 done, sprint 5 proposed
spec_freeze: TRUE — schemas locked, any change requires v2 bump
---

# Architecture — Matura Polski 2026 (post-implementation freeze v1)

System wspomagający przygotowanie do matury z j. polskiego (poziom podstawowy, formuła CKE 2023). 4 niezależne artifacty HTML/JS + uniwersalny wrapper inferencji (`shared/claude-api.js`) + czysta logika (`impl/logic.js`, 60/60 testów GREEN). Brak backendu, brak buildu — wszystko vanilla, single-file per artifact, działa w 3 środowiskach: Claude.ai (Sonnet via `window.claude.complete`), Cowork (Haiku via `window.cowork.sample`), GitHub Pages (any model via `fetch api.anthropic.com` z user-supplied API key).

---

## 1.1 JSON Schemas — overview

Wszystkie 4 artifacty mają **niezależne** state'y w localStorage (różne klucze, brak współdzielenia). Dashboard JEST READ-ONLY — agreguje state Fiszek przez `localStorage.getItem("fiszki-matura-v1")`.

### 1.1.1 Rozprawka state (`rozprawka-scaffolder-cowork-v1`)

```json
{
  "schemaVersion": 1,
  "savedAt": 1745522400000,
  "topic": "Czy literatura może zmienić człowieka? Rozważ...",
  "lectures": ["Pan Tadeusz (Mickiewicz)", "Lalka (Prus)", "Dżuma (Camus)"],
  "paragraphs": {
    "intro": "Wstęp z tezą... (40-60 słów)",
    "arg1": "Argument 1 — lektura główna (80-110 słów)",
    "arg2": "Argument 2 — kontekst (60-80 słów)",
    "arg3": "Argument 3 — kontekst (60-80 słów)",
    "conclusion": "Konkluzja innym językiem (40-60 słów)"
  },
  "feedback": {
    "intro": { "text": "...", "timestamp": 1745522400000, "type": "paragraph" },
    "arg1": null, "arg2": null, "arg3": null, "conclusion": null
  },
  "grade": {
    "realizacja_tematu": { "punkty": 4, "uzasadnienie": "..." },
    "elementy_tworcze":   { "punkty": 2, "uzasadnienie": "..." },
    "kompetencje_literackie": { "punkty": 10, "uzasadnienie": "..." },
    "kompozycja": { "punkty": 1, "uzasadnienie": "..." },
    "styl":       { "punkty": 2, "uzasadnienie": "..." },
    "jezyk":      { "punkty": 1, "uzasadnienie": "..." },
    "ortografia": { "punkty": 1, "uzasadnienie": "..." },
    "suma": 21,
    "komentarz_ogolny": "...",
    "trzy_mocne": ["...","...","..."],
    "trzy_slabe": ["...","...","..."],
    "jeden_mnemonik": "...",
    "_corrected": false
  },
  "budget": { "callTimestamps": [1745522400000] },
  "privacyWarningSeen": true
}
```

### 1.1.2 Fiszki state (`fiszki-matura-v1`)

```json
{
  "cards": {
    "ep01": { "lastSeen": 1745522400000, "level": 2, "correct": 3, "total": 5, "dueAt": 1745781600000 }
  },
  "streak": { "lastDay": "Fri Apr 25 2026", "current": 7 },
  "totalAnswered": 142,
  "totalCorrect": 98,
  "privacyWarningSeen": true
}
```

### 1.1.3 Egzaminator state (`egzaminator-ustny-v1`)

Persystowane jest TYLKO `privacyWarningSeen: boolean`. Cała sesja symulacyjna (zestaw, timer, transcript, grade) żyje w pamięci runtime — nie ma resume sesji.

```json
{ "privacyWarningSeen": true }
```

In-memory state shape (nie serializowany):
```json
{
  "phase": "setup|prep|speaking|qna|grading|done",
  "difficulty": "easy|medium|hard",
  "zestaw": { "jawne": { "id": 9, "lektura": "Dziady cz. III", "pytanie": "..." }, "niejawne": "<text gen by Haiku>" },
  "prepStartAt": 1745522400000,  "prepDurationMs": 900000,
  "speechStartAt": null,           "speechDurationMs": 600000,
  "transcript": [ { "who": "user|commission", "body": "...", "examinerStyle": "życzliwy|sceptyczny|ciekawski", "examinerName": "Mgr Anna K." } ],
  "grade": {
    "komunikacyjna": { "punkty": 1, "uzasadnienie": "..." },
    "monolog":       { "punkty": 10, "uzasadnienie": "..." },
    "rozmowa":       { "punkty": 7, "uzasadnienie": "..." },
    "suma": 18, "komentarz": "...", "trzy_mocne": [], "trzy_slabe": [], "hak": "..."
  }
}
```

### 1.1.4 Dashboard state — BRAK persistencji

Dashboard NIE pisze do storage. Tylko READ z `fiszki-matura-v1`. `_chartFiszki` i `_chartTags` żyją w `window.*`. Re-render co 60s (`setInterval(renderAll, 60000)`).

### 1.1.5 Shared keys (claude-api.js)

```json
{
  "matura-anthropic-api-key": "sk-ant-...",
  "matura-model": "claude-sonnet-4-5"
}
```

---

## 1.2 API contracts

### 1.2.1 Inferencja (uniwersalna)

```ts
// Z docs/shared/claude-api.js
window.matura.callClaude(prompt: string): Promise<string>
window.matura.detectMode(): "claude.ai" | "cowork" | "browser"
window.matura.getModeLabel(): string  // "Sonnet (Claude.ai)" | "Haiku (Cowork)" | "claude-sonnet-4-5 (Anthropic API)" | "Brak (wymaga API key)"
window.matura.getApiKey(): string|null
window.matura.setApiKey(key: string): boolean
window.matura.clearApiKey(): void
window.matura.getModel(): string  // default "claude-sonnet-4-5"
window.matura.setModel(m: string): void
window.matura.showApiKeyModal(onSet?: () => void): void

// Errors thrown:
// "MISSING_API_KEY" | "INVALID_API_KEY" | "RATE_LIMIT" | "API_ERROR_<status>: <body>" | "INVALID_RESPONSE_SHAPE"
```

### 1.2.2 Pure logic (impl/logic.js, CommonJS)

```js
wordCount(text: string|null): number  // CKE rules
getCounterColor(count: number, min: number, max: number): "red"|"green"|"yellow"
parseGrade(rawResponse: string): GradeObject  // throws INVALID_GRADE_FORMAT | MISSING_FIELD: <name> | INVALID_FIELD: <name> | RANGE_ERROR: <name>
getBudgetRemaining(budget: {callTimestamps: number[], limit: number, windowMs: number}, now?: number): number
pruneStaleBudget(budget, now?): {callTimestamps, limit, windowMs}  // immutable
migrate(rawStorageData: object|null, currentVersion: number): object|null
composeExport(topic: string, paragraphs: {intro,arg1,arg2,arg3,conclusion}): string
isEligibleForGrading(state): boolean
formatCountdown(targetDate: Date|number, now?: number): string  // "PO MATURZE" | "MATURA DZIŚ" | "X dni" | "X godz." | "X min"
sanitizeForStorage(state): object|null
```

### 1.2.3 Storage keys (per artifact)

| Artifact     | Key (frozen v1)                          | Schema   | Owner   |
|--------------|------------------------------------------|----------|---------|
| Rozprawka    | `rozprawka-scaffolder-cowork-v1`         | full     | RW      |
| Fiszki       | `fiszki-matura-v1`                       | full     | RW      |
| Egzaminator  | `egzaminator-ustny-v1`                   | minimal  | RW      |
| Dashboard    | (none)                                   | —        | RO from fiszki |
| Shared API   | `matura-anthropic-api-key`, `matura-model` | k/v    | RW      |

### 1.2.4 Format eksportu (Rozprawka clipboard)

```
TEMAT: <topic>

<intro>

<arg1>

<arg2>

<arg3>

<conclusion>
```

Puste akapity są pomijane. Trim per akapit. Brak topic → `TEMAT: (brak)`.

---

## 1.3 Design system (extracted from CSS in artifacts)

### 1.3.1 Kolory (HEX + WCAG AA on `#fafaf9` background)

| Rola             | HEX        | WCAG AA contrast vs `#fafaf9` | Użycie |
|------------------|------------|-------------------------------|--------|
| primary          | `#3b82f6`  | 3.7:1 (AA Large only)         | buttons, accents, links |
| primary-hover    | `#2563eb`  | 4.9:1 (AA)                    | btn:hover |
| primary-deep     | `#1d4ed8`  | 7.4:1 (AAA)                   | hero gradient, big numbers |
| primary-deeper   | `#1e40af`  | 9.7:1 (AAA)                   | hero gradient end |
| primary-darkest  | `#1e3a8a`  | 11.7:1 (AAA)                  | banner text |
| text-primary     | `#1c1917`  | 18.5:1 (AAA)                  | body text |
| text-secondary   | `#44403c`  | 11.4:1 (AAA)                  | labels |
| text-muted       | `#57534e`  | 8.4:1 (AAA)                   | captions |
| text-subtle      | `#78716c`  | 5.3:1 (AAA)                   | small text |
| bg-base          | `#fafaf9`  | —                             | body bg |
| bg-card          | `#ffffff`  | —                             | cards |
| bg-tile          | `#f5f5f4`  | —                             | secondary bg |
| border           | `#e7e5e4`  | —                             | borders |
| border-muted     | `#d6d3d1`  | —                             | nav links |
| success-bg       | `#ecfdf5`  | —                             | strengths card |
| success-border   | `#a7f3d0`  | —                             |  |
| success-text     | `#065f46`  | 8.5:1 (AAA) on `#ecfdf5`      |  |
| success-fill     | `#10b981`  | —                             | meter fill, btn good |
| warning-bg       | `#fef3c7`  | —                             | haiku warning, streak pill |
| warning-border   | `#fde68a`  | —                             |  |
| warning-text     | `#92400e`  | 6.2:1 (AAA) on `#fef3c7`      |  |
| warning-fill     | `#f59e0b`  | —                             | meter amber, btn medium |
| warning-deep     | `#78350f`  | 9.5:1 (AAA) on `#fef3c7`      | banner warning |
| danger-bg        | `#fef2f2` / `#fee2e2` | —                  |  |
| danger-border    | `#fecaca`  | —                             |  |
| danger-text      | `#991b1b`  | 7.6:1 (AAA) on `#fef2f2`      | weakness card |
| danger-fill      | `#f43f5e`  | —                             | meter rose, btn bad |
| danger-deep      | `#dc2626`  | 4.5:1 (AA)                    | toast error, urgent |
| info-bg          | `#eff6ff`  | —                             | mnemonic card, tip bar |
| info-border      | `#bfdbfe`  | —                             |  |
| info-text        | `#1e40af` / `#1e3a8a` | —                  |  |
| dark-nav-bg      | `#1c1917`  | —                             | top nav, btn dark, toast |
| dark-nav-text    | `#d6d3d1`  | 6.4:1 (AAA) on `#1c1917`      | nav links |
| dark-nav-link    | `#93c5fd`  | 7.7:1 (AAA) on `#1c1917`      | active nav link |
| dark-nav-muted   | `#a8a29e`  | 5.0:1 (AA)                    | mode indicator |

**WCAG audit notes**: `#3b82f6` text on white falls below AA 4.5:1 (3.7:1). It IS used on white buttons in some places — but always paired with white text or used on `:hover` states with darker `#2563eb` (4.9:1 ✓). Body text on `#3b82f6` buttons is `white` (8.6:1 ✓).

### 1.3.2 Typografia

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
/* Rozprawka also uses: */ textarea { font-family: Georgia, serif; }
/* Egzaminator: */ .timer-display { font-family: monospace; }
```

| Token            | Size  | Weight   | Line-height | Użycie |
|------------------|-------|----------|-------------|--------|
| text-xs          | 10px  | 400      | 1.5         | small notes, badges |
| text-tiny        | 11px  | 400-700  | 1.5         | captions, labels, meters |
| text-sm          | 12px  | 400-600  | 1.5         | secondary UI |
| text-base        | 13px  | 400      | 1.5         | feedback panels, banners |
| text-body        | 14px  | 400      | 1.5         | body, default |
| text-md          | 15px  | 400-700  | 1.4         | tool card titles |
| text-lg          | 16px  | 600-700  | 1.4         | headers (h2/h3), questions |
| text-xl          | 18px  | 600-700  | 1.4         | modal h2, fiszka question |
| text-2xl         | 22px  | 800      | 1.0         | dashboard h1 |
| text-3xl         | 24px  | 700      | —           | egzaminator timer |
| text-4xl         | 32px  | 700      | 1.0         | dashboard big number |
| text-5xl         | 36px  | 700      | 1.0         | session summary big |
| text-6xl         | 48px  | 700      | 1.0         | grade-display, total-score |
| text-7xl         | 64px  | 800      | 1.0         | hero countdown |

### 1.3.3 Spacing (8px base, but 4px and 6px common micro-spacing)

```
2px  4px  6px  8px  10px  12px  14px  16px  20px  24px  28px  30px
```

Padding rythm: cards 14-18px, modals 16-20px, headers 10-12px, buttons 6-14px, pills 4-12px.

### 1.3.4 Breakpoints

Tylko jeden explicit breakpoint:
```css
@media (max-width: 700px) { .row, .row-3, .hero { grid-template-columns: 1fr; } }
```
Layout głównie przez `grid-template-columns: repeat(auto-fit, minmax(<X>px, 1fr))` (responsive without breakpoints).

### 1.3.5 Container widths

| Artifact     | max-width | Padding  |
|--------------|-----------|----------|
| Rozprawka    | 1100px    | 12px     |
| Fiszki       | 700px     | 12px     |
| Egzaminator  | 800px     | 12px     |
| Dashboard    | 1100px    | 16px     |
| Index        | 1100px    | 24px 16px |

### 1.3.6 Border-radius

`4px` (small pills) · `6px` (buttons, inputs) · `8px` (cards, banners, toasts) · `10px` (dashboard cards) · `12px` (modals, fiszki, hero) · `16px` (index hero) · `999px` (status pills)

### 1.3.7 Shared UI primitives

- **Toast**: `position: fixed; bottom; left:50%; transform: translateX(-50%);`, types: default (`#1c1917`), `error` (`#dc2626`), `success` (`#059669`), auto-dismiss 3500-4000ms.
- **Spinner**: `width:14px; height:14px; border:2px; border-top-color:currentColor; animation: spin 0.8s linear infinite`.
- **Modal**: full-screen overlay `rgba(28,25,23,0.5)` + centered card `max-width 720px (Rozprawka), 520px (privacy), 480px (restore)`.
- **Top nav**: `#1c1917` bg, links to 4 artifacts + landing, current mode label.

---

## 1.4 Konwencje

- **i18n**: `pl-PL` wyłącznie. Wszystkie stringi UI po polsku. Format dat przez `toLocaleString("pl-PL")` lub `toLocaleDateString("pl-PL", { day: "numeric", month: "short" })`. Formaty czasu `toLocaleTimeString("pl-PL", {hour:"2-digit", minute:"2-digit"})`.
- **Format dat (technical)**: `YYYY-MM-DD` ISO 8601 dla constants (`MATURA_DATE = "2026-05-05T09:00:00+02:00"` — strefa CEST). Day-key dla streak: `new Date().toDateString()` (US-format, ale używane tylko jako equality key).
- **Notacja CKE**: punktacja zawsze `X/Y` (np. `21/35`, `18/30`). 7 kryteriów rozprawki + 3 kryteria ustnego (komunikacyjna/monolog/rozmowa). Polish key names w grade JSON (`realizacja_tematu`, nie `topic_realization`).
- **Słowniki kategorii fiszek**: prefix-coding `ep01`, `mi01`, `sl01`, `po01`, `pr01`, `ts01`, `cy01`, `mo01`, `da01`, `bh01`, `ga01`, `ck01` (dashboard mapuje prefix → display label).
- **Pisownia**: wszystkie polskie diakrytyki zachowane w UTF-8. Tytuły lektur w nawiasach autora: `"Pan Tadeusz (Mickiewicz)"`.
- **Limit słów rozprawki**: 300 minimum (CKE auto-fail), 320-380 zalecane (bufor).

---

## 1.5 Struktura plików

```
github-repo/
├── README.md                           # 7.8 KB — instrukcje 3 trybów
├── PLAYBOOK.md                         # 23.6 KB — replikacja workflow
├── SETUP.md                            # 6.5 KB — szczegóły setupu
├── CLAUDE.md                           # 14.9 KB — rola Claude (korepetytor)
├── LICENSE                             # MIT
├── package.json                        # node:test runner
├── .gitignore
├── .github/workflows/pages.yml         # GitHub Pages deploy
├── docs/                               # GitHub Pages root
│   ├── index.html                      # 8.7 KB — landing + mode picker
│   ├── rozprawka.html                  # 43.7 KB
│   ├── fiszki.html                     # 34.5 KB
│   ├── egzaminator.html                # 29.0 KB
│   ├── dashboard.html                  # 22.0 KB (uses Chart.js CDN)
│   ├── shared/
│   │   └── claude-api.js               # 7.5 KB — universal inference wrapper
│   └── assets/                         # (puste — przygotowane na future)
├── impl/
│   └── logic.js                        # 9.5 KB — pure functions, CommonJS
├── tests/
│   ├── TESTS.md                        # 26.6 KB — spec testów
│   └── harness.js                      # 17.0 KB — 60 testów node:test (60/60 GREEN)
├── vault/                              # ~200 plików Obsidian
│   ├── 00-Baza-Wiedzy/  (Lektury × 40, Epoki × 11, Teoria, Język, Struktura, Punktacja)
│   ├── 01-Analiza-Pytan/  (jawne, statystyki, przewidywania)
│   ├── 02-Agenci/  (Korepetytor, Egzaminator, Plan-Nauki, Analityk-Pytan)
│   ├── 03-Plan-Nauki/  (dzienny, tracker, harmonogram, plan konwersji)
│   ├── 04-Fiszki/  (motywy, epoki, środki)
│   ├── 05-Szablony/  (szablon rozprawki, fiszki)
│   ├── MOC.md, README-vault.md
└── sdd-audit/                          # ten audit
    ├── BRIEF.md
    ├── Architecture.md  (TEN PLIK)
    ├── contracts/
    │   ├── schemas.json
    │   └── design-tokens.json
    ├── tests/
    │   ├── rozprawka.test.md
    │   ├── fiszki.test.md
    │   ├── egzaminator.test.md
    │   └── dashboard.test.md
    └── reviews/  (Faza 3 output)
```

---

## 1.6 TDD test scenarios

**Skondensowany overview** (pełna rozpiska w `tests/<artifact>.test.md`).

| Artifact     | P0 | P1 | P2 | TOTAL | Coverage type |
|--------------|----|----|----|-------|---------------|
| Rozprawka    | 8  | 5  | 2  | 15    | unit (existing 60) + integration (new) |
| Fiszki       | 6  | 4  | 2  | 12    | SR algo + UI flows |
| Egzaminator  | 5  | 3  | 2  | 10    | timer + parseGrade + privacy |
| Dashboard    | 4  | 3  | 1  | 8     | aggregate read + chart render |

Istniejące 60 testów (`tests/harness.js`) są P0/P1 dla Rozprawka logic — w pełni pokrywają `wordCount`, `getCounterColor`, `parseGrade`, `getBudgetRemaining`, `pruneStaleBudget`, `migrate`, `composeExport`. Brakuje: `isEligibleForGrading`, `formatCountdown`, `sanitizeForStorage` (są w `logic.js` ale BEZ TESTÓW — gap).

---

## 1.7 Komunikacja inter-artifact

**Pattern: storage-share, jednokierunkowy**

```
┌─────────────┐     localStorage     ┌──────────────────────┐
│  Fiszki     │  ──── write ────►    │  fiszki-matura-v1    │
└─────────────┘                       └──────────────────────┘
                                                 │
                                                 │ read-only
                                                 ▼
                                       ┌──────────────────────┐
                                       │  Dashboard           │
                                       │  (renderStats,       │
                                       │   renderWeakList,    │
                                       │   renderChartFiszki, │
                                       │   renderChartTags)   │
                                       └──────────────────────┘
```

- Rozprawka, Egzaminator: **wyspy danych** (write only do swoich keys, nikt nie czyta).
- Fiszki: pisze do swojego key.
- Dashboard: **read-only** consumer. Nie pisze. Re-render co 60s.
- Shared `matura-anthropic-api-key` + `matura-model`: globalna konfiguracja, czytana przez `claude-api.js` we wszystkich 4 artifactach.

**Uwagi audytu**:
1. **Brak event-bus** = Dashboard nie wie o updates Fiszek do następnego `setInterval(60000)`. Dla single-tab UX to OK, ale przy przełączaniu kart **stale data** trwa do 60s.
2. **Cross-artifact data flow nie istnieje**: błąd w rozprawce nie generuje fiszki, słaba ocena z Egzaminatora nie wpływa na plan w Dashboard. To OUT OF SCOPE w MVP (BRIEF sekcja 4).
3. **Rozprawka i Egzaminator nie mają agregacji w Dashboard** — Dashboard pokazuje tylko stats z Fiszek. To gap w pokryciu (zaplanowany Sprint 5).

---

## 1.8 ADRs (Architecture Decision Records)

Każdy ADR ma 6 elementów: Outcome, Scope boundary, Constraint, Prior decision, Task breakdown, Verification criteria.

### ADR-001: Vanilla JS (no React/Tailwind/build) dla Cowork artifactów
- **Outcome**: 4 single-file HTML artifacty działające w 3 środowiskach bez bundlera.
- **Scope boundary**: NIE używamy frameworków UI. Wyjątek: Chart.js w Dashboard (CDN, integrity hash).
- **Constraint**: Cowork sandbox nie ma React ani Tailwind w whitelist. GitHub Pages nie ma builder. Claude.ai artifacty mogą mieć React (jsx) ale Cowork NIE.
- **Prior decision**: BRIEF sekcja 5 ("Stack + Constraints").
- **Task breakdown**: ✅ done — wszystkie 4 artifacty są vanilla.
- **Verification**: open `docs/*.html` w pure browser → renderuje bez błędów konsoli; `python3 -m http.server` test (P0-DASH-001).

### ADR-002: localStorage zamiast `window.storage`
- **Outcome**: jednolity storage adapter we wszystkich 3 środowiskach.
- **Scope boundary**: NIE używamy `window.storage` (Claude.ai-only API). NIE używamy IndexedDB (overhead).
- **Constraint**: GitHub Pages i Cowork mają tylko `localStorage` (Cowork ma też `window.storage` ale niejednolicie). 5MB limit per origin wystarcza.
- **Prior decision**: ADR-001.
- **Task breakdown**: ✅ done — wszystkie keys zaczynają się od artifact name + suffix `-v1`.
- **Verification**: P0-ROZ-008 (autosave persists across reload), P0-FISZ-006 (state restored).

### ADR-003: Schema versioning suffix `-v1` w storage keys + `schemaVersion: 1` w payload
- **Outcome**: bezpieczna ścieżka migracji do v2 bez naruszania v1 deployów.
- **Scope boundary**: w MVP brak migrators. Schema mismatch → `null` (wymusza nowy draft).
- **Constraint**: użytkownicy mogą mieć stare drafty. Nie ma server-side migration.
- **Prior decision**: ADR-002.
- **Task breakdown**: ✅ logic.js `migrate()` + tests/harness.js `describe('migrate')`.
- **Verification**: P0-ROZ-013 (`schemaVersion: 99` → null restoration).

### ADR-004: Inference wrapper auto-detection (`window.matura.callClaude`)
- **Outcome**: każdy artifact pisze raz `await window.matura.callClaude(prompt)` — wrapper sam wybiera Sonnet/Haiku/API direct.
- **Scope boundary**: NIE robimy retry, NIE robimy streaming. 1 wrapper, 1 prompt → 1 string response.
- **Constraint**: 3 środowiska, każde ma inny API. Bez wrappera: 4 × 3 = 12 ścieżek.
- **Prior decision**: ADR-001.
- **Task breakdown**: ✅ `docs/shared/claude-api.js` (167 LOC).
- **Verification**: P0-API-001 (detectMode w 3 ENV), P0-API-002 (timeout via Promise.race w Rozprawka).

### ADR-005: Rolling 5h budget (45 calls) zamiast hard rate-limit
- **Outcome**: user widzi "12/45 (5h)", przewiduje wyczerpanie, planuje sesję.
- **Scope boundary**: tylko Rozprawka ma budget meter. Fiszki/Egzaminator NIE — tam każdy call jest user-initiated explicit.
- **Constraint**: Cowork rate-limit jest miękki ~45/5h (empirycznie zweryfikowane, BRIEF sekcja 5).
- **Prior decision**: ADR-004.
- **Task breakdown**: ✅ `getBudgetRemaining` + `pruneStaleBudget` w logic.js + 8 testów rolling window.
- **Verification**: P0-ROZ-006 (45 calls → grade-btn disabled), P1-ROZ-014 (window expiry resets).

### ADR-006: Privacy-first — explicit opt-in modal pierwszego wysłania
- **Outcome**: każdy artifact pyta przed pierwszym `callClaude` (privacyWarningSeen=false → modal).
- **Scope boundary**: NIE blokujemy wysyłania, tylko ostrzegamy. Privacy mode (Rozprawka) wyłącza wszystkie buttons inferencji.
- **Constraint**: brak audyt-trail (frontend-only). User musi wiedzieć, że tekst idzie do Anthropic.
- **Prior decision**: ADR-004.
- **Task breakdown**: ✅ `showPrivacyWarning()` (Rozprawka), `confirm()` (Fiszki, Egzaminator).
- **Verification**: P0-ROZ-005 (privacy mode disables grade-btn), P0-FISZ-009 (askHaiku confirm).

### ADR-007: JSON output + parseGrade z fallback (regex extract `\{[\s\S]*\}`)
- **Outcome**: nawet gdy LLM wstawi preambułę "Oto ocena:", parsujemy.
- **Scope boundary**: NIE używamy schema-enforced JSON output (nie dostępne w Cowork wrappers). NIE robimy retry parse.
- **Constraint**: Haiku często wraca w ```json fence``` lub z preambułą.
- **Prior decision**: ADR-004.
- **Task breakdown**: ✅ `parseGrade()` w logic.js + 11 testów (fences, preambuła, RANGE_ERROR, MISSING_FIELD).
- **Verification**: 11 testów GREEN w `tests/harness.js` describe('parseGrade').

### ADR-008: System prompt z anti-injection guard (triple-quoted user content)
- **Outcome**: rozprawka ucznia jest w `"""..."""`. Instrukcje wewnątrz tekstu = treść, nie polecenie.
- **Scope boundary**: NIE robimy detection adversarial input. Tylko placement w prompt.
- **Constraint**: rozprawki uczniów mogą zawierać "ignoruj poprzednie instrukcje".
- **Prior decision**: ADR-007.
- **Task breakdown**: ✅ `SYSTEM_PROMPT` (Rozprawka). `buildCritiquePrompt`, `buildGradePrompt` używają triple-quotes.
- **Verification**: P1-ROZ-015 (manual: prompt z "daj 35/35" w intro NIE wpływa na ocenę).

### ADR-009: Fiszki SM-2 lite (level 0-5, intervals [0,1,3,7,14,30] dni)
- **Outcome**: prosta spaced repetition, soft-reset (level -2) zamiast hard-reset na "bad".
- **Scope boundary**: NIE pełen SM-2 (no easiness factor). NIE Anki-compatible.
- **Constraint**: 1 dzień implementacji, prostota > matematyczna optymalizacja.
- **Prior decision**: ADR-001.
- **Task breakdown**: ✅ `rateFiszka()` w fiszki.html (3-rating: good/medium/bad).
- **Verification**: P0-FISZ-001 (good → level+1, dueAt = now + interval[level]).

### ADR-010: Dashboard read-only, czyta state Fiszek
- **Outcome**: 1 source of truth (fiszki-matura-v1). Dashboard agreguje.
- **Scope boundary**: Dashboard NIE pisze do żadnego storage. NIE używa `window.matura.callClaude`.
- **Constraint**: agregacja przez `localStorage.getItem` jest synchroniczna i bezpieczna.
- **Prior decision**: ADR-002, ADR-009.
- **Task breakdown**: ✅ `loadFiszkiState()`, `renderStats()`, `renderWeakList()`, `renderChartTags()`.
- **Verification**: P0-DASH-002 (Dashboard pokazuje 0 jeśli localStorage empty), P0-DASH-003 (live update co 60s).

### ADR-011: Drabina ekspozycji na stres (auto-faza low/medium/high/peak/off)
- **Outcome**: Dashboard sam wybiera fazę z `daysToMatura`: ≥10=low, 6-9=medium, 3-5=high, 1-2=peak, 0=off.
- **Scope boundary**: NIE personalizujemy per user (brak danych). Faza jest globalna.
- **Constraint**: teoria pedagogiczna — gradual exposure to stress (BRIEF pain point #3).
- **Prior decision**: BRIEF sekcja 3.
- **Task breakdown**: ✅ `getPhase()`, `getPhaseRecommendation()`, `getTodayPlan()` w dashboard.html.
- **Verification**: P0-DASH-004 (boundary tests: d=10 → low, d=9 → medium, d=2 → peak).

### ADR-012: Spec-freeze v1 — schema changes wymagają v2 storage key bump
- **Outcome**: post-audit (`2026-04-25`) schemas są ZAMROŻONE. Nowy field = nowa schemaVersion + nowy storage key.
- **Scope boundary**: NIE wolno dopisywać pól do existing payload bez `migrate()` step.
- **Constraint**: użytkownicy mają persistent state. Backward incompatibility = data loss.
- **Prior decision**: ADR-003.
- **Task breakdown**: dokumentacja w tym pliku (sekcja header `spec_freeze: TRUE`).
- **Verification**: code review checklist — każdy PR dotykający `state` musi mieć ADR.

---

## 1.9 Ryzyka post-deployment + mitigations

### R1 — Storage 5MB exceeded (LOW prob, HIGH impact)
- **Scenariusz**: user pisze 50+ rozprawek (pełen state z grade dla każdej), localStorage explodes.
- **Aktualnie**: BRAK quota check. `localStorage.setItem` rzuci `QuotaExceededError`, Rozprawka pokaże `showToast("Nie udało się zapisać", "error")`.
- **Mitigation**: dodać check `JSON.stringify(state).length > 4_500_000` przed save. Sprint 5 backlog.

### R2 — `parseGrade` failure mode pokazuje raw JSON userowi (MEDIUM prob, MEDIUM impact)
- **Scenariusz**: Haiku wraca z malformed JSON (np. unclosed string). Modal pokazuje `<pre>` z 200+ znaków technical text — bad UX dla 17-latka.
- **Aktualnie**: jest "Spróbuj ponownie" button, ale brak retry-with-different-prompt strategy.
- **Mitigation**: dodać 1× automatic retry z `"Wcześniejsza odpowiedź była malformed JSON. Spróbuj jeszcze raz, czysty JSON bez fences."`.

### R3 — Privacy regression (HIGH prob, HIGH impact)
- **Scenariusz**: `privacyWarningSeen=true` jest persistent — user kiedyś kliknął "Rozumiem", potem otworzył ponownie i wkleił bardzo wrażliwe dane bez świadomości, że są wysyłane.
- **Aktualnie**: jednorazowy modal. Brak periodic re-confirmation.
- **Mitigation**: dodać `privacyConfirmedAt` timestamp + re-prompt po 30 dniach. Lub w status-bar zawsze widoczny "🔓 Wysyłanie aktywne" pill (Rozprawka ma to ✓, Fiszki/Egzaminator nie).

### R4 — API key plain-text w localStorage (MEDIUM prob, HIGH impact)
- **Scenariusz**: shared device, malicious extension, lub git commit screenshot — klucz API leaknięty.
- **Aktualnie**: claude-api.js storage `matura-anthropic-api-key` plain. Modal ma warning text.
- **Mitigation**: nie da się szyfrować bez password. Można dodać `clearApiKey` after `idle 24h`. Backlog v2.

### R5 — Cowork bridge breaks (`window.cowork.sample` removed) (LOW prob, HIGH impact)
- **Scenariusz**: Cowork SDK update zmienia API, wszystkie 4 artifacty stop working w Cowork.
- **Aktualnie**: graceful fallback na browser mode (przez `detectMode()` → "browser" jeśli `window.cowork.sample` nieobecny). User dostanie `MISSING_API_KEY` modal.
- **Mitigation**: ✓ already handled. Test integracyjny w PR pipeline (manual w MVP).

### R6 — Egzaminator: sesja zniszczona przy reload (HIGH prob, MEDIUM impact)
- **Scenariusz**: user w środku 15-min prep, reload tab, cała sesja zniknęła (brak persistencji).
- **Aktualnie**: tylko `privacyWarningSeen` jest persistent. Reszta in-memory.
- **Mitigation**: persist sesji jest możliwy, ale **świadoma decyzja** — symuluje pressure egzaminu. Decyzja UX, nie bug. Można dodać `beforeunload` warning. Backlog.

### R7 — Chart.js CDN unavailable (LOW prob, HIGH impact dla Dashboard)
- **Scenariusz**: jsdelivr down, Dashboard pokazuje broken charts.
- **Aktualnie**: integrity hash + crossorigin attribute. Brak fallback.
- **Mitigation**: dodać `<noscript>` lub try/catch wokół `new Chart()` z text fallback.

### R8 — `getDaysToMatura()` po dacie = 0, ale UI wyświetla "Po maturze" niespójnie (LOW prob, LOW impact)
- **Scenariusz**: Rozprawka pokazuje "PO MATURZE" (kurrent: jest format), Dashboard pokazuje "MATURA W PRZESZŁOŚCI", Fiszki tylko "PO MATURZE", Egzaminator timer pokazuje "--:--" ale brak komunikatu.
- **Aktualnie**: 4 różne formaty post-matura. Inconsistent UX.
- **Mitigation**: ujednolicić w shared `formatCountdown` z claude-api.js. Cosmetic backlog.

### R9 — Fiszki streak fragility (MEDIUM prob, LOW impact)
- **Scenariusz**: user przekroczy timezone (podróż), `new Date().toDateString()` zmieni day, streak liczony błędnie.
- **Aktualnie**: bazuje na local timezone (`Date.now()`).
- **Mitigation**: dokumentacja "streak bazuje na Twoim lokalnym czasie". Backlog v2.

### R10 — Brak telemetrii / brak feedback loopu (HIGH prob, MEDIUM impact)
- **Scenariusz**: nie wiemy ile uczniów używa, ile rozprawek napisanych, czy pomaga.
- **Aktualnie**: brak analytics (frontend-only, brak server).
- **Mitigation**: świadoma decyzja (privacy-first). Backlog: opt-in anonymized stats endpoint v2.

---

## 2.X — Storage adapter (universal, audit notes)

**REKOMENDOWANY UNIWERSALNY ADAPTER** (nie istnieje obecnie, jest sugerowany jako refactor):

```js
// docs/shared/storage.js (PROPOSED, NOT IMPLEMENTED)
window.maturaStorage = (function() {
  function tryWindowStorage() {
    try { return typeof window.storage === "object" && window.storage; } catch(e) { return false; }
  }
  function tryLocalStorage() {
    try { return typeof localStorage !== "undefined" && localStorage; } catch(e) { return false; }
  }
  const memFallback = {};
  const backend =
    tryWindowStorage()  ? "window.storage" :
    tryLocalStorage()    ? "localStorage" :
                           "memory";
  function get(key) {
    try {
      if (backend === "window.storage") return window.storage.getItem(key);
      if (backend === "localStorage")    return localStorage.getItem(key);
      return memFallback[key] || null;
    } catch(e) { return null; }
  }
  function set(key, value) {
    try {
      if (backend === "window.storage") { window.storage.setItem(key, value); return true; }
      if (backend === "localStorage")    { localStorage.setItem(key, value); return true; }
      memFallback[key] = value; return true;
    } catch(e) { return false; }
  }
  function remove(key) {
    try {
      if (backend === "window.storage") window.storage.removeItem(key);
      else if (backend === "localStorage") localStorage.removeItem(key);
      else delete memFallback[key];
    } catch(e) {}
  }
  return { get, set, remove, backend };
})();
```

### Audit obecnego stanu (NIESPÓJNY)

| Artifact     | Adapter style | Backend used | Quota check | Failure mode |
|--------------|---------------|--------------|-------------|--------------|
| Rozprawka    | own `stor` object (lines 281-296) | `localStorage` only | NO | toast "Nie udało się zapisać" + return false |
| Fiszki       | inline try/catch (lines 247-263) | `localStorage` only | NO | silent swallow |
| Egzaminator  | inline try/catch (lines 178-193) | `localStorage` only | NO | silent swallow |
| Dashboard    | inline try/catch (lines 303-309) | `localStorage` only (read) | N/A | returns null |
| claude-api.js | inline try/catch | `localStorage` only | NO | returns null |

**Niespójności**:
1. Brak `window.storage` fallback nigdzie (mimo że jest specced w původnym ARCHITECTURE.md).
2. Brak `memory` fallback — jeśli localStorage zablokowany (incognito + cookies disabled), wszystko milczy.
3. Tylko Rozprawka pokazuje user-facing error toast.
4. Każdy artifact ma swój wzorzec — DRY violated.

**Rekomendacja Sprint 5**: ekstrakcja `docs/shared/storage.js` (kod powyżej), refactor 4 artifactów (≤30 LOC zmienionych każdy). NIE zmieniaj storage keys (spec freeze). Verification: dodać test `storage-fallback.test.md` (P1).
