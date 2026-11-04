# Chart Signal Lab V7 — External Binance BTC/USDT Live Data

## Install on GitHub Pages
Upload **all six files** from this ZIP to the root of your existing repository, replacing same-named files: `index.html`, `style.css`, `app.js`, `strategy-v6.js`, `timing-v6-1.js`, `live-v7.js`. Commit changes and reload with `?v=7`.

## Live connection
Click **Connect live feed**. The app fetches up to 160 Binance BTCUSDT 1-minute candles from `https://data-api.binance.vision/api/v3/klines` and then receives updates from `wss://data-stream.binance.vision:443/ws/btcusdt@kline_1m`. No credentials, proxy, backend, Chrome extension, or account connection required. Browser must support HTTPS, fetch, and WebSockets; provider connectivity can be region- or network-dependent.

Only **closed** candles are analyzed. Data is not from Binomo and must **not** be used as a substitute for Binomo, Crypto IDX, or OTC asset quotes. UP/DOWN/WAIT are heuristic condition labels, not reliable forecasts or trade recommendations. The program does not place trades. When the stream is disconnected/stale, live result becomes WAIT. The PDF strategy checker can use live closed Binance candles when its checkbox is checked. Color Ribbons / DRT remains unsupported for Binance because it is specific to Binomo's Crypto IDX mode.

## V6.1 features preserved
Screenshot upload and region selection, candle review/edit, RSI/MACD/fractals, history export, 1-minute clock and countdown, expiry selector, screenshot capture age, and all four PDF strategy checks.

## Limitations
- The separate V6.1 device-clock countdown is not synchronized to Binomo. The live panel uses Binance candle timestamps but relies on the device clock for its countdown.
- Network failures, geographical restrictions, provider outages, and delayed data can prevent a connection. A live browser/network integration test was not possible in this build environment.
- The legacy screenshot analysis and the new live analysis are separate; live candles do not overwrite screenshot review rows or history.
- This is educational market-data analysis, not financial advice.
