/**
 * Servings scaling for the recipe detail view.
 *
 * factor = targetServings / baseServings. Numeric ingredient quantities are
 * multiplied by the factor; a missing quantity (e.g. "salt, to taste") passes
 * through untouched.
 */

export function scaleQuantity(
  quantity: number | null | undefined,
  baseServings: number,
  targetServings: number,
): number | null {
  if (quantity == null || !Number.isFinite(quantity)) return null;
  if (!baseServings || baseServings <= 0) return quantity;
  return (quantity * targetServings) / baseServings;
}

/**
 * Render a quantity for display: up to 2 decimal places, trailing zeros
 * stripped, and a few common fractions shown as fractions (1/2, 1/3, …).
 */
export function formatQuantity(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "";

  const rounded = Math.round(value * 100) / 100;
  const whole = Math.floor(rounded);
  const frac = rounded - whole;

  const FRACTIONS: [number, string][] = [
    [0.25, "1/4"],
    [0.33, "1/3"],
    [0.5, "1/2"],
    [0.67, "2/3"],
    [0.75, "3/4"],
  ];
  const match = FRACTIONS.find(([f]) => Math.abs(frac - f) < 0.02);
  if (match) {
    return whole > 0 ? `${whole} ${match[1]}` : match[1];
  }

  return String(Number(rounded.toFixed(2)));
}

/** e.g. (2, "clove") -> "2 cloves"; (null, "to taste") -> "to taste". */
export function formatAmount(
  quantity: number | null | undefined,
  unit: string | null | undefined,
): string {
  const q = formatQuantity(quantity);
  const u = unit?.trim() ?? "";
  if (q && u) return `${q} ${u}`;
  if (q) return q;
  return u;
}

export function totalTime(prep: number, cook: number): string {
  const mins = (prep || 0) + (cook || 0);
  if (mins <= 0) return "—";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}
