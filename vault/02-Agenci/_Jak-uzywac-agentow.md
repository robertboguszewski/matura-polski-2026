---
name: Jak używać agentów
description: Instrukcja obsługi 4 agentów AI przygotowujących do matury z polskiego 2026
type: instrukcja
tags: [agent, prompt, matura-2026, instrukcja]
wersja: 1.0
aktualizacja: 2026-04-22
---

# 📖 Jak używać agentów AI do matury z polskiego

> **TL;DR:** Masz 4 gotowe prompty. Każdy zamienia zwykły chatbot (Claude lub ChatGPT) w wyspecjalizowanego asystenta. Kopiujesz prompt, wklejasz do czatu, mówisz czego potrzebujesz i pracujesz.

---

## 🤖 Czym są "agenci"?

W tym vaulcie **agent** to **długi, precyzyjnie napisany prompt systemowy**, który zamienia ogólnego chatbota w wyspecjalizowanego asystenta. To nie osobna aplikacja — to instrukcja dla modelu językowego (Claude, ChatGPT, Gemini), jak ma się zachowywać, jakim językiem mówić, czego pilnować.

Mamy 4 agentów, bo matura z polskiego wymaga **4 różnych trybów pracy**:

| Agent | Tryb | Kiedy używasz |
|-------|------|---------------|
| **📅 Plan Nauki** | planowanie | rano, przed sesją nauki |
| **🎓 Egzaminator** | symulacja | gdy chcesz poczuć stres matury |
| **📚 Korepetytor** | nauczanie | gdy czegoś nie rozumiesz |
| **🔮 Analityk Pytań** | prognozowanie | gdy chcesz wiedzieć, co prawdopodobnie wypadnie |

---

## 🚀 Jak uruchomić agenta (wersja podstawowa, 3 minuty)

### Krok 1 — Wybierz agenta
Otwórz odpowiedni plik w folderze `02-Agenci/`. Każdy ma sekcję **"Prompt systemowy (skopiuj całość)"** — to jest serce agenta.

### Krok 2 — Skopiuj prompt
Zaznacz **cały tekst w bloku kodu** (od ``` do ```) i skopiuj (Ctrl+C / Cmd+C).

### Krok 3 — Otwórz Claude lub ChatGPT
- **Claude (zalecane)** → https://claude.ai
- **ChatGPT** → https://chat.openai.com

Załóż **nowy czat** (ważne — inaczej agent "pomiesza się" z poprzednią rozmową).

### Krok 4 — Wklej prompt jako PIERWSZĄ wiadomość
Po prostu Ctrl+V / Cmd+V i wyślij. Agent odpowie krótkim potwierdzeniem ("Cześć, jestem Twoim Egzaminatorem…") i zapyta o dane wejściowe.

### Krok 5 — Dodaj materiał z vaulta
Przeciągnij pliki z vaulta (np. `profil-ucznia.md`, `historia-odpowiedzi.md`, konspekt lektury) **do okna czatu** — Claude i ChatGPT obsługują załączniki.

Jeżeli nie obsługują (np. stara wersja) — skopiuj zawartość pliku i wklej jako drugą wiadomość, poprzedzoną: *"Oto mój profil ucznia: […]"*.

### Krok 6 — Pracuj
Agent prowadzi rozmowę. Ty tylko odpowiadasz na pytania.

---

## 🎛 Która aplikacja lepsza?

| Aplikacja | Plusy | Minusy |
|-----------|-------|--------|
| **Claude (claude.ai)** | długi kontekst (200k tokenów), świetnie czyta załączniki, polski na poziomie C2, pamięta konwencje literaturoznawcze | limit wiadomości w planie darmowym |
| **ChatGPT (GPT-4)** | dłuższa pamięć w Projects, wygodne Custom GPTs | słabszy w analizie literackiej po polsku, częściej halucynuje przy cytatach |
| **Gemini** | integracja z Google Docs | nie polecam — często myli fakty o lekturach |

**Rekomendacja:** Claude do egzaminatora, korepetytora i analityka; ChatGPT może być do planu nauki (bo lubi listy TODO).

---

## 📊 Tabela decyzyjna — którego agenta wybrać?

Odpowiedz sobie na pytanie: **"Co chcę teraz osiągnąć?"**

