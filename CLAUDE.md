# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A browser-based calibration certificate generator (`Kalibratiecertificaat`) for **De Jong Weegsystemen BV**, a Dutch weighing systems company. Technicians fill in measurement data on the left panel; the right panel renders a live print-ready certificate conforming to EN 45501:2015 / A4.4.

No build system. Open `index.html` directly in a browser. No npm, no bundler, no server required.

## Development

```bash
open index.html        # open the current version
open vercel-source.html  # open the older split-file version
```

For print testing: use the browser print preview (`⌘P` / Ctrl+P). The CSS includes `@media print` rules that hide the editor panel and render only the certificate sheet.

## Architecture

Two parallel implementations share the same `vercel-app.js`:

| File | Role |
|------|------|
| `index.html` | Current redesign — all CSS inline, references `vercel-app.js` |
| `vercel-source.html` + `vercel-styles.css` | Older split-file version |
| `vercel-app.js` | All application logic — shared by both HTML versions |

### Data flow

1. User fills the `<form id="certificateForm">` on the left panel.
2. Every `input`/`change` event triggers `render()`.
3. `render()` reads each field via `valueFor(name)`, falling back to `fallbackValues` when empty.
4. The preview is updated by writing to every element matching `[data-out="fieldName"]`.
5. On every render, state is serialized and saved to `localStorage` under key `de-jong-kalibratiecertificaat-v1`.

### Measurement tables

The three measurement sections have **no HTML markup** — they are built entirely in JS at boot time by `buildEditors()`:

- **Lineariteit** (Linearity): 15 rows × 3 fields (`linearity_{n}_load`, `linearity_{n}_deviation`, `linearity_{n}_mtf`)
- **Excentrische belasting** (Eccentricity): 4 position inputs (`eccentricity_{1..4}`)
- **Herhaalbaarheid** (Repeatability): 4 weighing inputs (`repeatability_{1..4}`)

`renderLinearity()` handles the linearity table separately from `renderSimpleTable()` because row 1 and row 15 have special default values.

### Persistence

- **Auto-save**: every `render()` call writes `FormData` → JSON to `localStorage`.
- **Manual save/load**: downloads/uploads a named `.json` file via the File API (no server involved).
- **Reset**: `resetForm()` calls `form.reset()` and re-initialises the date field.

### Key functions in `vercel-app.js`

| Function | Purpose |
|----------|---------|
| `buildEditors()` | Injects all measurement table rows into the DOM |
| `render()` | Master sync: updates all `[data-out]` spans and tables, then saves to localStorage |
| `valueFor(name)` | Reads form value or returns `fallbackValues[name]` |
| `serialize()` / `restore(data)` | FormData ↔ plain object for JSON save/load |
| `setOutput(name, value)` | Writes a value to all `[data-out="name"]` elements |

## Design tokens

Defined in `index.html :root`:

```
--accent: #ff813d  (De Jong orange)
--font: Inter
--mono: JetBrains Mono  (used in measurement inputs)
--radius: 8px / --radius-sm: 6px
```

The `vercel-styles.css` has a separate but equivalent token set under different names (`--djw-orange`, `--ink`, `--worktop`, etc.).

## `uploads/Tarra/` folder

This is a design handoff export (Open Design / CJX format). `index.html` here is a static design reference, not production code. `DESIGN-MANIFEST.json` documents the responsive viewport targets and token extraction rules for the implementation.
