# Chart Signal Lab — iPhone screenshot signal analyzer

A **static, free GitHub Pages** application for screenshot-assisted analysis. No API keys, login, server, or automated trading.

## iPhone setup (GitHub website in Safari)

1. Sign into https://github.com and create a **public** repository named `binomo-signal-bot` (enable README).
2. In the repository, choose **Add file → Upload files**. Upload `index.html`, `style.css`, and `app.js` from this ZIP (and optionally replace the README). Commit changes. If Safari hides an action, request the desktop website.
3. Open repository **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**. Select **main**, folder **/(root)**, then **Save**.
5. Wait for deployment. Your site will normally be at `https://YOUR_USERNAME.github.io/binomo-signal-bot/`.
6. Open that link in Safari. Use **Share → Add to Home Screen** if desired.

## How to use

1. Save a chart screenshot to Photos. Use a screenshot with **at least 35 candles** visible; 50+ is better.
2. Upload it to the app.
3. Starting with the **oldest candle on the left**, tap its **high wick tip**, then **low wick tip**, then **close** (top of body for green/bullish candles, bottom for red/bearish candles). Repeat left-to-right for each candle. Do not skip candles. Use **Undo tap** if needed.
4. Tap **Analyze marked candles**. Results show RSI, MACD histogram, confirmed fractals, signal, and reasons.
5. Export history as CSV or clear it from your device.

## Method and limitations

- Price is represented by the **negative pixel Y coordinate**. This is mathematically adequate for RSI and the *sign* of MACD histogram if the screenshot has a linear price axis and is not warped. MACD numeric magnitude is **not** an actual currency/price amount.
- RSI uses Wilder smoothing, period 14. MACD uses EMA(12) minus EMA(26), signal EMA(9). Fractals use five-bar highs/lows, with two candles on either side; only confirmed fractals are considered.
- Signals are simple **heuristics**: UP requires at least three bullish factors and zero bearish factors with RSI below 70; DOWN is the inverse with RSI above 30; otherwise WAIT. Factors are MACD histogram sign, RSI momentum zone, five-close trend, and break of most recent confirmed fractal.
- This tool does **not** automatically recognize candles, infer prices from screenshots, read Binomo live data, predict exact outcomes, or execute trades. Incorrect marking, compression, cropped wicks, non-linear charts, and volatile prices may invalidate results.
- A screenshot with fewer than 35 complete candles cannot be analyzed. Screenshot pixels and tap positions are not uploaded anywhere; history is stored in browser localStorage (max 100 entries).
- Short-expiry trading is high-risk. Never interpret a signal as an accuracy percentage or guaranteed outcome.

## File structure

- `index.html`: interface
- `style.css`: mobile-friendly design
- `app.js`: screenshot marking, indicator calculations, signals, history

## Privacy

Everything runs locally in your browser. GitHub Pages serves static files. No account credentials are collected.
