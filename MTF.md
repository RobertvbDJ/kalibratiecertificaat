---
name: weegschaal-mtf
description: Bereken de MTF (Maximaal Toelaatbare Fout) en klasse van een weegschaal op basis van OIML R76. Gebruik deze skill altijd wanneer de gebruiker vraagt naar de MTF, maximaal toelaatbare fout, weegschaalklasse, verificatiefout, of termen zoals klasse I/II/III/IIII, e-waarde, d-waarde, capaciteit van een weegschaal, of wanneer er sprake is van weegschaalkeuring, verificatie of kalibratie. Ook bij vragen als "wat is de MTF van mijn weegschaal", "welke klasse heeft deze weegschaal" of "klopt deze fout binnen de norm".
---

# Weegschaal MTF & Klasse Calculator (OIML R76)

Bereken de Maximaal Toelaatbare Fout (MTF) en de klasse van een weegschaal conform **OIML R76-1**.

---

## Benodigde invoer

De gebruiker geeft minimaal op:
- **Max** (capaciteit): het maximale weegvermogen, bijv. `30 kg`
- **d of e** (deling): de kleinste schaalwaarde of verificatiedeling, bijv. `d=10 g` of `e=0,01 kg`

Optioneel:
- **Min** (minimumbelasting): als afwijkend van de norm
- Specifieke klasse (als verificatie gewenst is)

---

## Stap 1 — d en e bepalen

- Als **e** opgegeven: gebruik e direct. Stel d = e (tenzij d ook opgegeven).
- Als **d** opgegeven zonder e: stel e = d.
- Als **beiden** opgegeven: controleer of e/d ∈ {1, 2, 5, 10}. Zo niet: geef waarschuwing.
- e geldt voor klasse-indeling en MTF-berekening.
- d geldt voor weergave en verificatiedeling.

---

## Stap 2 — Aantal delingswaarden berekenen

```
n = Max / e
```

Gebruik consistente eenheden (alles naar gram, kg of mg omrekenen).

---

## Stap 3 — Klasse bepalen

Raadpleeg `references/oiml-r76-tables.md` Tabel 6 voor de n-grenzen.

| Klasse | n_min  | n_max   |
|--------|--------|---------|
| I      | 50.000 | ∞       |
| II     | 100    | 100.000 |
| III    | 500    | 10.000  |
| IIII   | 100    | 1.000   |

**Bij overlap** (n past in meerdere klassen): gebruik de hoogste klasse die haalbaar is op basis van e.
- Klasse I vereist e ≥ 1 µg
- Klasse II vereist e ≥ 1 mg
- Klasse III vereist e ≥ 0,1 g
- Klasse IIII vereist e ≥ 5 g

Als n buiten alle grenzen valt: meld dat de weegschaal **niet classificeerbaar** is.

---

## Stap 4 — MTF berekenen (per zone)

Raadpleeg `references/oiml-r76-tables.md` Tabel 2 voor de MTF-zones per klasse.

Bereken voor elke zone de MTF in de eenheid van e én in de eenheid van Max (bijv. gram of kg).

### Zones voor Klasse I:
| Zone (in e)              | MTF     |
|--------------------------|---------|
| 0 t/m 50.000 e           | ± 0,5 e |
| 50.001 t/m 200.000 e     | ± 1,0 e |
| > 200.000 e              | ± 1,5 e |

### Zones voor Klasse II, III:
| Zone (in e)     | MTF     |
|-----------------|---------|
| 0 t/m 500 e     | ± 0,5 e |
| 501 t/m 2.000 e | ± 1,0 e |
| > 2.000 e       | ± 1,5 e |

### Zones voor Klasse IIII:
| Zone (in e)   | MTF     |
|---------------|---------|
| 0 t/m 50 e    | ± 0,5 e |
| 51 t/m 200 e  | ± 1,0 e |
| > 200 e       | ± 1,5 e |

> **In-use MTF** (gebruik na eerste verificatie) = 2× de bovenstaande waarden.

---

## Stap 5 — Minimumbelasting (Min) bepalen

Raadpleeg `references/oiml-r76-tables.md` Tabel 3.

| Klasse | Min (in e) |
|--------|------------|
| I      | 100 e      |
| II     | 20 e       |
| III    | 20 e       |
| IIII   | 10 e       |

Reken Min om naar de eenheid van de gebruiker.

---

## Stap 6 — Verificatie (optioneel)

Als de gebruiker een specifieke klasse wil bevestigen of een gemeten fout wil toetsen:
- Controleer of n binnen de klassgrenzen valt
- Controleer of e aan de minimumeis voor die klasse voldoet
- Vergelijk gemeten fout met MTF-zones

---

## Outputformaat

Geef altijd een gestructureerd antwoord in het **Nederlands** met:

1. **Invoer samenvatting**: Max, d, e (en of d=e of d≠e)
2. **Berekend n**: met formule
3. **Vastgestelde klasse**: met onderbouwing
4. **MTF-tabel**: alle drie zones, in e én in gebruikseenheid (gram/kg/etc.)
5. **Minimumbelasting (Min)**
6. **Opmerking** bij bijzondere situaties (overlap, d≠e, buiten klasse, etc.)

### Voorbeeldopmaak output:

```
📊 Weegschaalanalyse (OIML R76)

Invoer:
  Max = 30 kg | e = 10 g | d = 10 g

Berekening:
  n = Max / e = 30.000 / 10 = 3.000 delingswaarden

Klasse: III (Gemiddelde nauwkeurigheid)
  → n = 3.000 valt binnen 500–10.000 ✓
  → e = 10 g voldoet aan minimumeis klasse III (≥ 0,1 g) ✓

MTF bij eerste verificatie:
  Zone 1: 0 – 5 kg       → ± 5 g   (0,5 × e)
  Zone 2: 5 kg – 20 kg   → ± 10 g  (1,0 × e)
  Zone 3: 20 kg – 30 kg  → ± 15 g  (1,5 × e)

MTF in gebruik (in-use):
  Zone 1: 0 – 5 kg       → ± 10 g
  Zone 2: 5 kg – 20 kg   → ± 20 g
  Zone 3: 20 kg – 30 kg  → ± 30 g

Minimumbelasting (Min): 20 × e = 200 g
```

---

## Veelgemaakte invoervarianten

| Gebruiker zegt          | Interpretatie                        |
|-------------------------|--------------------------------------|
| `Max=15kg, d=5g`        | e = d = 5 g                          |
| `Max=60kg, e=20g`       | d = e = 20 g                         |
| `Max=6kg, d=1g, e=2g`   | d=1g, e=2g → e/d=2 ✓                 |
| `Capaciteit 150kg, 50g` | Max=150kg, d of e = 50g (doorvragen) |
| `n=5000, e=10g`         | Bereken Max = 5000×10g = 50 kg       |

---

## Aandachtspunten

- Eenheden altijd consistent houden (alles naar dezelfde eenheid)
- Bij twijfel over d vs. e: vraag door bij de gebruiker
- Weegschalen met meerdere weegebieden (multi-interval): elk gebied apart behandelen
- OIML R76 geldt voor niet-automatische weegwerktuigen (NAWI)
- Voor automatische weegwerktuigen geldt OIML R51 (andere norm, buiten scope van deze skill)
