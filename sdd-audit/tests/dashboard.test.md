# Tests — Dashboard

**Total**: 8 scenarios (P0: 4, P1: 3, P2: 1)
**Frame**: Given/When/Then.
**Note**: Dashboard jest READ-ONLY consumer of `fiszki-matura-v1`. Nie persystuje żadnego state.

---

## Test DASHBOARD-001 — P0 — Smoke: renderuje się bez localStorage
**Given** localStorage jest puste (incognito + first visit)
**When** strona dashboard.html jest otwierana
**Then** renderStats() pokazuje "0" / "—" / "Brak danych"; renderWeakList() pokazuje empty state ("Otwórz Fiszki..."); brak crash; brak console error

## Test DASHBOARD-002 — P0 — getPhase boundary (dni 10/9/6/5/3/2/1/0)
**Given** różne wartości daysToMatura
**When** `getPhase()` wywołane
**Then**:
- d=10 → "low"
- d=9  → "medium"  (boundary)
- d=6  → "medium"
- d=5  → "high"    (boundary)
- d=3  → "high"
- d=2  → "peak"    (boundary)
- d=1  → "peak"
- d=0  → "off"     (boundary)
**Note**: Cell `ladder-low` w UI pokazuje "dni 13-10" — boundary jest `d <= 9` for medium, `d <= 5` for high, `d <= 2` for peak. Test sprawdza dokładnie te boundaries.

## Test DASHBOARD-003 — P0 — renderStats: today=todayStr count cards seen today
**Given** localStorage.fiszki-matura-v1 = { cards: { ep01: {lastSeen: dziś.getTime()}, ep02: {lastSeen: wczoraj} } }
**When** renderStats()
**Then** cards-today.textContent = "1" (tylko ep01 dziś)
**Plus**: streak-num pokazuje "🔥 " + fs.streak.current; acc-num = round(100*correct/answered)+"%"

