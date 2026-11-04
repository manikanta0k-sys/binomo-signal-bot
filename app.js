
"use strict";

// Chart Signal Lab V3
// Screenshot-assisted technical analysis.
// No account access, network calls, or trading.

(() => {
  const $ = id => document.getElementById(id);

  const el = {
    file: $("imageInput"),
    canvas: $("chartCanvas"),
    detect: $("detectBtn"),
    reset: $("resetSelectionBtn"),
    status: $("selectionStatus"),
    table: $("candleTable"),
    analyze: $("analyzeBtn"),
    total: $("totalCandles"),
    green: $("greenCandles"),
    red: $("redCandles"),
    box: $("signalBox"),
    signal: $("signalText"),
    reason: $("signalReason"),
    rsi: $("rsiValue"),
    macd: $("macdValue"),
    hist: $("histValue"),
    fractal: $("fractalValue"),
    details: $("analysisDetails"),
    history: $("historyList"),
    export: $("exportBtn"),
    clear: $("clearHistoryBtn")
  };

  const ctx = el.canvas.getContext("2d", {
    willReadFrequently: true
  });

  const KEY = "chart-signal-lab-v3-history";

  let image = null;
  let selection = null;
  let dragStart = null;
  let dragging = false;
  let candles = [];
  let history = [];

  try {
    history = JSON.parse(
      localStorage.getItem(KEY) || "[]"
    );
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }

  function status(message) {
    el.status.textContent = message;
  }

  function fmt(value, digits = 3) {
    return Number.isFinite(value)
      ? value.toFixed(digits)
      : "--";
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function resetResult() {
    el.box.className = "signal wait";
    el.signal.textContent = "WAIT";
    el.reason.textContent =
      "Analyze reviewed candles to see results.";

    el.rsi.textContent = "--";
    el.macd.textContent = "--";
    el.hist.textContent = "--";
    el.fractal.textContent = "--";
    el.details.textContent = "";
  }

  // IMAGE LOADING

  el.file.addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      status("Please select an image file.");
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      URL.revokeObjectURL(url);

      image = img;
      selection = null;
      candles = [];

      // Limit processing resolution for iPhone.
      const scale = Math.min(
        1,
        1400 / Math.max(img.width, img.height)
      );

      el.canvas.width = Math.round(
        img.width * scale
      );
      el.canvas.height = Math.round(
        img.height * scale
      );

      drawImage();
      updateTable();
      resetResult();

      el.detect.disabled = false;

      status(
        "Drag across the candle chart to select " +
        "the analysis area, then tap Detect."
      );
    } catch (error) {
      status("Could not open image: " + error.message);
    }
  });

  function drawImage() {
    if (!image) return;

    ctx.clearRect(
      0, 0,
      el.canvas.width,
      el.canvas.height
    );

    ctx.drawImage(
      image,
      0, 0,
      el.canvas.width,
      el.canvas.height
    );

    if (selection) {
      const r = selection;

      ctx.fillStyle = "rgba(68,138,255,0.12)";
      ctx.fillRect(r.x, r.y, r.w, r.h);

      ctx.strokeStyle = "#448aff";
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.setLineDash([]);
    }
  }

  function pointerPosition(event) {
    const bounds =
      el.canvas.getBoundingClientRect();

    return {
      x: clamp(
        (event.clientX - bounds.left) *
        el.canvas.width / bounds.width,
        0,
        el.canvas.width
      ),
      y: clamp(
        (event.clientY - bounds.top) *
        el.canvas.height / bounds.height,
        0,
        el.canvas.height
      )
    };
  }

  el.canvas.addEventListener(
    "pointerdown",
    event => {
      if (!image) return;

      dragging = true;
      dragStart = pointerPosition(event);
      selection = null;

      el.canvas.setPointerCapture(event.pointerId);
    }
  );

  el.canvas.addEventListener(
    "pointermove",
    event => {
      if (!dragging || !dragStart) return;

      const p = pointerPosition(event);

      selection = {
        x: Math.min(dragStart.x, p.x),
        y: Math.min(dragStart.y, p.y),
        w: Math.abs(p.x - dragStart.x),
        h: Math.abs(p.y - dragStart.y)
      };

      drawImage();
    }
  );

  function finishSelection() {
    if (!dragging) return;
    dragging = false;
    dragStart = null;

    if (selection &&
        selection.w >= 30 &&
        selection.h >= 30) {
      status(
        "Chart area selected. Tap Detect Candles."
      );
    } else {
      selection = null;
      status(
        "Selection too small. Drag over the chart."
      );
    }

    drawImage();
  }

  el.canvas.addEventListener(
    "pointerup", finishSelection
  );

  el.canvas.addEventListener(
    "pointercancel", finishSelection
  );

  el.reset.addEventListener("click", () => {
    selection = null;
    candles = [];
    drawImage();
    updateTable();
    resetResult();

    status(
      image
        ? "Selection reset. Select chart area."
        : "Upload a chart to begin."
    );
  });

  // COLOR CLASSIFICATION
  // Uses approximate HSV thresholds.
  // This is not a trained image recognition model.

  function classify(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    if (max < 55 || delta < 45) {
      return 0;
    }

    const saturation =
      max === 0 ? 0 : delta / max;

    if (saturation < 0.32) return 0;

    let hue = 0;

    if (delta > 0) {
      if (max === r) {
        hue = ((g - b) / delta) % 6;
      } else if (max === g) {
        hue = (b - r) / delta + 2;
      } else {
        hue = (r - g) / delta + 4;
      }

      hue *= 60;
      if (hue < 0) hue += 360;
    }

    // Green and turquoise candles.
    if (hue >= 75 && hue <= 175) {
      return 1;
    }

    // Red, pink and magenta candles.
    if (hue <= 22 || hue >= 335) {
      return -1;
    }

    return 0;
  }

  // AUTOMATIC CANDLE DETECTION

  function detectCandles() {
    if (!image) return;

    const r = selection || {
      x: 0,
      y: 0,
      w: el.canvas.width,
      h: el.canvas.height
    };

    const x0 = Math.floor(r.x);
    const y0 = Math.floor(r.y);

    const w = Math.min(
      Math.floor(r.w),
      el.canvas.width - x0
    );

    const h = Math.min(
      Math.floor(r.h),
      el.canvas.height - y0
    );

    if (w < 30 || h < 30) {
      status("Please select a larger chart area.");
      return;
    }

    const pixels = ctx.getImageData(
      x0, y0, w, h
    ).data;

    const columns = [];

    for (let x = 0; x < w; x++) {
      let green = 0;
      let red = 0;
      let first = h;
      let last = -1;

      for (let y = 0; y < h; y++) {
        const i = (y * w + x) * 4;

        const color = classify(
          pixels[i],
          pixels[i + 1],
          pixels[i + 2]
        );

        if (color !== 0) {
          if (color > 0) green++;
          else red++;

          first = Math.min(first, y);
          last = Math.max(last, y);
        }
      }

      columns.push({
        x,
        green,
        red,
        first,
        last,
        count: green + red
      });
    }

    // Group adjacent columns containing
    // sufficient colored pixels.
    const threshold = Math.max(
      3,
      Math.floor(h * 0.012)
    );

    const groups = [];
    let active = null;

    for (const col of columns) {
      if (col.count >= threshold) {
        if (!active) {
          active = {
            start: col.x,
            end: col.x,
            columns: []
          };
        }

        active.end = col.x;
        active.columns.push(col);
      } else if (active) {
        groups.push(active);
        active = null;
      }
    }

    if (active) groups.push(active);

    const detected = [];

    for (const group of groups) {
      const width =
        group.end - group.start + 1;

      // Reject very narrow noise.
      if (width < 2) continue;

      const green = group.columns.reduce(
        (sum, c) => sum + c.green, 0
      );

      const red = group.columns.reduce(
        (sum, c) => sum + c.red, 0
      );

      const direction =
        green >= red ? "green" : "red";

      // Use central column to estimate
      // candle body and extremities.
      const center = Math.round(
        (group.start + group.end) / 2
      );

      const radius = Math.max(
        1,
        Math.floor(width * 0.2)
      );

      const ys = [];

      for (
        let x = Math.max(0, center - radius);
        x <= Math.min(w - 1, center + radius);
        x++
      ) {
        for (let y = 0; y < h; y++) {
          const i = (y * w + x) * 4;

          const color = classify(
            pixels[i],
            pixels[i + 1],
            pixels[i + 2]
          );

          if (
            (direction === "green" && color > 0) ||
            (direction === "red" && color < 0)
          ) {
            ys.push(y);
          }
        }
      }

      if (ys.length < 4) continue;

      ys.sort((a, b) => a - b);

      const top = ys[0];
      const bottom = ys[ys.length - 1];

      // Pixel-derived synthetic price scale.
      // Smaller Y means higher price.
      const high = h - top;
      const low = h - bottom;

      // Estimate body using row coverage.
      const rows = new Map();

      for (const y of ys) {
        rows.set(y, (rows.get(y) || 0) + 1);
      }

      const bodyThreshold = Math.max(
        2,
        Math.floor(radius * 0.9)
      );

      const bodyRows = [...rows.entries()]
        .filter(([, count]) =>
          count >= bodyThreshold
        )
        .map(([y]) => y)
        .sort((a, b) => a - b);

      const bodyTop = bodyRows.length
        ? bodyRows[0]
        : top;

      const bodyBottom = bodyRows.length
        ? bodyRows[bodyRows.length - 1]
        : bottom;

      let open, close;

      if (direction === "green") {
        open = h - bodyBottom;
        close = h - bodyTop;
      } else {
        open = h - bodyTop;
        close = h - bodyBottom;
      }

      detected.push({
        open,
        high,
        low,
        close,
        direction
      });
    }

    candles = detected;
    updateTable();
    resetResult();

    status(
      `Detected ${candles.length} possible candles. ` +
      "Review the table and remove false detections."
    );
  }

  el.detect.addEventListener(
    "click", detectCandles
  );

  // MANUAL CORRECTIONS

  function updateTable() {
    el.total.textContent = candles.length;

    el.green.textContent = candles.filter(
      c => c.close >= c.open
    ).length;

    el.red.textContent = candles.filter(
      c => c.close < c.open
    ).length;

    el.analyze.disabled =
      candles.length < 35;

    el.table.replaceChildren();

    candles.forEach((c, index) => {
      const tr = document.createElement("tr");

      const number = document.createElement("td");
      number.textContent = index + 1;
      tr.appendChild(number);

      for (const field of [
        "open", "high", "low", "close"
      ]) {
        const td = document.createElement("td");
        const input = document.createElement("input");

        input.type = "number";
        input.step = "any";
        input.value = fmt(c[field], 2);

        input.addEventListener("change", () => {
          c[field] = Number(input.value);
          resetResult();
          updateCounts();
        });

        td.appendChild(input);
        tr.appendChild(td);
      }

      const action = document.createElement("td");
      const remove = document.createElement("button");

      remove.textContent = "Remove";
      remove.className = "danger";

      remove.addEventListener("click", () => {
        candles.splice(index, 1);
        updateTable();
        resetResult();
      });

      action.appendChild(remove);
      tr.appendChild(action);

      el.table.appendChild(tr);
    });
  }

  function updateCounts() {
    el.green.textContent = candles.filter(
      c => c.close >= c.open
    ).length;

    el.red.textContent = candles.filter(
      c => c.close < c.open
    ).length;
  }

  // TECHNICAL INDICATORS

  function emaSeries(values, period) {
    const result = Array(values.length).fill(null);

    if (values.length < period) return result;

    const first = values.slice(0, period)
      .reduce((a, b) => a + b, 0) / period;

    result[period - 1] = first;

    const multiplier = 2 / (period + 1);

    for (let i = period; i < values.length; i++) {
      result[i] =
        (values[i] - result[i - 1]) *
        multiplier + result[i - 1];
    }

    return result;
  }

  function calculateRSI(closes, period = 14) {
    if (closes.length <= period) return null;

    let gain = 0;
    let loss = 0;

    for (let i = 1; i <= period; i++) {
      const change = closes[i] - closes[i - 1];

      gain += Math.max(0, change);
      loss += Math.max(0, -change);
    }

    gain /= period;
    loss /= period;

    for (let i = period + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];

      gain = (
        gain * (period - 1) +
        Math.max(0, change)
      ) / period;

      loss = (
        loss * (period - 1) +
        Math.max(0, -change)
      ) / period;
    }

    if (gain === 0 && loss === 0) return 50;
    if (loss === 0) return 100;
    if (gain === 0) return 0;

    return 100 - 100 / (1 + gain / loss);
  }

  function calculateMACD(closes) {
    const fast = emaSeries(closes, 12);
    const slow = emaSeries(closes, 26);

    const macd = closes.map((_, i) => {
      if (fast[i] === null || slow[i] === null) {
        return null;
      }

      return fast[i] - slow[i];
    });

    const valid = macd.filter(v => v !== null);
    const signal = emaSeries(valid, 9);

    if (!signal.length ||
        signal[signal.length - 1] === null) {
      return null;
    }

    const lastMACD = valid[valid.length - 1];
    const lastSignal = signal[signal.length - 1];

    return {
      macd: lastMACD,
      signal: lastSignal,
      histogram: lastMACD - lastSignal
    };
  }

  function calculateFractals(data) {
    const fractals = [];

    // A fractal needs two candles
    // on each side of the pivot.
    for (let i = 2; i < data.length - 2; i++) {
      const c = data[i];

      const upper =
        c.high > data[i - 1].high &&
        c.high > data[i - 2].high &&
        c.high > data[i + 1].high &&
        c.high > data[i + 2].high;

      const lower =
        c.low < data[i - 1].low &&
        c.low < data[i - 2].low &&
        c.low < data[i + 1].low &&
        c.low < data[i + 2].low;

      if (upper) {
        fractals.push({
          index: i,
          type: "Upper",
          price: c.high
        });
      }

      if (lower) {
        fractals.push({
          index: i,
          type: "Lower",
          price: c.low
        });
      }
    }

    return fractals;
  }

  // SIGNAL ANALYSIS

  function analyze() {
    if (candles.length < 35) {
      status(
        "At least 35 reviewed candles are required."
      );
      return;
    }

    const valid = candles.every(c =>
      ["open", "high", "low", "close"]
        .every(field => Number.isFinite(c[field])) &&
      c.high >= Math.max(c.open, c.close) &&
      c.low <= Math.min(c.open, c.close)
    );

    if (!valid) {
      status(
        "Invalid OHLC values. Each high must " +
        "be at least open/close, and each low " +
        "must be at most open/close."
      );
      return;
    }

    const closes = candles.map(c => c.close);

    const rsi = calculateRSI(closes);
    const macd = calculateMACD(closes);
    const fractals = calculateFractals(candles);

    if (rsi === null || !macd) {
      status("Not enough data for indicators.");
      return;
    }

    let score = 0;
    const reasons = [];

    if (rsi > 55 && rsi < 70) {
      score++;
      reasons.push("RSI indicates upward momentum");
    } else if (rsi < 45 && rsi > 30) {
      score--;
      reasons.push("RSI indicates downward momentum");
    } else {
      reasons.push("RSI is neutral or at an extreme");
    }

    if (
      macd.macd > macd.signal &&
      macd.histogram > 0
    ) {
      score++;
      reasons.push("MACD is above its signal line");
    } else if (
      macd.macd < macd.signal &&
      macd.histogram < 0
    ) {
      score--;
      reasons.push("MACD is below its signal line");
    } else {
      reasons.push("MACD is inconclusive");
    }

    const last = closes[closes.length - 1];
    const previous = closes[closes.length - 2];

    if (last > previous) {
      score++;
      reasons.push("Latest close is higher");
    } else if (last < previous) {
      score--;
      reasons.push("Latest close is lower");
    }

    const latestFractal = fractals.length
      ? fractals[fractals.length - 1]
      : null;

    // Fractals provide context, not a
    // standalone directional prediction.
    const fractalLabel = latestFractal
      ? latestFractal.type +
        " at candle " +
        (latestFractal.index + 1)
      : "None confirmed";

    let signal = "WAIT";

    if (score >= 3) signal = "UP";
    if (score <= -3) signal = "DOWN";

    el.box.className =
      "signal " + signal.toLowerCase();

    el.signal.textContent = signal;

    el.reason.textContent = reasons.join(". ") + ".";

    el.rsi.textContent = fmt(rsi, 2);
    el.macd.textContent = fmt(macd.macd, 3);
    el.hist.textContent = fmt(
      macd.histogram, 3
    );
    el.fractal.textContent = fractalLabel;

    el.details.textContent =
      `Indicator alignment score: ${score}. ` +
      `Analyzed ${candles.length} reviewed candles. ` +
      "Values use a screenshot-derived " +
      "synthetic price scale, not actual prices.";

    const record = {
      time: new Date().toISOString(),
      signal,
      score,
      rsi,
      macd: macd.macd,
      histogram: macd.histogram,
      fractal: fractalLabel,
      candles: candles.length
    };

    history.unshift(record);
    history = history.slice(0, 100);

    saveHistory();
    renderHistory();

    status(
      "Analysis completed. Review the results " +
      "as approximate technical conditions."
    );
  }

  el.analyze.addEventListener("click", analyze);

  // HISTORY

  function saveHistory() {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify(history)
      );
    } catch {
      status(
        "History could not be saved on this device."
      );
    }
  }

  function renderHistory() {
    el.history.replaceChildren();

    if (!history.length) {
      const p = document.createElement("p");
      p.textContent = "No analysis history yet.";
      el.history.appendChild(p);
      return;
    }

    for (const record of history) {
      const div = document.createElement("div");

      const title = document.createElement("strong");
      title.textContent =
        `${record.signal} — ` +
        new Date(record.time).toLocaleString();

      const info = document.createElement("p");

      info.textContent =
        `RSI: ${fmt(record.rsi, 2)} | ` +
        `MACD: ${fmt(record.macd, 3)} | ` +
        `Candles: ${record.candles}`;

      div.appendChild(title);
      div.appendChild(info);

      el.history.appendChild(div);
    }
  }

  function csvEscape(value) {
    const s = String(value ?? "");

    // Prevent spreadsheet formula execution.
    const safe = /^[=+\-@\t\r]/.test(s)
      ? "'" + s
      : s;

    return '"' + safe.replace(/"/g, '""') + '"';
  }

  el.export.addEventListener("click", () => {
    if (!history.length) {
      status("No history to export.");
      return;
    }

    const fields = [
      "time", "signal", "score", "rsi",
      "macd", "histogram", "fractal", "candles"
    ];

    const lines = [
      fields.join(","),
      ...history.map(record =>
        fields.map(field =>
          csvEscape(record[field])
        ).join(",")
      )
    ];

    const blob = new Blob(
      [lines.join("\r\n")],
      { type: "text/csv;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "signal-history.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  el.clear.addEventListener("click", () => {
    if (!confirm("Delete all saved signal history?")) {
      return;
    }

    history = [];
    saveHistory();
    renderHistory();
  });

  // INITIALIZATION

  resetResult();
  updateTable();
  renderHistory();

})();
