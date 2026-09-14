// Electricity scenario math. GPT-6 / Codex, September 2026.
(function (root) {
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const iea = year => 155 * 3 ** ((clamp(year, 2025, 2030) - 2025) / 5);
  const capacity = year => year < 2026 || year > 2028 ? null : 6 * 3 ** (year - 2026);
  const electricity = (gw, labs = 2, load = .8, pue = 1.2, boundary = 'it') =>
    gw * labs * load * (boundary === 'it' ? pue : 1) * 8.76;
  const lab = (year, settings) => {
    const gw = capacity(year);
    return gw === null ? null : electricity(gw, settings.labs, settings.load, settings.pue, settings.boundary);
  };
  root.PowerTimelineMath = { clamp, iea, capacity, electricity, lab };
})(globalThis);
