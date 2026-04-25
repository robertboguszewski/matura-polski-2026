// harness.js — Node.js test harness dla Rozprawka Scaffolder
// Run: node harness.js
//
// Metoda: TDD — faza RED. Stuby rzucają NOT_IMPLEMENTED, testy failują.
// Implementator zastąpi stuby realną logiką i testy zazielenią się.
//
// Pokrycie:
//   - wordCount           (CKE rules: split, skróty, hyphen)
//   - getCounterColor     (red/green/yellow per limit)
//   - parseGrade          (JSON + fallback regex, walidacja sumy)
//   - getBudgetRemaining  (rolling 5h window)
//   - pruneStaleBudget    (immutable usuwanie starych timestampów)
//   - migrate             (schema v1)
//   - composeExport       (clipboard format)
//
// Źródła kontraktów:
//   - ARCHITECTURE.md sekcje 3.2, 4.4, 5.3, 5.4, 7.5, 7.6
//   - RUBRIC.md sekcja 6 (JSON shape)
//   - TESTS.md sekcja 2 (unit test plan)
//
// Wymagania: Node 18+ (node:test wbudowany).

const { test, describe } = require('node:test')
const assert = require('node:assert/strict')

// ========== IMPLEMENTATION (TDD GREEN phase) ==========
// Logika jest w impl/logic.js. Harness re-eksportuje funkcje przez destructuring.

const logic = require('../impl/logic')
const {
  wordCount,
  getCounterColor,
  parseGrade,
  getBudgetRemaining,
  pruneStaleBudget,
  migrate,
  composeExport
} = logic

// ========== TESTS ==========

// ---------- wordCount (CKE rules) ----------
// Reguły: ARCHITECTURE.md 7.5 — split(/\s+/).filter(len>0). Skróty "np." nie są rozbijane
// (bo kropka nie jest whitespace). Hyphen-words = 1 słowo (myślnik bez spacji).

describe('wordCount — CKE rules', () => {
  test('pusty string zwraca 0', () => {
    assert.equal(wordCount(""), 0)
  })

  test('pojedyncze słowo', () => {
    assert.equal(wordCount("Mickiewicz"), 1)
  })

  test('cztery słowa oddzielone spacjami', () => {
    assert.equal(wordCount("Adam Mickiewicz napisał Dziady"), 4)
  })

  test('sześć słów z liczbą', () => {
    assert.equal(wordCount("Ballady i romanse to Mickiewicz 1822"), 6)
  })

  test('skrót "np." nie jest rozbijany (4 słowa)', () => {
    // "np." to 1 token — kropka nie wprowadza whitespace
    assert.equal(wordCount("np. Dziady i Kordian"), 4)
  })

  test('hyphen-word "biało-czerwony" = 1 słowo', () => {
    assert.equal(wordCount("biało-czerwony"), 1)
    assert.equal(wordCount("biało-czerwony flag"), 2)
  })

  test('cyfry liczą się jako słowa', () => {
    assert.equal(wordCount("1822 rok"), 2)
  })

  test('newlines i taby traktowane jak spacje', () => {
    assert.equal(wordCount("Adam\nMickiewicz\t1822"), 3)
  })

  test('leading/trailing whitespace pomijane', () => {
    assert.equal(wordCount("  Adam  "), 1)
  })

  test('tylko whitespace → 0', () => {
    assert.equal(wordCount("   \n\t  "), 0)
  })

  test('wielokrotne spacje między słowami', () => {
    assert.equal(wordCount("Adam   Mickiewicz"), 2)
  })

  test('polskie diakrytyki', () => {
    // "żółć, źdźbło" — 2 słowa (przecinek nie jest whitespace, więc "żółć," to 1 token)
    assert.equal(wordCount("żółć źdźbło"), 2)
  })

  test('null zwraca 0 (defensive)', () => {
    assert.equal(wordCount(null), 0)
  })

  test('undefined zwraca 0 (defensive)', () => {
    assert.equal(wordCount(undefined), 0)
  })

  test('Unicode zero-width space NIE liczy się jako whitespace', () => {
    // \u200B nie jest w \s, więc "Adam\u200BMickiewicz" = 1 token
    assert.equal(wordCount("Adam\u200BMickiewicz"), 1)
  })

  test('emoji traktowane jak część słowa (brak whitespace)', () => {
    // "super🎉" bez spacji = 1 słowo; ze spacją = 2
    assert.equal(wordCount("super 🎉"), 2)
    assert.equal(wordCount("super🎉"), 1)
  })

  test('długi tekst 300 słów liczy dokładnie 300', () => {
    const longText = Array(300).fill("słowo").join(" ")
    assert.equal(wordCount(longText), 300)
  })
})

