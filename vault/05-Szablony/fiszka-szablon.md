---
name: Szablon fiszki
description: Uniwersalny szablon fiszki pamięciowej — zasada aktywnego przypominania + hak mnemoniczny.
type: szablon
tags: [szablon, fiszka, spaced-repetition]
---

# 🃏 Szablon fiszki

> **Zasada:** jedna fiszka = jedno pojęcie/fakt. Przód = pytanie. Tył = odpowiedź + hak pamięciowy + kontekst.

---

## Format podstawowy

```markdown
## [Nazwa pojęcia / pytanie]
**Tag:** #lektura / #epoka / #srodek / #motyw / #cytat / #data
**Poziom:** [1d / 3d / 7d / 14d / 30d]
**Ostatnia ocena:** [✅ / ⚠️ / ❌]
**Data dodania:** YYYY-MM-DD

### Przód (pytanie)
[Krótkie, konkretne pytanie — "Kto napisał X?" / "Zdefiniuj Y"]

### Tył (odpowiedź)
[Odpowiedź — max 3 linie]

### 🧠 Hak pamięciowy
[Mnemonik: akronim / rym / skojarzenie absurdalne / metafora wizualna]

### 🔗 Kontekst
[1-2 zdania: gdzie się to przyda na maturze, z jaką lekturą/motywem łączyć]
```

---

## Przykład 1 — fiszka faktograficzna (autor + dzieło)

```markdown
## Kto napisał *Dziady cz. III*?
**Tag:** #lektura #romantyzm #mickiewicz
**Poziom:** 3d
**Ostatnia ocena:** ⚠️
**Data:** 2026-04-22

### Przód
Kto napisał *Dziady cz. III* i w jakim roku/mieście?

### Tył
**Adam Mickiewicz, 1832, Drezno** (stąd "Dziady drezdeńskie").

### 🧠 Hak
**"Dziady w Dreźnie pisze Adam, bo Adam był tam"** (rym). Nie mylić ze Słowackim — on napisał *Kordiana* (1834) jako polemikę.

### 🔗 Kontekst
Używaj jako kontekst do tematów: bunt wobec Boga, patriotyzm, mesjanizm. Scena kluczowa: Wielka Improwizacja (akt 3 sc. 5).
```

---

## Przykład 2 — fiszka pojęciowa (środek stylistyczny)

```markdown
## Oksymoron
**Tag:** #srodek #teoria
**Poziom:** 7d
**Ostatnia ocena:** ✅
**Data:** 2026-04-22

### Przód
Co to jest oksymoron? Podaj 2 przykłady.

### Tył
**Oksymoron** (epitet sprzeczny) — zestawienie dwóch słów o **przeciwstawnym** znaczeniu.
Przykłady: "żywy trup", "gorący lód", "głośna cisza".

### 🧠 Hak
**OKSY-MORON = "ostry głupiec"** — już sama nazwa to oksymoron! Dwa przeciwieństwa w uścisku.

### 🔗 Kontekst
Najczęściej w baroku (DYSONANS) i romantyzmie. Nie mylić z **metaforą** (która przenosi znaczenie, nie łączy sprzeczności). Występuje u Sępa-Szarzyńskiego, Mickiewicza ("poeta-wieszcz", "trumna-kolebka").
```

---

## Przykład 3 — fiszka datowa

```markdown
## 1822 — co się wydarzyło?
**Tag:** #data #romantyzm
**Poziom:** 1d
**Ostatnia ocena:** ❌
**Data:** 2026-04-22

### Przód
Rok 1822 — co zaczęło się w literaturze polskiej?

### Tył
**Początek romantyzmu w Polsce** — wydanie *Ballad i romansów* Adama Mickiewicza (Wilno, tom I *Poezji*).

### 🧠 Hak
**"1822 = jedna-ósma-dwu-dwa"** — liczby jak Mickiewicz w Wilnie: młody, w 8. klasie rozumu, wśród 2 ballad na 2 strony.
Albo: **1822 → 18 Ballad dwóch Romansów** (fałszywie, ale zapamiętasz).

### 🔗 Kontekst
Pamiętaj: nie mylić z 1830 (powstanie listopadowe) i 1832 (*Dziady III*, *Pan Tadeusz* — 1834).
```

---

## Przykład 4 — fiszka cytatowa

```markdown
## "Szkiełko i oko"
**Tag:** #cytat #romantyzm #mickiewicz
**Poziom:** 14d
**Ostatnia ocena:** ✅
**Data:** 2026-04-22

### Przód
Skąd cytat "Szkiełko i oko"? Co symbolizuje?

### Tył
**Adam Mickiewicz, *Romantyczność*** (z *Ballad i romansów*, 1822).
Symbol **racjonalizmu oświeceniowego** — w przeciwieństwie do "czucia i wiary" romantyków.
Kontekst: "Miej serce i patrzaj w serce!" — manifest romantyczny.

### 🧠 Hak
**"SzKiełko i oKo — szKieletK Oświecenia"** (aliteracja + kontekst epoki). Starzec = oświecenie, Karusia = romantyzm.

### 🔗 Kontekst
Używaj do: konflikt rozum-uczucie, manifest epoki, literatura jako polemika. Para: *Oda do młodości* Mickiewicza (też 1822).
```

---

## Przykład 5 — fiszka motywu

```markdown
## Motyw tyrtejski
**Tag:** #motyw #patriotyzm
**Poziom:** 3d
**Ostatnia ocena:** ⚠️
**Data:** 2026-04-22

### Przód
Co to motyw tyrtejski? Podaj 2 lektury.

### Tył
**Motyw tyrtejski** — wezwanie do walki za ojczyznę, bohaterskiej śmierci za wspólnotę. Od **Tyrteusza** — poety spartańskiego VII w. p.n.e.
Lektury: *Pieśń o żołnierzach z Westerplatte* Gałczyńskiego, *Gloria victis* Orzeszkowej, *Reduta Ordona* Mickiewicza.

### 🧠 Hak
**"TYRT = Trzeba Umrzeć Ratując Tamtych"** (akronim).

### 🔗 Kontekst
Wraca w: romantyzmie, Młodej Polsce, poezji wojennej (Baczyński!). Antyteza: **motyw antywojenny** (Borowski, Herling).
```

---

## Technika powtórek (spaced repetition)

Każda fiszka przechodzi przez cykl:
- **Dzień 1** (dodanie) — pierwsze sprawdzenie
- **+1 dzień** — drugie sprawdzenie
- **+3 dni** — trzecie
- **+7 dni** — czwarte
- **+14 dni** — piąte
- **+30 dni** — ostateczne utrwalenie

**Zasada:** jeśli odpowiesz **źle** na którymkolwiek etapie → **reset do dnia 1**.

Prowadź kolejkę w: [[06-Historia-Nauki/powtorki|powtorki.md]]

---

## 🔗 Powiązane
- [[04-Fiszki/Fiszki-motywy|Fiszki-motywy]]
- [[04-Fiszki/Fiszki-epoki|Fiszki-epoki]]
- [[04-Fiszki/Fiszki-srodki-stylistyczne|Fiszki-srodki-stylistyczne]]
- [[06-Historia-Nauki/powtorki|Kolejka powtórek]]
- [[02-Agenci/Agent-Korepetytor|Agent-Korepetytor]] (generator nowych fiszek)
