/**
 * Apply an alpha value to a color string, supporting both hex and
 * rgb()/rgba() inputs.
 *
 * Appending a two-digit hex alpha (e.g. `${color}20`) only works for 6-digit
 * hex colors. react-native-paper's MD3 theme colors are `rgba(...)` strings,
 * so the old approach produced unparseable values like
 * "rgba(179, 38, 30, 1)20". This normalises the output to a valid rgba().
 *
 * @param {string} color - A hex ("#RRGGBB"/"#RGB") or rgb/rgba color string.
 * @param {number} alpha - Opacity from 0 to 1.
 * @returns {string} An rgba() color string (or the original input if it cannot
 *   be parsed).
 */
export const withAlpha = (color, alpha = 1) => {
  if (typeof color !== "string") return color;
  const a = Math.max(0, Math.min(1, alpha));

  const hexMatch = color.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  const rgbMatch = color
    .trim()
    .match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // Unknown format (e.g. named color) - return unchanged rather than break.
  return color;
};