// ---------- getCounterColor ----------
// Reguły: ARCHITECTURE.md 7.6 — red / green / yellow.

describe('getCounterColor — kolory licznika', () => {
  test('w limicie zwraca green', () => {
    assert.equal(getCounterColor(50, 40, 60), "green")
  })

  test('pod limitem zwraca red', () => {
    assert.equal(getCounterColor(30, 40, 60), "red")
  })

  test('nad limitem zwraca yellow', () => {
    assert.equal(getCounterColor(70, 40, 60), "yellow")
  })

  test('boundary: count === min → green', () => {
    assert.equal(getCounterColor(40, 40, 60), "green")
  })

  test('boundary: count === max → green', () => {
    assert.equal(getCounterColor(60, 40, 60), "green")
  })

  test('boundary: count === min - 1 → red', () => {
    assert.equal(getCounterColor(39, 40, 60), "red")
  })

  test('boundary: count === max + 1 → yellow', () => {
    assert.equal(getCounterColor(61, 40, 60), "yellow")
  })

  test('zero zawsze red (poniżej min)', () => {
    assert.equal(getCounterColor(0, 40, 60), "red")
  })
})

// ---------- parseGrade ----------
// Reguły: ARCHITECTURE.md 5.3, RUBRIC.md Sekcja 6.

const VALID_GRADE_RAW = JSON.stringify({
  realizacja_tematu: { punkty: 4, uzasadnienie: "Teza widoczna, ale mogłaby być jaśniejsza." },
  elementy_tworcze: { punkty: 2, uzasadnienie: "Argumentacja schematyczna." },
  kompetencje_literackie: { punkty: 10, uzasadnienie: "Odwołania poprawne, ale powierzchowne. Cytaty bez wyjaśnienia." },
  kompozycja: { punkty: 1, uzasadnienie: "Przejścia abruptne." },
  styl: { punkty: 2, uzasadnienie: "Powtórzenia widoczne." },
  jezyk: { punkty: 1, uzasadnienie: "Kilka błędów interpunkcyjnych." },
  ortografia: { punkty: 1, uzasadnienie: "OK." },
  suma: 21,
  komentarz_ogolny: "Solidne 21/35. Popraw tezę i wyjaśniaj cytaty.",
  trzy_mocne: ["Znajomość Lalki", "Struktura 5 akapitów", "Brak kolokwializmów"],
  trzy_slabe: ["Teza rozmyta", "Cytaty bez analizy", "Powtórzenia"],
  jeden_mnemonik: "PEEL nie PLOT: Point, Evidence, Explain, Link."
})

