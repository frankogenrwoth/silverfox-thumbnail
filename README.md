# silverfox-thumbnail-editor

A browser-based studio for composing photo-panel thumbnails. Upload images into 2–4 columns, arrange and crop them, add styled text with custom fonts, and export a high-resolution PNG, JPEG, or WebP — all client-side, with no backend.

## Features

- Photo panels in 2, 3, or 4 columns with adjustable widths, spacing, and margins
- Drag-and-drop image uploads (JPEG, PNG, WebP), per-column selection, zoom, and panning
- Add, drag, and style multiple text layers; load custom TTF/OTF/WOFF/WOFF2 fonts
- Canvas size presets or custom dimensions (200–6000px), adjustable background color
- Export at 1×, 2×, or 3× scale in PNG, JPEG, or WebP

## Requirements

- [Node.js](https://nodejs.org/) 18.18 or newer
- npm (ships with Node.js)

## Setup

```bash
# 1. Clone the repository
git clone <repository-url> silverfox-thumbnail-editor
cd silverfox-thumbnail-editor

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Other commands

```bash
npm run build   # production build
npm run start   # serve the production build (run after build)
```

## Quick start

1. Choose a canvas size and background color in the left sidebar.
2. Pick a column count, then upload photos (or drag files onto individual columns).
3. Click a column to reposition or zoom its photo; use the right sidebar for fine control.
4. Add text, load a custom font, and drag text directly on the canvas.
5. Choose an export format and scale, then click **Download**.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · HTML Canvas

## Project structure

```
app/          Next.js app shell, layout, and global styles
components/   Composer and the settings panels
lib/          State defaults, types, and canvas rendering logic
public/       Static assets
```

Everything runs locally in the browser; images and fonts are never uploaded to a server.
