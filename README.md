# EoD Custom Overlays for CRG ScoreBoard

Custom overlays for [CRG ScoreBoard](https://github.com/rollerderby/crg). This repo contains two overlays in separate folders, each designed for a different use case.

---

## Overlays

### `broadcast/`

The main **broadcast overlay** for OBS / vMix streams. Features team colour bars, live scores, jam clock, lead jammer flash (★), and automatic WCAG-compliant text contrast. Includes an admin panel for live colour and element control.

### `commentator/`

A **full-screen roster overlay** for the commentator booth. Displays both teams' rosters so commentators can quickly reference skater names and numbers during the game.

---

## Installation

Copy the desired overlay folder into CRG's custom view directory:

```
<CRG root>/html/custom/view/<overlay-folder>/
```

For example, to install the broadcast overlay:

```
<CRG root>/html/custom/view/broadcast/
```

Your CRG root is wherever you unzipped CRG — it contains the `lib/crg-scoreboard.jar` file. The `html/custom/view/` folder may not exist yet; create it if needed.

Restart CRG after copying. It will find the overlay automatically.

---

## Usage

### Broadcast overlay

**Admin panel** (open in a browser during the game):

```
http://<CRG-IP>:8000/custom/view/broadcast/admin/index.html
```

**OBS / vMix Browser Source URL:**

```
http://<CRG-IP>:8000/custom/view/broadcast/index.html?home=%23HEX&away=%23HEX
```

Replace `HEX` with the team's brand colour (e.g. `%231f3264` for `#1f3264`). `#` must be URL-encoded as `%23`.

| Parameter | What it sets | Example |
|-----------|-------------|---------|
| `home` | Team 1 bar colour | `home=%231f3264` |
| `away` | Team 2 bar colour | `away=%23ff2100` |
| `homebg` | Team 1 indicator / jammer box colour (optional) | `homebg=%23000000` |
| `awaybg` | Team 2 indicator / jammer box colour (optional) | `awaybg=%23000000` |

### Commentator overlay

Open in any browser on the same network as CRG:

```
http://<CRG-IP>:8000/custom/view/commentator/index.html
```

---

## Repo structure

```
eod-custom-overlay/
├── broadcast/
│   ├── index.html              ← Broadcast overlay (Browser Source)
│   ├── index.css               ← Styles; bar colours via CSS vars
│   ├── index.js                ← URL param handler + contrast utilities
│   ├── admin/                  ← Admin panel for live control
│   ├── preview.html            ← Preview mode (dev use)
│   ├── scripts/                ← Optional auto-update scripts
│   ├── updater.config.json     ← Auto-update settings
│   ├── Run-Updater.cmd         ← Windows: start auto-updates
│   └── Run-Updater.ps1        ← PowerShell: start auto-updates
├── commentator/
│   ├── index.html              ← Commentator roster overlay
│   ├── index.css               ← Commentator styles
│   └── README.md               ← Commentator-specific docs
└── README.md                   ← This file
```