describe('parseGrade — JSON + fallback', () => {
  test('valid clean JSON → parsed object', () => {
    const g = parseGrade(VALID_GRADE_RAW)
    assert.equal(g.suma, 21)
    assert.equal(g.realizacja_tematu.punkty, 4)
    assert.equal(g.trzy_mocne.length, 3)
  })

  test('JSON z fences ```json``` → parsed', () => {
    const wrapped = "```json\n" + VALID_GRADE_RAW + "\n```"
    const g = parseGrade(wrapped)
    assert.equal(g.suma, 21)
  })

  test('JSON z preambułą → fallback regex parse', () => {
    const wrapped = "Oto ocena:\n\n" + VALID_GRADE_RAW + "\n\nDziękuję."
    const g = parseGrade(wrapped)
    assert.equal(g.suma, 21)
  })

  test('JSON z trailing text → parsed', () => {
    const wrapped = VALID_GRADE_RAW + "\n\nUwagi dodatkowe: brak."
    const g = parseGrade(wrapped)
    assert.equal(g.kompozycja.punkty, 1)
  })

  test('pusty string → throw INVALID_GRADE_FORMAT', () => {
    // Oczekujemy specyficznego błędu implementatora, nie stuba NOT_IMPLEMENTED
    assert.throws(() => parseGrade(""), /INVALID_GRADE_FORMAT|INVALID_FORMAT/i)
  })

  test('tekst bez JSON → throw INVALID_GRADE_FORMAT', () => {
    assert.throws(() => parseGrade("Przepraszam, nie mogę pomóc."), /INVALID_GRADE_FORMAT|INVALID_FORMAT/i)
  })

  test('brak wymaganego pola (ortografia) → throw', () => {
    const obj = JSON.parse(VALID_GRADE_RAW)
    delete obj.ortografia
    assert.throws(() => parseGrade(JSON.stringify(obj)), /MISSING|ortografia/i)
  })

  test('suma niezgodna z cząstkowymi → korekta + _corrected: true', () => {
    // cząstkowe 4+2+10+1+2+1+1 = 21, ale pisze 30
    const obj = JSON.parse(VALID_GRADE_RAW)
    obj.suma = 30
    const g = parseGrade(JSON.stringify(obj))
    assert.equal(g.suma, 21, "suma powinna być skorygowana do sumy cząstkowych")
    assert.equal(g._corrected, true)
  })

  test('punkty poza zakresem (realizacja_tematu.punkty = 99) → throw', () => {
    const obj = JSON.parse(VALID_GRADE_RAW)
    obj.realizacja_tematu.punkty = 99
    assert.throws(() => parseGrade(JSON.stringify(obj)), /RANGE|range|zakres/i)
  })

  test('trzy_mocne nie jest arrayem → throw', () => {
    const obj = JSON.parse(VALID_GRADE_RAW)
    obj.trzy_mocne = "should be array"
    assert.throws(() => parseGrade(JSON.stringify(obj)), /array|ARRAY|mocne/i)
  })

  test('null input → throw', () => {
    assert.throws(() => parseGrade(null), /INVALID|null/i)
  })
})

// ---------- getBudgetRemaining ----------

describe('getBudgetRemaining — rolling 5h window', () => {
  const WINDOW = 5 * 60 * 60 * 1000 // 5h
  const LIMIT = 45

  test('pusty budget → limit pełny', () => {
    const b = { callTimestamps: [], limit: LIMIT, windowMs: WINDOW }
    assert.equal(getBudgetRemaining(b, Date.now()), LIMIT)
  })

  test('3 aktywne calls → limit - 3', () => {
    const now = 10_000_000
    const b = { callTimestamps: [now - 1000, now - 2000, now - 3000], limit: LIMIT, windowMs: WINDOW }
    assert.equal(getBudgetRemaining(b, now), LIMIT - 3)
  })

  test('wszystkie 45 zużyte wewnątrz okna → 0', () => {
    const now = 10_000_000
    const timestamps = Array.from({ length: 45 }, (_, i) => now - i * 1000)
    const b = { callTimestamps: timestamps, limit: LIMIT, windowMs: WINDOW }
    assert.equal(getBudgetRemaining(b, now), 0)
  })

  test('mix aktywnych i stale: 30 w oknie + 20 poza', () => {
    const now = 10_000_000
    const active = Array.from({ length: 30 }, (_, i) => now - i * 1000)
    const stale = Array.from({ length: 20 }, (_, i) => now - WINDOW - 1000 - i * 1000)
    const b = { callTimestamps: [...active, ...stale], limit: LIMIT, windowMs: WINDOW }
    assert.equal(getBudgetRemaining(b, now), LIMIT - 30)
  })

  test('call dokładnie na granicy (now - t === windowMs) → expired', () => {
    const now = 10_000_000
    const b = { callTimestamps: [now - WINDOW], limit: LIMIT, windowMs: WINDOW }
    assert.equal(getBudgetRemaining(b, now), LIMIT, "call dokładnie w miejscu granicy nie jest aktywny")
  })

  test('call 1ms przed granicą → aktywny', () => {
    const now = 10_000_000
    const b = { callTimestamps: [now - WINDOW + 1], limit: LIMIT, windowMs: WINDOW }
    assert.equal(getBudgetRemaining(b, now), LIMIT - 1)
  })

  test('więcej aktywnych niż limit (clamp do 0, nie minus)', () => {
    const now = 10_000_000
    const timestamps = Array.from({ length: 50 }, (_, i) => now - i * 1000)
    const b = { callTimestamps: timestamps, limit: LIMIT, windowMs: WINDOW }
    assert.equal(getBudgetRemaining(b, now), 0)
  })

  test('limit 0 → zawsze 0', () => {
    const b = { callTimestamps: [], limit: 0, windowMs: WINDOW }
    assert.equal(getBudgetRemaining(b, Date.now()), 0)
  })
})

