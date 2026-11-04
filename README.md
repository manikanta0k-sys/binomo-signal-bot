# Chart Signal Lab V6.1 — Timing Repair

This version builds on the actual V6 files, preserving its screenshot candle detection and four PDF-based strategy checks. It adds an **always-visible live timing dashboard at the top of the page**, powered by a separate `timing-v6-1.js` file. It also repairs the V6 strategy script’s access to reviewed candles.

## Installation
Upload **all five** files to the root of your existing GitHub Pages repository, replacing the old files:
- `index.html`
- `style.css`
- `app.js`
- `strategy-v6.js`
- `timing-v6-1.js` (new)

Commit, wait for deployment, then hard-refresh. The dashboard should show the device local time and countdown immediately, even before uploading an image. The existing Timeframe & signal freshness section remains further down the page.

## Timing definitions
- **Current local time**: your device clock and device time zone.
- **Candle start/end and countdown**: mathematical boundaries aligned to the selected chart interval (default 60 seconds). This is not a synchronized Binomo candle feed.
- **Trade expiry**: a hypothetical end time if started now, based on the separate duration selector. No trade is placed.
- **Screenshot freshness**: age since the *manually entered* capture time. The bot does not infer actual screenshot capture time.
- **Signal freshness**: elapsed time since the latest successful analysis in this browser session. This is not a verified market signal.

These features do not identify a profitable trade time, and screenshot-derived OHLC and indicator readings remain approximate. No automated trading or Binomo account connection.