| Cel / sytuacja | Agent | Czas |
|----------------|-------|------|
| "Mam dziś 90 minut — co robić?" | 📅 **Plan Nauki** | 5 min planowania + 90 min nauki |
| "Chcę sprawdzić, czy ogarniam *Lalkę*" | 🎓 **Egzaminator** (tryb ustny) | 20 min |
| "Piszę rozprawkę — oceń" | 🎓 **Egzaminator** (tryb pisemny) | 30 min |
| "Nie rozumiem romantyzmu" | 📚 **Korepetytor** | 20–40 min |
| "Zrób mi fiszki z *Dziadów cz. III*" | 📚 **Korepetytor** | 15 min |
| "Przepytaj mnie z 20 pytań jawnych" | 📚 **Korepetytor** (tryb flash) | 20 min |
| "Co najprawdopodobniej będzie na maturze 2026?" | 🔮 **Analityk Pytań** | 15 min |
| "Które lektury na pewno muszę ogarnąć?" | 🔮 **Analityk Pytań** | 10 min |
| "Zbliża się matura — stresuję się" | 🎓 **Egzaminator** (tryb łagodny) | 30 min |

---

## 🔄 Jak łączyć agentów (workflow tygodniowy)

**Poniedziałek rano:** Plan Nauki → ustala cele na tydzień
**Codziennie:** Plan Nauki (5 min) → Korepetytor (45 min) → Korepetytor fiszki (15 min)
**Co 3 dni:** Egzaminator (symulacja 30 min)
**Co tydzień (niedziela):** Analityk Pytań (10 min) — aktualizuje prognozy

---

## ⚙️ Wersja zaawansowana — Claude Code / API

Jeżeli używasz **Claude Code** (CLI) albo piszesz własną automatyzację przez API, każdy agent to po prostu **system prompt**.

### Claude Code (zalecane dla tego vaulta)

W katalogu `/Matura Polski/` mamy `CLAUDE.md` — plik kontekstowy, który Claude Code czyta automatycznie. Dzięki temu uruchamiając:

```bash
cd "/Matura Polski"
claude
```

…Claude już zna Twój profil, historię i strukturę vaulta. Wystarczy powiedzieć: *"Uruchom Agenta-Egzaminatora, tryb ustny, lektura: Pan Tadeusz"* i Claude załaduje odpowiedni prompt.

### API (Python, Node)

```python
from anthropic import Anthropic

client = Anthropic()
with open("02-Agenci/Agent-Egzaminator.md") as f:
    system_prompt = f.read()  # wyciągnij blok "Prompt systemowy"

response = client.messages.create(
    model="claude-opus-4-7",
    system=system_prompt,
    messages=[{"role": "user", "content": "Zacznijmy symulację ustną, lektura Lalka"}]
)
```

### Automatyzacje

- **Rano codziennie:** cron uruchamia Plan Nauki i wysyła Ci plan mailem
- **Wieczorem:** Analityk Pytań aktualizuje `01-Analiza-Pytan/prognoza-2026.md`
- **Po każdej sesji:** agent zapisuje postęp do `06-Historia-Nauki/`

Szczegóły w `05-Szablony/automatyzacje.md`.

---

## 🛟 Troubleshooting

**"Agent nie pamięta, co mówiliśmy 10 wiadomości temu"**
→ Normalne. LLM ma ograniczony kontekst. Na początku długiej sesji przeklej kluczowe dane (np. `profil-ucznia.md`).

**"Agent halucynuje cytaty z lektur"**
→ Zawsze weryfikuj cytaty z `00-Baza-Wiedzy/`. Jeżeli agent cytuje coś, czego nie ma w vaulcie — nie ufaj.

**"Agent jest zbyt łagodny / zbyt ostry"**
→ Sekcja "Warianty" w każdym pliku agenta pokazuje, jak zmienić ton.

**"Chcę agenta po angielsku / z innym stylem"**
→ Edytuj prompt. To tylko tekst.

---

## 🔗 Powiązane pliki

- [[CLAUDE|CLAUDE.md]] — kontekst całego vaulta
- [[MOC.md]] — mapa treści
- [[06-Historia-Nauki/profil-ucznia|profil-ucznia]] — wymagane przez Plan Nauki
- [[06-Historia-Nauki/historia-odpowiedzi|historia-odpowiedzi]] — czytane przez wszystkich agentów
- [[01-Analiza-Pytan/Przewidywania-2026|prognoza-2026]] — aktualizowane przez Analityka

---

**Data matury pisemnej:** 5 maja 2026
**Dni do matury:** ~13 (stan na 22 kwietnia 2026)

Powodzenia 💪
