// logic.js — pure functions dla Rozprawka Scaffolder
// Brak zależności od React, window.*, DOM. Testowalne w Node.js przez harness.js.
//
// Eksport CommonJS na końcu pliku.

// ============================================================
// 1. wordCount — CKE rules
// ============================================================
// Split po whitespace (\s+), filtruj puste tokeny, count.
// Skróty "np." nie są rozbijane (kropka to nie whitespace).
// Hyphen-words "biało-czerwony" = 1 słowo.
// ZWSP (\u200B) NIE jest \s w JS regex → tekst przyklejony przez ZWSP = 1 słowo.

function wordCount(text) {
  if (text == null || typeof text !== "string") return 0
  if (text.length === 0) return 0
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

// ============================================================
// 2. getCounterColor — kolory licznika słów
// ============================================================
// count < min → "red"; count > max → "yellow"; else → "green"
// Edge: count === min → green; count === max → green

function getCounterColor(count, min, max) {
  if (count < min) return "red"
  if (count > max) return "yellow"
  return "green"
}

// ============================================================
// 3. parseGrade — JSON parser z fallback regex + walidacja
// ============================================================
// Schema z RUBRIC.md sekcja 6.

const REQUIRED_GRADE_FIELDS = [
  "realizacja_tematu",
  "elementy_tworcze",
  "kompetencje_literackie",
  "kompozycja",
  "styl",
  "jezyk",
  "ortografia",
  "suma",
  "komentarz_ogolny",
  "trzy_mocne",
  "trzy_slabe",
  "jeden_mnemonik"
]

const CRITERION_RANGES = {
  realizacja_tematu: [0, 6],
  elementy_tworcze: [0, 4],
  kompetencje_literackie: [0, 16],
  kompozycja: [0, 2],
  styl: [0, 4],
  jezyk: [0, 2],
  ortografia: [0, 1]
}

const SCORED_FIELDS = Object.keys(CRITERION_RANGES) // 7 kryteriów

function parseGrade(rawResponse) {
  if (rawResponse == null || typeof rawResponse !== "string") {
    throw new Error("INVALID_GRADE_FORMAT: input null/non-string")
  }

  // Krok 1: czyść whitespace + ```json``` fences
  let cleaned = rawResponse.trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim()

  if (cleaned.length === 0) {
    throw new Error("INVALID_GRADE_FORMAT: pusty po wyczyszczeniu")
  }

  // Krok 2: spróbuj JSON.parse, fallback do regex extract
  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch (e) {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) {
      throw new Error("INVALID_GRADE_FORMAT: brak bloku JSON")
    }
    try {
      parsed = JSON.parse(match[0])
    } catch (e2) {
      throw new Error("INVALID_GRADE_FORMAT: regex extract failed")
    }
  }

  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("INVALID_GRADE_FORMAT: not a JSON object")
  }

  // Krok 3: walidacja required fields
  for (const field of REQUIRED_GRADE_FIELDS) {
    if (!(field in parsed)) {
      throw new Error(`MISSING_FIELD: ${field}`)
    }
  }

  // Krok 4: walidacja typów dla scored fields
  for (const field of SCORED_FIELDS) {
    const obj = parsed[field]
    if (obj == null || typeof obj !== "object" || typeof obj.punkty !== "number") {
      throw new Error(`INVALID_FIELD: ${field} must be {punkty, uzasadnienie}`)
    }
    const [min, max] = CRITERION_RANGES[field]
    if (obj.punkty < min || obj.punkty > max) {
      throw new Error(`RANGE_ERROR: ${field}.punkty=${obj.punkty} poza zakresem ${min}-${max}`)
    }
  }

  // Krok 5: arrayy
  if (!Array.isArray(parsed.trzy_mocne)) {
    throw new Error("INVALID_FIELD: trzy_mocne must be array")
  }
  if (!Array.isArray(parsed.trzy_slabe)) {
    throw new Error("INVALID_FIELD: trzy_slabe must be array")
  }

  // Krok 6: sanity check sumy
  if (typeof parsed.suma !== "number") {
    throw new Error("INVALID_FIELD: suma must be number")
  }

  const sumComputed = SCORED_FIELDS.reduce((acc, k) => acc + parsed[k].punkty, 0)
  if (Math.abs(sumComputed - parsed.suma) > 0.5) {
    parsed.suma = sumComputed
    parsed._corrected = true
  }

  return parsed
}

// ============================================================
// 4. getBudgetRemaining — rolling 5h window
// ============================================================
// budget = { callTimestamps, limit, windowMs }
// Aktywny: now - t < windowMs (granica włącznie po prawej, t === now-window jest expired)
// Clamp do 0 (nigdy nie minus).

