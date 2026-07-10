# Tradex AI Portal HTML Prototype

This folder contains a polished local HTML/CSS prototype for the Tradex AI stock trading portal. It is meant to be the source of truth for the UI direction before rebuilding or importing into Figma.

## What Is Included

- Landing page
- Login page
- Dashboard overview
- Symbol detail page
- Portfolio analysis page
- Alerts center page
- Shared visual system through CSS variables
- Clickable single-page prototype routing

## Visual Direction

The current theme uses a more professional institutional fintech palette: Atlantic navy, graphite, glacier gray, restrained teal, and small brass accents. The teal is used for AI/product intelligence, navy for trust and structure, and brass only as a secondary premium accent.

## How To Open Locally

Open this file in a browser:

```text
C:\Users\epicg\Documents\Abhi - AI-Based Stock Trading Portal\prototype\index.html
```

No server or install is required.

## Figma Import Reality

Figma does not natively import HTML and CSS as perfectly editable design layers. The clean workflow is one of these:

1. Use this prototype as the approved UI source, then recreate the final frames in Figma using the same layout and design tokens.
2. Use a Figma plugin such as an HTML-to-design importer, then clean up the imported layers manually.
3. Export screenshots from the browser for presentation only, but this is not ideal if the goal is editable Figma design.

Recommended path: approve the HTML prototype visually first, then use it to rebuild the editable Figma screens with much less guessing.

## html.to.design Import Settings

Use these files:

- `index.html`
- `styles.css`

Do not upload `app.js`. The HTML includes an import-safe mode that shows every screen when JavaScript is not running, which is exactly how html.to.design reads the page.

Recommended plugin settings:

- Turn on `Use Autolayout`
- Turn on `Create styles & variables`
- Turn off `Use existing local styles`
- Turn off `For hover effects`
- Turn off `High-res images`
- Turn off `Add hyperlinks`
- Turn on `HTML layer names`

Important: keep `Add hyperlinks` off. The local prototype uses hash routes like `#dashboard`, and importing those as Figma hyperlinks can cause Figma to open extra tabs instead of creating useful prototype connections. Import the editable screens first, then wire the clickable prototype inside Figma manually.

## Product Positioning

The copy intentionally frames Tradex AI as a decision-support platform. It avoids autonomous trading claims, guaranteed prediction language, or order execution flows.