// ---------- pruneStaleBudget ----------

describe('pruneStaleBudget — usuwanie starych timestampów', () => {
  const WINDOW = 5 * 60 * 60 * 1000

  test('brak stale → kopia 1:1 timestampów', () => {
    const now = 10_000_000
    const active = [now - 1000, now - 2000, now - 3000]
    const b = { callTimestamps: active, limit: 45, windowMs: WINDOW }
    const result = pruneStaleBudget(b, now)
    assert.deepEqual(result.callTimestamps, active)
  })

  test('mix aktywnych i stale — zostają tylko aktywne', () => {
    const now = 10_000_000
    const active = [now - 1000, now - 2000]
    const stale = [now - WINDOW - 1, now - WINDOW * 2]
    const b = { callTimestamps: [...stale, ...active], limit: 45, windowMs: WINDOW }
    const result = pruneStaleBudget(b, now)
    assert.equal(result.callTimestamps.length, 2)
    for (const t of result.callTimestamps) {
      assert.ok(now - t < WINDOW)
    }
  })

  test('wszystkie stale → pusta tablica', () => {
    const now = 10_000_000
    const stale = [now - WINDOW - 1, now - WINDOW - 500, now - WINDOW * 3]
    const b = { callTimestamps: stale, limit: 45, windowMs: WINDOW }
    const result = pruneStaleBudget(b, now)
    assert.deepEqual(result.callTimestamps, [])
  })

  test('immutability: nie mutuje inputu', () => {
    const now = 10_000_000
    const original = [now - 1000, now - WINDOW - 1]
    const b = { callTimestamps: original, limit: 45, windowMs: WINDOW }
    const frozen = [...original]
    const result = pruneStaleBudget(b, now)
    // Input niezmieniony
    assert.deepEqual(b.callTimestamps, frozen)
    // Output to nowa tablica
    assert.notEqual(result.callTimestamps, b.callTimestamps)
  })

  test('zachowuje limit i windowMs', () => {
    const now = 10_000_000
    const b = { callTimestamps: [], limit: 45, windowMs: WINDOW }
    const result = pruneStaleBudget(b, now)
    assert.equal(result.limit, 45)
    assert.equal(result.windowMs, WINDOW)
  })
})

// ---------- migrate ----------
// Reguły: ARCHITECTURE.md 4.4.

describe('migrate — schema migrations', () => {
  const CURRENT = 1

  test('v1 → v1 identity (raw wraca)', () => {
    const raw = {
      schemaVersion: 1,
      draftId: "draft-2026-04-24-1430",
      topic: "Test",
      lectures: ["Pan Tadeusz", "Lalka", "Dżuma"],
      paragraphs: { intro: "", arg1: "", arg2: "", arg3: "", conclusion: "" },
      feedback: { intro: null, arg1: null, arg2: null, arg3: null, conclusion: null },
      grade: null,
      budget: { callTimestamps: [] },
      savedAt: 1745522400000
    }
    const result = migrate(raw, CURRENT)
    assert.equal(result.schemaVersion, 1)
    assert.equal(result.topic, "Test")
  })

  test('brak schemaVersion → null (korupcja)', () => {
    const raw = { topic: "Test" }
    assert.equal(migrate(raw, CURRENT), null)
  })

  test('schemaVersion nowszy niż current (downgrade niemożliwy) → null', () => {
    const raw = { schemaVersion: 99, topic: "Future" }
    assert.equal(migrate(raw, CURRENT), null)
  })

  test('null input → null', () => {
    assert.equal(migrate(null, CURRENT), null)
  })

  test('pusty obiekt {} → null (brak schemaVersion)', () => {
    assert.equal(migrate({}, CURRENT), null)
  })

  test('schemaVersion jako string "1" → null (strict)', () => {
    // Decyzja Q: strict, nie coerce
    const raw = { schemaVersion: "1", topic: "Test" }
    assert.equal(migrate(raw, CURRENT), null)
  })
})

