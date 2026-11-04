# Chart Signal Lab V6

A browser-only educational screenshot-candle analysis app, built on V5. No Binomo account connection or automatic trading.

## Install on GitHub Pages
Upload **all four** files to the repository root, replacing old files where applicable:
- index.html
- style.css
- app.js
- strategy-v6.js (NEW)

Commit, wait for GitHub Pages, then hard refresh. `index.html` loads both JS files in order.

## Workflow
1. Upload screenshot, select candle area, Detect Candles.
2. Review and correct OHLC rows. Screenshot-derived OHLC is pixel-scale approximation, not real market price.
3. Set chart timeframe (default 1 minute), trade expiry separately, and capture timestamp.
4. Choose one PDF strategy and click **Check Strategy Conditions**. For Color Ribbons enter support/resistance in the SAME units as the candle table. If your table contains pixel-based values, real market levels will not be comparable; edit candles to real OHLC first.
5. Read diagnostic evidence, not as trading instructions.

## Rules implemented from PDFs
- **PSAR + Bollinger**: Bollinger period 20, 2 standard deviations; PSAR acceleration 0.02 to 0.2; checks SAR position and Bollinger midline cross on last candle. PDF recommends 1–2-minute charts, expiry under 5 minutes.
- **Awesome + RSI**: Awesome Oscillator 5 and 34 SMA of median (high+low)/2; RSI 14 crossing 50 with AO zero-line crossing in same last candle. PDF recommends 15-second charts, 1-minute expiry; 1-minute chart with 4–5-minute expiry is mentioned as an alternative.
- **Heikin Ashi**: computes HA OHLC from reviewed candles, assesses bullish/bearish color and body/shadow size. PDF asks for Heikin Ashi chart and strong-body / small-shadow confirmation. The implementation uses an explicit heuristic for candle strength, NOT a parameter from the PDF.
- **Color Ribbons / DRT**: PDF applies to Crypto IDX Dynamic Range Trading, 1-minute chart and expiry, support/resistance and multiple bounces; checks entered levels and proximity counts. The 8% touch tolerance and 40% sharp-move threshold are app heuristics, NOT values given by the PDF. DRT outcome colors and profitability cannot be inferred from screenshots.

## Important limitations
These PDFs are educational and explicitly disclaim guaranteed results. Screenshot-based OHLC estimates are not trustworthy for real-money trading. Strategy matches are not probabilities, next-candle predictions, or trade-entry instructions. Time display is based on your device clock and manually entered screenshot time, not synchronized to Binomo. The app does not execute trades.
