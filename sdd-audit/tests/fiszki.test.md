# Tests — Fiszki Matura

**Total**: 12 scenarios (P0: 6, P1: 4, P2: 2)
**Frame**: Given/When/Then.
**Note**: Logika fiszek nie ma osobnego logic.js — wszystko w `docs/fiszki.html` script tag. Testowalne tylko manualnie / przez jsdom (backlog).

---

## Test FISZKI-001 — P0 — rateFiszka("good") podnosi level + przesuwa dueAt
**Given** karta `ep01` w state.cards z level=2, total=5, correct=3, dueAt=10000
**When** `rateFiszka("ep01", "good")` jest wywołane (now=20000)
**Then** state.cards.ep01.level=3, total=6, correct=4, dueAt = 20000 + SR_INTERVALS[3] = 20000 + 7*86400000 = 20604800000
Plus state.totalCorrect++, sessionDone++, sessionCorrect++

## Test FISZKI-002 — P0 — rateFiszka("bad") soft-reset (level -2, min 0)
**Given** karta z level=3
**When** `rateFiszka(id, "bad")`
**Then** level = max(0, 3-2) = 1; correct NIE rośnie; dueAt = now + SR_INTERVALS[1] = now + 1d
Edge: jeśli level=1 → max(0, -1) = 0; level=0 → 0 (clamp)

## Test FISZKI-003 — P0 — rateFiszka("medium") zachowuje level
**Given** karta z level=2
**When** `rateFiszka(id, "medium")`
**Then** level=2 niezmienione; total++; correct NIE rośnie; dueAt = now + SR_INTERVALS[2] = now + 3d

## Test FISZKI-004 — P0 — getDueFiszki filtruje cards.dueAt <= now
**Given** state.cards = { ep01: dueAt=now-1000, ep02: dueAt=now+1000 }
**When** `getDueFiszki()`
**Then** zwraca [FISZKI[ep01]] tylko; FISZKI[ep02] nie jest due

## Test FISZKI-005 — P0 — getWeakFiszki: total >= 2 AND correct/total < 0.5
**Given** state.cards = { a: {total:5, correct:1}, b: {total:1, correct:0}, c: {total:5, correct:3} }
**When** `getWeakFiszki()`
**Then** zwraca tylko `a` (1/5 = 20% < 50%, total=5 >= 2). `b` ma total<2 (sample za mały). `c` ma 60% > 50%.

## Test FISZKI-006 — P0 — loadState/saveState roundtrip
**Given** state ze 142 totalAnswered, 98 totalCorrect, streak.current=7
**When** saveState() → reload → loadState()
**Then** state.totalAnswered=142, totalCorrect=98, streak.current=7 (current session vars NIE są persistente — sessionDone, sessionCorrect, currentIdx, revealed)

## Test FISZKI-007 — P1 — streak: kolejny dzień zwiększa, gap resetuje do 1
**Given** state.streak = { lastDay: "Thu Apr 24 2026", current: 5 }, today = "Fri Apr 25 2026"
**When** rateFiszka() i sprawdzenie streak logic
**Then** lastDay === yesterday → current = 5+1 = 6
**Edge**: lastDay = "Wed Apr 23 2026" (gap 1 day) → current = 1 (reset)

## Test FISZKI-008 — P1 — currentDeck() switching modes
**Given** state.mode = "due"
**When** user klika tab "Słabe (<50%)"
**Then** state.mode = "weak", currentIdx = 0, sessionDone/sessionCorrect = 0, currentDeck() zwraca getWeakFiszki()

## Test FISZKI-009 — P1 — askHaiku confirm prompt blokuje pierwsze wysłanie
**Given** state.privacyWarningSeen = false
**When** user klika "💡 Wytłumacz mi to (Haiku)"
**Then** wywoływany `confirm()` z polską wiadomością. Jeśli Cancel → return (no callClaude). Jeśli OK → privacyWarningSeen=true, saveState(), proceed

## Test FISZKI-010 — P1 — askHaiku gdy window.matura niedostępny
**Given** window.matura nieobecne (np. browser bez api key, no Cowork)
**When** user klika "Wytłumacz Haiku"
**Then** showToast("Haiku niedostępny — otwórz w Cowork", "error"); brak crash

## Test FISZKI-011 — P2 — fiszka tag filter populates dropdown
**Given** FISZKI = 63 entries z różnymi tags
**When** populateTagFilter() jest wywołane
**Then** select#tag-filter zawiera unique tags, sorted alphabetically, plus "Wszystkie tagi" jako pierwszy option

## Test FISZKI-012 — P2 — confidence guess [25/50/75/100]% przed reveal
**Given** state.revealed=false, state.confidenceGuess=null
**When** user klika "75%"
**Then** state.confidenceGuess=75, state.revealed=true (auto-reveal po wybraniu confidence)
**Note**: NIE jest persistowane do storage (per-session only)