// ---------- composeExport ----------

describe('composeExport — format clipboard', () => {
  test('pełna rozprawka: TEMAT + 5 akapitów', () => {
    const topic = "Czy literatura może zmienić człowieka?"
    const paragraphs = {
      intro: "Wstęp z tezą.",
      arg1: "Argument pierwszy.",
      arg2: "Argument drugi.",
      arg3: "Argument trzeci.",
      conclusion: "Konkluzja."
    }
    const result = composeExport(topic, paragraphs)
    assert.match(result, /TEMAT.*Czy literatura/)
    assert.match(result, /Wstęp z tezą/)
    assert.match(result, /Argument pierwszy/)
    assert.match(result, /Argument drugi/)
    assert.match(result, /Argument trzeci/)
    assert.match(result, /Konkluzja/)
  })

  test('polskie znaki zachowane', () => {
    const topic = "Żółć, źdźbło, człowiek"
    const paragraphs = { intro: "Gżegżółka.", arg1: "", arg2: "", arg3: "", conclusion: "" }
    const result = composeExport(topic, paragraphs)
    assert.match(result, /Żółć/)
    assert.match(result, /Gżegżółka/)
  })

  test('puste akapity nie łamią formatu', () => {
    const paragraphs = { intro: "A", arg1: "", arg2: "", arg3: "", conclusion: "B" }
    const result = composeExport("Temat X", paragraphs)
    // Nie crashuje, zawiera A i B
    assert.match(result, /A/)
    assert.match(result, /B/)
  })

  test('whitespace wokół akapitów jest trimowany', () => {
    const paragraphs = { intro: "   Wstęp.   ", arg1: "", arg2: "", arg3: "", conclusion: "" }
    const result = composeExport("T", paragraphs)
    // Wynik nie zawiera bezpośredniego "   Wstęp.   " z whitespace padding
    assert.match(result, /Wstęp\./)
    assert.doesNotMatch(result, /   Wstęp\.   /)
  })

  test('długie akapity (>200 słów) nie są obcinane', () => {
    const longPara = Array(300).fill("słowo").join(" ")
    const paragraphs = { intro: "X", arg1: longPara, arg2: "", arg3: "", conclusion: "" }
    const result = composeExport("T", paragraphs)
    // Wszystkie 300 "słowo" obecne
    const matches = result.match(/słowo/g)
    assert.ok(matches && matches.length >= 300, `oczekiwano >=300 wystąpień "słowo", było ${matches?.length}`)
  })
})

// ========== SUMMARY ==========
//
// Po uruchomieniu `node harness.js` (lub `node --test harness.js`)
// runner sam wypisze passed/failed/total.
//
// Stan RED (teraz): wszystkie testy failują z NOT_IMPLEMENTED.
// Stan GREEN (po implementacji): wszystkie zielone.
//
// Liczba testów (sanity check):
//   wordCount:            17
//   getCounterColor:       8
//   parseGrade:           11
//   getBudgetRemaining:    8
//   pruneStaleBudget:      5
//   migrate:               6
//   composeExport:         5
//   --------------------------
//   TOTAL:                60
//
// Implementator: zastąp stuby realną logiką i uruchom ponownie.
// Uruchamianie:
//   node harness.js
//   (domyślnie Node 18+ automatycznie wykrywa i uruchamia testy zdefiniowane przez node:test)
