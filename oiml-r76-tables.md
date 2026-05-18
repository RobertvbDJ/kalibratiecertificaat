# OIML R76 Referentietabellen

## Tabel 1 — Klasseindeling op basis van e en aantal delingswaarden (n = Max/e)

| Klasse | Naam | Min. n (n = Max/e) | Max. n | e (min) | e (max) |
|--------|------|--------------------|--------|---------|---------|
| I      | Speciaal             | 50.000   | onbeperkt | 1 µg   | -      |
| II     | Hoge nauwkeurigheid  | 100      | 100.000   | 1 mg   | -      |
| III    | Gemiddelde nauwk.    | 500      | 10.000    | 0,1 g  | -      |
| IIII   | Gewone nauwkeurigheid| 100      | 1.000     | 5 g    | -      |

> n = Max / e (aantal schaaldelingswaarden)

## Tabel 2 — MTF (Maximaal Toelaatbare Fout) bij eerste verificatie (OIML R76-1, Tabel 5)

### Klasse I
| Belasting m (in e) | MTF (± in e) |
|--------------------|-------------|
| 0 ≤ m ≤ 50.000     | 0,5 e       |
| 50.000 < m ≤ 200.000 | 1,0 e     |
| > 200.000          | 1,5 e       |

### Klasse II
| Belasting m (in e) | MTF (± in e) |
|--------------------|-------------|
| 0 ≤ m ≤ 500        | 0,5 e       |
| 500 < m ≤ 2.000    | 1,0 e       |
| > 2.000            | 1,5 e       |

### Klasse III
| Belasting m (in e) | MTF (± in e) |
|--------------------|-------------|
| 0 ≤ m ≤ 500        | 0,5 e       |
| 500 < m ≤ 2.000    | 1,0 e       |
| > 2.000            | 1,5 e       |

### Klasse IIII
| Belasting m (in e) | MTF (± in e) |
|--------------------|-------------|
| 0 ≤ m ≤ 50         | 0,5 e       |
| 50 < m ≤ 200       | 1,0 e       |
| > 200              | 1,5 e       |

## Tabel 3 — Minimumbelasting (Min) per klasse (OIML R76-1, §4.4)

| Klasse | Min (in e)    |
|--------|---------------|
| I      | 100 e         |
| II     | 20 e          |
| III    | 20 e          |
| IIII   | 10 e          |

## Tabel 4 — Verband tussen d en e

- Als `d = e`: normaal geval, klasse bepaald door e
- Als `d < e`: er is een verfijning; e geldt voor klasse-indeling, d voor weergave
- Toegestane verhoudingen `e/d`: 1, 2, 5, 10
- Als alleen `d` opgegeven: e = d (tenzij anders vermeld)
- Als alleen `e` opgegeven: d = e

## Tabel 5 — In-use (gebruik) MTF = 2× eerste-verificatie MTF

De MTF in gebruik (na eerste verificatie) is het dubbele van de waarden in Tabel 2.

## Tabel 6 — Aantal n-grenzen voor klasse-bepaling (samenvatting)

| Klasse | n_min    | n_max     |
|--------|----------|-----------|
| I      | 50.000   | ∞         |
| II     | 100      | 100.000   |
| III    | 500      | 10.000    |
| IIII   | 100      | 1.000     |

> Opmerking: Als n binnen meerdere klassen valt (bv. n=800 past in II én III),
> dan is de klasse afhankelijk van e. Klasse II vereist e ≥ 1 mg, Klasse III e ≥ 0,1 g.
