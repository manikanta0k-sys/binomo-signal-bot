SIGNAL FUSION PRO V1 — FREE, DEMO-ONLY MARKET RESEARCH APP
==========================================================
What it does
- Checks publicly available 1-minute market candles.
- Offers a rule-based directional BIAS (UP / DOWN / WAIT) for the next *full* one-minute period or the next four-minute period, with India time window.
- Excludes running/incomplete 1-minute candles from finalized indicators but checks the current provisional candle for conflicting direction; displays data age, provider, indicators, chart, sample past matches, 10-coin Binance market CONTEXT, and a manually maintained demo journal.
- Loads a dynamic Binance USDT spot asset list, Kraken USD pairs, and a forex list using a personal Twelve Data free API key.
- Can import a self-provided timestamped CSV for HISTORICAL REPLAY (not live).

IMPORTANT LIMITATION
Binomo Crypto IDX is a proprietary synthetic asset. Public Binance/Kraken quotes are NOT Crypto IDX quotes and cannot predict its candles exactly. Binomo's other OTC and broker quotes can also differ from public prices. No official public Binomo data-feed or automatic live Binomo connection is provided. The app deliberately shows WAIT where no verified feed exists. A technical bias is never guaranteed.

FILES
- index.html: the complete app (no JavaScript library dependencies)
- manifest.webmanifest and icon.svg: home screen install
- service-worker.js: app-shell caching for repeat visits; DATA IS NOT available offline

HOW TO USE ON COMPUTER
Open index.html in a modern web browser. Some browsers block cross-origin API requests when launched as file://. Hosting via HTTPS is recommended.

FREE HTTPS HOSTING ON GITHUB PAGES
1. Create a GitHub repository (e.g. signal-fusion-pro) on your own account.
2. Extract the ZIP and upload ALL four app files to the repository ROOT (index.html must be in the root).
3. In repository Settings > Pages, use Deploy from a branch, choose main / (root), Save.
4. Wait for GitHub to show the published URL in Pages settings and use THAT exact URL. Do not guess it.
5. Open the resulting URL in iPhone Chrome. Use Share > Add to Home Screen where available, or use Safari's Share > Add to Home Screen.

FOREX
Open Twelve Data (https://twelvedata.com) and register for a free key. Enter your own key only in the app. Stored locally on the same device (localStorage), never in GitHub source. Free quotas and ~0.3-2 minute latency on closed REST candle data can force WAIT on some 1m forecasts. Free data may have usage restrictions.

INDICATOR METHOD
Only 1-minute OHLC candles with close time < now minus 1.5 seconds are accepted. The latest 60 must be contiguous; >=65 total completed candles are needed. EMA 9/21 and 21/50 trends, EMA21 slope, RSI14, MACD histogram, 3/8-bar momentum, 5m trend, ADX14, recent S/R proximity and ATR volatility gates are calculated. At least 6/8 agreeing directional votes plus trend/volatility checks are required for UP/DOWN; otherwise WAIT. If an accessible source includes the current running candle, an opposing developing candle may force WAIT (not an extra indicator vote). Four-minute bias is for net price over a prospective four-minute window, not the direction of all four individual candles.
Historical validation uses a rolling historical sample: at candle i, the next running candle i+1 is skipped and the following candle i+2 (or through i+5 for a 4m window) is evaluated against its open price. These are in-sample past data and not live accuracy or probability.

SECURITY
- No Binomo login, password, cookie, session, trade placement, or browser tab access is required or used.
- API calls use HTTPS to Binance/Kraken/Twelve Data; no paid AI API.
- Journal and forex key are stored only on the local device. Never put keys in a publicly uploaded file.
- Does not run or send signals after Chrome is closed/background-suspended.

VERIFICATION NOTES
Code syntax and structural checks can be verified offline, but browser-to-provider HTTP response and real-time accuracy MUST be tested on your network. No live reliability claim is made by the author.
