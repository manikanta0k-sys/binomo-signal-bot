function detectCandles() {
  if (!image) {
    status("Upload a screenshot first.");
    return;
  }

  // Read original pixels without selection overlay.
  ctx.drawImage(
    image, 0, 0,
    el.canvas.width, el.canvas.height
  );

  const area = selection || {
    x: 0, y: 0,
    w: el.canvas.width,
    h: el.canvas.height
  };

  const x0 = Math.max(0, Math.floor(area.x));
  const y0 = Math.max(0, Math.floor(area.y));
  const w = Math.min(
    Math.floor(area.w), el.canvas.width - x0
  );
  const h = Math.min(
    Math.floor(area.h), el.canvas.height - y0
  );

  if (w < 30 || h < 30) {
    status("Select a larger chart area.");
    drawImage();
    return;
  }

  const pixels = ctx.getImageData(x0, y0, w, h).data;
  const mask = new Int8Array(w * h);

  let colored = 0;

  for (let i = 0; i < mask.length; i++) {
    const p = i * 4;
    mask[i] = classify(
      pixels[p], pixels[p + 1], pixels[p + 2]
    );
    if (mask[i]) colored++;
  }

  // Find connected regions separately for
  // red and green pixels.
  const visited = new Uint8Array(w * h);
  const regions = [];
  const minPixels = Math.max(5, Math.floor(h * 0.015));

  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || visited[start]) continue;

    const color = mask[start];
    const stack = [start];
    visited[start] = 1;

    let left = w, right = 0;
    let top = h, bottom = 0;
    let count = 0;

    const points = [];

    while (stack.length) {
      const pos = stack.pop();
      const x = pos % w;
      const y = Math.floor(pos / w);

      count++;
      points.push([x, y]);

      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);

      // Four-neighbor flood fill.
      const neighbors = [];

      if (x > 0) neighbors.push(pos - 1);
      if (x < w - 1) neighbors.push(pos + 1);
      if (y > 0) neighbors.push(pos - w);
      if (y < h - 1) neighbors.push(pos + w);

      for (const next of neighbors) {
        if (!visited[next] && mask[next] === color) {
          visited[next] = 1;
          stack.push(next);
        }
      }
    }

    if (count < minPixels) continue;

    regions.push({
      color, left, right, top, bottom,
      count, points
    });
  }

  // Estimate candle bodies from row coverage.
  const candidates = [];

  for (const region of regions) {
    const width = region.right - region.left + 1;
    const height = region.bottom - region.top + 1;

    if (height < 3 || width < 2) continue;

    // Reject unusually wide regions, which
    // are often UI elements or merged candles.
    if (width > Math.max(30, w * 0.12)) continue;

    const rows = new Map();

    for (const [x, y] of region.points) {
      if (!rows.has(y)) rows.set(y, new Set());
      rows.get(y).add(x);
    }

    const coverage = [...rows.entries()]
      .map(([y, xs]) => ({
        y,
        count: xs.size
      }));

    const maximum = Math.max(
      ...coverage.map(row => row.count)
    );

    const bodyThreshold = Math.max(
      2, Math.ceil(maximum * 0.55)
    );

    const bodyRows = coverage
      .filter(row => row.count >= bodyThreshold)
      .map(row => row.y)
      .sort((a, b) => a - b);

    // Fallback for very thin candle bodies.
    const bodyTop = bodyRows.length
      ? bodyRows[0]
      : region.top;

    const bodyBottom = bodyRows.length
      ? bodyRows[bodyRows.length - 1]
      : region.bottom;

    const high = h - region.top;
    const low = h - region.bottom;

    const open = region.color === 1
      ? h - bodyBottom
      : h - bodyTop;

    const close = region.color === 1
      ? h - bodyTop
      : h - bodyBottom;

    candidates.push({
      x: (region.left + region.right) / 2,
      open, high, low, close,
      direction: region.color === 1
        ? "green" : "red"
    });
  }

  // Sort left to right.
  candidates.sort((a, b) => a.x - b.x);

  candles = candidates.map(({ x, ...c }) => c);

  updateTable();
  resetResult();
  drawImage();

  const report =
    `Colored pixels: ${colored}. ` +
    `Regions: ${regions.length}. ` +
    `Candle candidates: ${candles.length}.`;

  console.log(report);

  status(
    report +
    " Review every candidate before analysis."
  );
}
