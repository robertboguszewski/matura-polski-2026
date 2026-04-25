// claude-api.js — uniwersalny wrapper inferencji
// Wykrywa kontekst uruchomienia i wybiera najlepszy dostępny backend:
//   1. claude.ai artifact      → window.claude.complete (Sonnet, billing user'a)
//   2. Cowork artifact         → window.cowork.sample   (Haiku, billing user'a)
//   3. GitHub Pages / przeglądarka samodzielna → Anthropic API direct browser (wymaga klucza)
//
// API: window.matura.callClaude(prompt: string): Promise<string>

(function() {
  const API_KEY_STORAGE = "matura-anthropic-api-key";
  const MODEL_STORAGE = "matura-model";
  const DEFAULT_MODEL = "claude-sonnet-4-5";  // domyślnie Sonnet 4.5 (good balance jakości/kosztu)

  // === DETEKCJA KONTEKSTU ===
  function detectMode() {
    if (typeof window !== "undefined") {
      if (window.claude && typeof window.claude.complete === "function") return "claude.ai";
      if (window.cowork && typeof window.cowork.sample === "function") return "cowork";
    }
    return "browser";  // standalone (GitHub Pages, lokalny plik, itp.)
  }

  // === BACKENDY ===

  async function callClaudeAi(prompt) {
    return await window.claude.complete(prompt);
  }

  async function callCowork(prompt) {
    return await window.cowork.sample(prompt);
  }

  async function callAnthropicDirect(prompt) {
    const key = getApiKey();
    if (!key) throw new Error("MISSING_API_KEY");
    const model = localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL;
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      if (resp.status === 401) throw new Error("INVALID_API_KEY");
      if (resp.status === 429) throw new Error("RATE_LIMIT");
      throw new Error("API_ERROR_" + resp.status + ": " + text.slice(0, 200));
    }
    const data = await resp.json();
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error("INVALID_RESPONSE_SHAPE");
    }
    return data.content[0].text;
  }

  // === KEY MANAGEMENT ===

  function getApiKey() {
    try { return localStorage.getItem(API_KEY_STORAGE) || null; } catch (e) { return null; }
  }
  function setApiKey(key) {
    try { localStorage.setItem(API_KEY_STORAGE, key); return true; } catch (e) { return false; }
  }
  function clearApiKey() {
    try { localStorage.removeItem(API_KEY_STORAGE); } catch (e) {}
  }

  function getModel() {
    return localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL;
  }
  function setModel(m) {
    try { localStorage.setItem(MODEL_STORAGE, m); } catch (e) {}
  }

  // === MAIN API ===

  async function callClaude(prompt) {
    const mode = detectMode();
    if (mode === "claude.ai") return callClaudeAi(prompt);
    if (mode === "cowork") return callCowork(prompt);
    return callAnthropicDirect(prompt);
  }

  function getModeLabel() {
    const mode = detectMode();
    if (mode === "claude.ai") return "Sonnet (Claude.ai)";
    if (mode === "cowork") return "Haiku (Cowork)";
    if (getApiKey()) return getModel() + " (Anthropic API)";
    return "Brak (wymaga API key)";
  }

  // === API KEY MODAL (dla trybu browser) ===

  function showApiKeyModal(onSet) {
    if (document.getElementById("matura-apikey-modal")) return;
    const overlay = document.createElement("div");
    overlay.id = "matura-apikey-modal";
    overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(28,25,23,0.7);display:flex;align-items:center;justify-content:center;padding:16px;";
    overlay.innerHTML = `
      <div style="background:white;border-radius:12px;max-width:520px;width:100%;padding:24px;font-family:-apple-system,system-ui,sans-serif;">
        <h2 style="margin:0 0 12px 0;font-size:18px;">🔑 Klucz API Anthropic</h2>
        <p style="font-size:13px;color:#44403c;margin:0 0 12px 0;">
          Aby używać tego artifactu w przeglądarce (poza Claude.ai i Cowork), potrzebujesz klucza API Anthropic.
        </p>
        <ol style="font-size:12px;color:#57534e;padding-left:18px;margin:0 0 12px 0;">
          <li>Załóż konto na <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a></li>
          <li>Wygeneruj klucz w sekcji <strong>API Keys</strong></li>
          <li>Doładuj kredyt (min ~$5 wystarcza na ~tysiące zapytań)</li>
          <li>Wklej klucz tutaj — zostanie zapisany TYLKO w Twojej przeglądarce (localStorage)</li>
        </ol>
        <div style="background:#fef3c7;border:1px solid #fde68a;padding:8px;border-radius:6px;font-size:11px;color:#78350f;margin-bottom:12px;">
          ⚠️ <strong>Bezpieczeństwo:</strong> klucz jest wysyłany bezpośrednio do api.anthropic.com z Twojej przeglądarki (CORS-enabled przez header <code>anthropic-dangerous-direct-browser-access</code>). Nie udostępniaj tego klucza ani strony — ktoś z dostępem do Twojego klucza może wydać Twój budżet.
        </div>
        <label style="display:block;font-size:12px;margin-bottom:4px;">Klucz API:</label>
        <input id="matura-apikey-input" type="password" placeholder="sk-ant-api03-..." style="width:100%;padding:8px;border:1px solid #e7e5e4;border-radius:6px;font:inherit;font-size:12px;font-family:monospace;" />
        <label style="display:block;font-size:12px;margin:10px 0 4px 0;">Model:</label>
        <select id="matura-model-input" style="width:100%;padding:8px;border:1px solid #e7e5e4;border-radius:6px;font:inherit;">
          <option value="claude-sonnet-4-5">claude-sonnet-4-5 (zalecane — balans jakości/kosztu)</option>
          <option value="claude-opus-4-5">claude-opus-4-5 (najwyższa jakość, drogi)</option>
          <option value="claude-haiku-4-5">claude-haiku-4-5 (najtańszy, słabszy w analizie)</option>
        </select>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;">
          <button id="matura-apikey-cancel" style="padding:8px 14px;background:#f5f5f4;border:1px solid #e7e5e4;border-radius:6px;cursor:pointer;font:inherit;">Anuluj</button>
          <button id="matura-apikey-save" style="padding:8px 14px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;font:inherit;font-weight:600;">Zapisz i włącz</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const input = document.getElementById("matura-apikey-input");
    const modelSel = document.getElementById("matura-model-input");
    modelSel.value = getModel();
    document.getElementById("matura-apikey-save").addEventListener("click", () => {
      const k = input.value.trim();
      if (!k.startsWith("sk-ant-")) {
        alert("Klucz powinien zaczynać się od 'sk-ant-'");
        return;
      }
      setApiKey(k);
      setModel(modelSel.value);
      overlay.remove();
      if (onSet) onSet();
    });
    document.getElementById("matura-apikey-cancel").addEventListener("click", () => overlay.remove());
    input.focus();
  }

  // === EXPORT ===
  window.matura = {
    callClaude,
    detectMode,
    getModeLabel,
    getApiKey,
    setApiKey,
    clearApiKey,
    showApiKeyModal,
    getModel,
    setModel
  };
})();
