# AGENTS.md

Quick reference for agents working on this repo.

## Running the app

```bash
open index.html        # current version (inline CSS)
open vercel-source.html  # older split-file version
```

No build step, npm, or server required. Opens directly in browser.

## Print testing

Use browser print preview (`⌘P` / `Ctrl+P`). CSS includes `@media print` rules that hide the editor panel and render only the certificate.

## Architecture

- `index.html` + `vercel-app.js` = current version
- `vercel-source.html` + `vercel-styles.css` = older version
- Both share `vercel-app.js` for application logic

For detailed architecture (data flow, measurement tables, persistence), see CLAUDE.md.

## Key quirks

- Measurement tables (linearity, eccentricity, repeatability) have no HTML markup — built entirely in JS by `buildEditors()` at boot time
- State auto-saves to `localStorage` under key `de-jong-kalibratiecertificaat-v1` on every render
- Two unit systems: weight (kg/g) and MTF/deviation (kg/g) — controlled by radio buttons, affects displayed units