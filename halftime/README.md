# EoD Halftime – Sponsor Display

Full-screen halftime overlay for OBS / streaming.

## What it shows

| Area | Content |
|---|---|
| Top | **HALFTIME** badge |
| Centre | Horizontally scrolling sponsor images |
| Bottom | **TIME TO DERBY · MM:SS** — intermission clock from CRG |

## How to add sponsor logos

1. Drop image files (PNG, JPG, GIF, SVG, WebP) into:
   ```
   scoreboard/html/images/sponsor_banner/
   ```
2. Refresh the overlay — images are loaded automatically on every page load by reading the directory listing.

No code changes needed; just drop files into the folder.

## Image sizing tips

- **Transparent PNG** recommended for logos (alpha channel preserved)
- Ideal height: **400–560 px** (overlay displays at 100% viewport height for this area)
- Wide or tall logos both work — `object-fit: contain` keeps proportions

## URL

When CRG is running:
```
http://localhost:8000/custom/eod-halftime/index.html
```

## Scroll speed

Default: **80 px/s**. Edit `PIXELS_PER_SECOND` at the top of `index.js` to change.

## Clock urgency

The clock turns **red and flashes** when 30 seconds or fewer remain.
Change `URGENT_THRESHOLD` in `index.js` to adjust the cutoff.

## Deploying to CRG

The canonical source is this folder. To deploy, copy these three files:

```sh
cp index.html index.css index.js \
  /path/to/scoreboard/html/custom/eod-halftime/
```

Or the automation script handles this sync automatically.
