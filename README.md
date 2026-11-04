# Chart Signal Lab V9 — Binomo screenshot review + optional Python backend

## What is included
- Existing V8 screenshot upload, candle selection, approximate OHLC review, 1-minute next-two-candle display, and PDF strategy checks.
- Optional Python FastAPI service for analyzing the reviewed OHLC candles (RSI 14, MACD 12/26/9, fractals, indicator agreement).
- No Binomo login, scraping, automatic trading, Binance feed, or verified future price feed.
- The Python backend receives **OHLC rows and capture time**, not screenshot image bytes. It does not independently perform OpenCV image detection; existing JavaScript does the pixel-based extraction.
- Scores are **not calibrated probabilities**. The two upcoming candles are uncertain, especially the second. Stale screenshots produce WAIT.

## GitHub Pages frontend
Upload these files to your existing repository root: `index.html`, `app.js`, `style.css`, `strategy-v6.js`, `prediction-v8.js`, `python-v9.js`. Keep `strategy-v6.js` because the PDF strategy UI depends on it. `timing-v6-1.js` is not needed by this V9 frontend.

## Deploy Python backend on Render (or another Python web host)
1. Upload the entire `backend` folder to the same GitHub repository.
2. Create a new **Web Service** connected to the repository. Set **Root Directory** to `backend`.
3. Runtime: Python. Build command: `pip install -r requirements.txt`.
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5. Environment variable: `ALLOWED_ORIGINS=https://manikanta0k-sys.github.io`.
6. Deploy. Open `https://YOUR-SERVICE.onrender.com/health` and confirm status `ok`.
7. On your GitHub Pages website, paste `https://YOUR-SERVICE.onrender.com` into **Python backend URL** and click **Test Python connection**.
8. Upload a Binomo screenshot, select candle region, detect and review at least 35 candles, enter its actual capture timestamp, and click **Analyze next 2 candles with Python**.

If the backend sleeps on a free tier, it may take time to wake. Free hosting availability and limits can change.

## Important
A single screenshot cannot establish verified future directions. Python uses the same approximate screenshot-derived OHLC and a deterministic heuristic; this is **not** a trained ML model, backtest, or verified probability estimate. Do not use the percentage scores as evidence of a particular success rate. The existing PDF strategies remain selectable in the original strategy section, not all combined into the Python score.
