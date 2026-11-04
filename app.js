function classify(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (max < 65 || delta < 30) {
    return 0;
  }

  // Green / turquoise candles
  if (
    g > r * 1.18 &&
    g > b * 0.90 &&
    g - r > 25
  ) {
    return 1;
  }

  // Red / pink candles
  if (
    r > g * 1.18 &&
    r > b * 0.90 &&
    r - g > 25
  ) {
    return -1;
  }

  return 0;
}