function getBudgetRemaining(budget, now) {
  if (now == null) now = Date.now()
  const active = budget.callTimestamps.filter(t => now - t < budget.windowMs)
  const remaining = budget.limit - active.length
  return remaining < 0 ? 0 : remaining
}

// ============================================================
// 5. pruneStaleBudget — immutable usuwanie starych
// ============================================================

function pruneStaleBudget(budget, now) {
  if (now == null) now = Date.now()
  const fresh = budget.callTimestamps.filter(t => now - t < budget.windowMs)
  return {
    ...budget,
    callTimestamps: fresh
  }
}

// ============================================================
// 6. migrate — schema versioning
// ============================================================
// Strict: schemaVersion musi być number === currentVersion. Inaczej null.

function migrate(rawStorageData, currentVersion) {
  if (currentVersion == null) currentVersion = 1
  if (rawStorageData == null) return null
  if (typeof rawStorageData !== "object") return null
  if (typeof rawStorageData.schemaVersion !== "number") return null
  if (rawStorageData.schemaVersion === currentVersion) return rawStorageData
  // Wersja nowsza niż current → null
  if (rawStorageData.schemaVersion > currentVersion) return null
  // Wersja starsza → w MVP brak migrators (jedyna wersja to v1) → null
  return null
}

// ============================================================
// 7. composeExport — format clipboard
// ============================================================
// "TEMAT: <topic>\n\n<intro>\n\n<arg1>\n\n<arg2>\n\n<arg3>\n\n<conclusion>"
// Puste akapity są pomijane (nie zostawiamy double-blank lines).
// Trim per akapit żeby usunąć padding whitespace.

function composeExport(topic, paragraphs) {
  const order = ["intro", "arg1", "arg2", "arg3", "conclusion"]
  const trimmedTopic = (topic || "").trim()
  const blocks = []

  if (trimmedTopic.length > 0) {
    blocks.push(`TEMAT: ${trimmedTopic}`)
  } else {
    blocks.push("TEMAT: (brak)")
  }

  for (const key of order) {
    const raw = paragraphs?.[key]
    if (raw == null) continue
    const trimmed = String(raw).trim()
    if (trimmed.length === 0) continue
    blocks.push(trimmed)
  }

  return blocks.join("\n\n")
}

// ============================================================
// 8. isEligibleForGrading
// ============================================================
// Wymagania: total >= 300, wszystkie 3 lektury wybrane, topic > 10 znaków

function isEligibleForGrading(state) {
  if (!state) return false
  const totalWords = ["intro", "arg1", "arg2", "arg3", "conclusion"]
    .reduce((sum, k) => sum + wordCount(state.paragraphs?.[k] || ""), 0)
  if (totalWords < 300) return false
  if (!state.topic || typeof state.topic !== "string" || state.topic.length <= 10) return false
  if (!Array.isArray(state.lectures)) return false
  if (state.lectures.length < 3) return false
  if (!state.lectures.every(l => typeof l === "string" && l !== "")) return false
  return true
}

// ============================================================
// 9. formatCountdown
// ============================================================
// Diff w ms. Format zgodny z TESTS sekcja 2.

function formatCountdown(targetDate, now) {
  if (now == null) now = Date.now()
  const target = targetDate instanceof Date ? targetDate.getTime() : targetDate
  const diffMs = target - now

  const ONE_MIN = 60 * 1000
  const ONE_HOUR = 60 * ONE_MIN
  const ONE_DAY = 24 * ONE_HOUR

  if (diffMs < -ONE_HOUR) return "PO MATURZE"
  if (Math.abs(diffMs) < ONE_HOUR) return "MATURA DZIŚ"
  if (diffMs < 0) return "PO MATURZE"

  if (diffMs >= ONE_DAY) {
    const days = Math.floor(diffMs / ONE_DAY)
    return `${days} dni`
  }
  if (diffMs >= ONE_HOUR) {
    const hours = Math.floor(diffMs / ONE_HOUR)
    return `${hours} godz.`
  }
  const minutes = Math.floor(diffMs / ONE_MIN)
  return `${minutes} min`
}

// ============================================================
// 10. sanitizeForStorage — trim state przed save
// ============================================================

function sanitizeForStorage(state) {
  if (!state) return null
  const out = {
    schemaVersion: state.schemaVersion,
    draftId: state.draftId,
    savedAt: Date.now(),
    topic: state.topic,
    lectures: state.lectures,
    paragraphs: state.paragraphs,
    feedback: state.feedback,
    grade: state.grade,
    budget: {
      callTimestamps: state.budget?.callTimestamps || []
    }
  }
  return out
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  wordCount,
  getCounterColor,
  parseGrade,
  getBudgetRemaining,
  pruneStaleBudget,
  migrate,
  composeExport,
  isEligibleForGrading,
  formatCountdown,
  sanitizeForStorage
}
