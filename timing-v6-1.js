/* Independent timing dashboard: never depends on screenshot detection. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fmtTime = ms => new Date(ms).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const duration = sec => {
    sec = Math.max(0, Math.ceil(sec));
    return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
  };
  let lastSignalAt = null;
  const readCapture = () => {
    const val = $('captureTime')?.value;
    if (!val) return NaN;
    const ms = new Date(val).getTime();
    return Number.isFinite(ms) ? ms : NaN;
  };
  function tick() {
    const now = Date.now();
    const timeframe = Math.max(1, Number($('chartTimeframe')?.value || 60));
    const expiry = Math.max(1, Number($('tradeExpiry')?.value || 60));
    const start = Math.floor(now / (timeframe*1000)) * timeframe*1000;
    const end = start + timeframe*1000;
    $('liveClock').textContent = fmtTime(now);
    $('localZone').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Device time zone';
    $('liveCountdown').textContent = duration((end-now)/1000);
    $('liveWindow').textContent = `Candle: ${fmtTime(start)} – ${fmtTime(end)}`;
    $('liveExpiry').textContent = duration(expiry);
    $('liveExpiryEnd').textContent = `If started now, ends ${fmtTime(now+expiry*1000)}`;
    const captureMs = readCapture();
    const age = (now-captureMs)/1000;
    if (!Number.isFinite(captureMs)) $('liveFreshness').textContent = 'Time not entered';
    else if (age < -5) $('liveFreshness').textContent = 'Future timestamp';
    else $('liveFreshness').textContent = `${duration(age)} old${age>timeframe?' • STALE':''}`;
    const signalAge = lastSignalAt === null ? NaN : (now-lastSignalAt)/1000;
    $('liveSignalAge').textContent = Number.isFinite(signalAge)
      ? `Last analysis: ${duration(signalAge)} ago${signalAge>timeframe?' • STALE':''}`
      : 'No analysis recorded in this session';
    $('timingHealth').textContent = 'Clock running • Based on your device time, not Binomo server time';
  }
  // Detect successful analyses without altering the original V6 calculation.
  $('analyzeBtn')?.addEventListener('click', () => {
    setTimeout(() => {
      const text = $('signalReason')?.textContent || '';
      if (text.includes('Heuristic score')) lastSignalAt = Date.now();
      tick();
    }, 0);
  });
  // Uploading a new screenshot invalidates old analysis freshness.
  $('imageInput')?.addEventListener('change', () => {lastSignalAt = null; tick();});
  for (const id of ['chartTimeframe','tradeExpiry','captureTime']) {
    $(id)?.addEventListener('change', tick);
    $(id)?.addEventListener('input', tick);
  }
  tick();
  setInterval(tick, 250);
  document.addEventListener('visibilitychange', tick);
  console.info('V6.1 independent timing dashboard ready');
})();
