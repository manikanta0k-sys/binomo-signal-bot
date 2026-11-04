# Chart Signal Lab V8 — Binomo screenshot-only estimates

Upload a Binomo screenshot, select chart candles, detect and review at least 35 candles, enter the screenshot **actual capture time**, then click **Analyze Reviewed Candles**. V8 displays two upcoming 1-minute candle windows (e.g. 4:47 and 4:48 after a 4:46 capture), with UP/DOWN directional scores and WAIT without percentages. The second minute is suppressed unless the indicator score is strong.

**Important:** The UP/DOWN percentages are uncalibrated heuristic scores, **not actual measured probabilities**. They are not verified predictions, cannot determine future price movements, and should not be used as assured trading signals. Screenshot-derived OHLC values are approximate. Older screenshots (>60 seconds) produce WAIT.

The V6 PDF strategy checker remains available, along with manual candle review, RSI, MACD, fractals, screenshot freshness, and history. The always-on clock and Binance live feed are removed. Some Binomo-only indicators (e.g. DRT) cannot be reliably inferred from OHLC pixels.

## GitHub Pages
Upload these 5 files to the repository root, replacing existing versions: index.html, style.css, app.js, strategy-v6.js, prediction-v8.js. Remove old live-v7.js if desired. Commit and refresh the GitHub Pages site with ?v=8.