## Test DASHBOARD-004 — P0 — Hero gradient → urgent-now jeśli daysToMatura <= 3
**Given** daysToMatura = 3
**When** renderHeroAndPhase()
**Then** hero element ma class "urgent-now" (gradient czerwony #dc2626 → #991b1b zamiast niebieski)

## Test DASHBOARD-005 — P1 — renderWeakList sortuje po accuracy ASC, top 8
**Given** state.cards z 12 fiszkami, 5 z accuracy <50% (różne wartości)
**When** renderWeakList()
**Then** ul.weak-list zawiera dokładnie 5 li (lub 8 jeśli więcej); sortowane od najsłabszej (accuracy ASC); każdy li pokazuje `📌 fiszka <code>{id}</code>` + accuracy %

## Test DASHBOARD-006 — P1 — getTodayPlan zwraca array per faza
**Given** various getPhase() outputs
**When** `getTodayPlan()`
**Then**:
- "off" → array z "Sleep 8h", "Lekkie śniadanie", "Idź na egzamin spokojnie 🍀"
- "peak" → array zawiera "🎓 Pełna symulacja ustnego..." (5 items)
- "high" → array z 5 items ("📝 1 rozprawka dzienna...")
- "medium" → 5 items
- "low" → 5 items

## Test DASHBOARD-007 — P1 — renderChartTags mapuje prefix ID → tag display
**Given** state.cards keys: ep01, mi01, sl01, po01, pr01, ts01, cy01, mo01, da01, bh01, ga01, ck01
**When** renderChartTags()
**Then** Chart.js bar chart z labelami: "Epoki", "Mickiewicz", "Słowacki", "Poeci", "Proza", "Środki", "Cytaty", "Motywy", "Daty", "Bohaterowie", "Gatunki", "CKE"
Bar color: ≥70% green, ≥50% amber, <50% rose

## Test DASHBOARD-008 — P2 — renderTipOfDay deterministic per day
**Given** TIPS array (16 entries), Date.now()
**When** renderTipOfDay() w 2 sesjach tego samego dnia
**Then** ten sam TIP się pokazuje (idx = floor(Date.now()/86400000) % TIPS.length)
Następny dzień → inny TIP
```

---

## RAPORT KOŃCOWY

### Pliki wytworzone (do zapisania przez parent agenta)

W `/sessions/eager-awesome-mendel/mnt/Matura Polski/github-repo/sdd-audit/`:
1. `Architecture.md` — 9 sekcji + audit storage adaptera (~3000 słów)
2. `contracts/schemas.json` — JSON Schema draft 2020-12, 4 state shapes + GradeCriterion + FeedbackEntry + RozprawkaGrade + EgzaminatorGrade w `$defs`, z examples
3. `contracts/design-tokens.json` — colors (37), typography, spacing, breakpoints, storage_keys, claude_models, matura_constants, plus per-artifact configs
4. `tests/rozprawka.test.md` — 15 scenariuszy (8/5/2)
5. `tests/fiszki.test.md` — 12 scenariuszy (6/4/2)
6. `tests/egzaminator.test.md` — 10 scenariuszy (5/3/2)
7. `tests/dashboard.test.md` — 8 scenariuszy (4/3/1)

### TL;DR — 5 kluczowych decyzji architektonicznych

1. **ADR-001+002** — Vanilla JS + localStorage (nie React/Tailwind/window.storage). Single-file HTML × 4. Działa w Cowork sandbox bez bundlera.
2. **ADR-004** — Universal inference wrapper `window.matura.callClaude` z auto-detekcją 3 środowisk (Claude.ai/Cowork/browser). User pisze raz, działa wszędzie.
3. **ADR-005** — Rolling 5h budget meter (45 calls), implementowany jako `pruneStaleBudget` + `getBudgetRemaining` z immutable update i clamp do 0.
4. **ADR-007** — `parseGrade` z fallback regex `\{[\s\S]*\}` na wypadek preambuły/fences od LLM, plus auto-correct sumy z `_corrected: true` flag.
5. **ADR-010** — Dashboard jest READ-ONLY consumer state Fiszek przez `localStorage.getItem("fiszki-matura-v1")`. Brak event-bus, refresh co 60s. Cross-artifact data flow OUT OF SCOPE.

### Top 3 ryzyka post-deployment

1. **R3 Privacy regression** (HIGH/HIGH) — `privacyWarningSeen` jest persistent w localStorage. User raz kliknął "Rozumiem", potem może wkleić wrażliwe dane bez świadomości. Mitigation: re-prompt po 30 dniach + always-visible status pill we wszystkich 4 artifactach (Rozprawka ma ✓, Fiszki/Egzaminator nie).
2. **R6 Egzaminator session loss** (HIGH/MEDIUM) — reload tabu w środku 15-min prep niszczy całą sesję. Świadoma decyzja UX (symuluje pressure), ale frustruje. Mitigation: `beforeunload` warning.
3. **R1 Storage quota** (LOW/HIGH) — brak quota check przed `localStorage.setItem`. 50+ rozprawek może przekroczyć 5MB i `QuotaExceededError` zostanie złapany silently w 3 z 4 artifactów (tylko Rozprawka pokazuje toast).

### Pytania do user (potencjalne niejasności)

1. **Egzaminator session persistence** — czy reload niszczący sesję jest świadomą decyzją (pressure simulation) czy bug do fix? BRIEF tego nie precyzuje.
2. **Storage adapter** — czy w Sprint 5 zaakceptujesz refactor do `docs/shared/storage.js` (window.storage → localStorage → memory fallback) bez bumpu schemaVersion (tylko `get/set` API zmienia się, schemas pozostają)?
3. **Brak P0 testów dla 3 funkcji w logic.js** (`isEligibleForGrading`, `formatCountdown`, `sanitizeForStorage`) — to gap. Czy dodać do `harness.js` w Sprint 5 (P1)?
4. **Dashboard niewidzi Rozprawki/Egzaminatora** — explicit decyzja ("Cross-artifact data flow OUT OF SCOPE") czy backlog do dodania w Sprint 5?

### Liczba testów per artifact

| Artifact     | P0 | P1 | P2 | TOTAL | Existing GREEN |
|--------------|----|----|----|-------|----------------|
| Rozprawka    | 8  | 5  | 2  | 15    | 60/60 unit (logic.js) ✅ |
| Fiszki       | 6  | 4  | 2  | 12    | 0 — manual only ⚠ |
| Egzaminator  | 5  | 3  | 2  | 10    | 0 — manual only ⚠ |
| Dashboard    | 4  | 3  | 1  | 8     | 0 — manual only ⚠ |
| **TOTAL**    | **23** | **15** | **7** | **45** | **60 unit** |

**Spec freeze**: po zapisaniu tych plików, schemas v1 są ZAMROŻONE. Każda zmiana = bump v2 + nowy storage key + `migrate()` step.

### Krytyczne pliki do implementacji (parent agent)

- `/sessions/eager-awesome-mendel/mnt/Matura Polski/github-repo/sdd-audit/Architecture.md`
- `/sessions/eager-awesome-mendel/mnt/Matura Polski/github-repo/sdd-audit/contracts/schemas.json`
- `/sessions/eager-awesome-mendel/mnt/Matura Polski/github-repo/sdd-audit/contracts/design-tokens.json`
- `/sessions/eager-awesome-mendel/mnt/Matura Polski/github-repo/sdd-audit/tests/rozprawka.test.md`
- `/sessions/eager-awesome-mendel/mnt/Matura Polski/github-repo/sdd-audit/tests/fiszki.test.md`
- `/sessions/eager-awesome-mendel/mnt/Matura Polski/github-repo/sdd-audit/tests/egzaminator.test.md`
- `/sessions/eager-awesome-mendel/mnt/Matura Polski/github-repo/sdd-audit/tests/dashboard.test.md`
