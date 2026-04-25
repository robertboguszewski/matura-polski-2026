# Tests — Egzaminator Ustny

**Total**: 10 scenarios (P0: 5, P1: 3, P2: 2)
**Frame**: Given/When/Then.
**Note**: Brak osobnego logic.js. Wszystko w `docs/egzaminator.html`. Persystowany jest TYLKO `privacyWarningSeen`.

---

## Test EGZAMINATOR-001 — P0 — startSimulation losuje 1 jawne CKE + generuje 1 niejawne
**Given** state.phase="setup", PYTANIA_JAWNE = 30 entries, window.matura.callClaude available
**When** user klika "🎫 Losuj zestaw i zaczynaj"
**Then** state.zestaw.jawne = random PYTANIA_JAWNE entry; state.zestaw.niejawne = output Haiku z prompt "Wygeneruj 1 pytanie..."; state.phase="prep"; prepStartAt=Date.now() (jeśli not easy)

## Test EGZAMINATOR-002 — P0 — startSimulation gdy callClaude unavailable
**Given** window.matura nieobecne LUB callClaude nie funkcja
**When** user klika "Losuj"
**Then** showToast("Haiku niedostępny — otwórz w Cowork", "error"); state.phase pozostaje "setup"

## Test EGZAMINATOR-003 — P0 — Timer prep auto-przejście do speaking
**Given** state.phase="prep", prepStartAt = Date.now() - 15*60*1000 (timer skończył się)
**When** renderHeader() jest wywołane (setInterval 1s)
**Then** remaining=0 wykryte, startSpeaking() wywołane, state.phase="speaking", state.speechStartAt=Date.now()
**Edge**: difficulty="easy" → prepStartAt=null → timer NIE odlicza, faza wymaga manual click

## Test EGZAMINATOR-004 — P0 — parseGradeUstny waliduje sumę
**Given** Haiku wraca JSON: komunikacyjna.punkty=2, monolog.punkty=10, rozmowa.punkty=8, suma=25 (źle, powinno 20)
**When** `parseGradeUstny(raw)`
**Then** parsed.suma = 20 (auto-correct), parsed._corrected = true
**Edge**: jeśli brak fence ```json``` → trimming OK; jeśli brak jakiegokolwiek JSON → throw "brak JSON"

## Test EGZAMINATOR-005 — P0 — privacy confirm before first call
**Given** state.privacyWarningSeen = false
**When** user klika "Losuj zestaw"
**Then** confirm("Symulacja wysyła Twoje wypowiedzi do Anthropic..."); jeśli Cancel → return; jeśli OK → privacyWarningSeen=true, saveState()

## Test EGZAMINATOR-006 — P1 — Komisja rotacja przez 3 osobowości
**Given** state.transcript ma 0 commission messages
**When** askCommissionQuestion() wywołane 3× pod rząd
**Then** examiner = KOMISJA[0=życzliwy] → KOMISJA[1=sceptyczny] → KOMISJA[2=ciekawski] (rotacja modulo 3)

## Test EGZAMINATOR-007 — P1 — submitAnswer oferuje grading po >= 3 commission questions
**Given** state.transcript ma 3 commission entries + 3 user entries
**When** submitAnswer() wywołane
**Then** confirm("Przejść do oceny po 3 pytaniach?"); jeśli OK → gradeFinal(); jeśli Cancel → askCommissionQuestion() (4-te pytanie)

## Test EGZAMINATOR-008 — P1 — Hard mode pokazuje danger pulse <5min
**Given** difficulty="hard", remaining = 4*60*1000 (4 min)
**When** renderHeader()
**Then** timer-display ma class "danger" (pulse animation), bg #fee2e2

## Test EGZAMINATOR-009 — P2 — resetSim wraca do phase="setup"
**Given** state.phase="done", grade i transcript wypełnione
**When** user klika "↻ Nowa symulacja", confirm OK
**Then** state.phase="setup", state.zestaw=null, state.transcript=[], state.grade=null, state.prepStartAt=null

## Test EGZAMINATOR-010 — P2 — Easy mode: brak timera (prepStartAt=null)
**Given** difficulty="easy"
**When** startSimulation()
**Then** state.prepStartAt=null, state.speechStartAt=null; timer pokazuje "--:--" i nigdy auto-przejścia
