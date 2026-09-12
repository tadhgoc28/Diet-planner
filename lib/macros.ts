/**
 * Macro arithmetic: ingredient lines to recipe totals to a day on the planner.
 *
 * Pure functions, no storage, so signed in and signed out produce identical
 * numbers from identical inputs.
 *
 * The rule that shapes everything here: a line only counts if we know its
 * weight. Ingredients keep their cooking friendly quantity and unit ("2 cloves",
 * "1 pinch") for the shopping list, and carry a separate optional `grams` for
 * the maths. A line with no grams is not counted as zero, it is counted as
 * unknown, and the UI says how many lines were left out. A total that quietly
 * pretends the olive oil was not there is worse than no total at all.
 */

export type Macros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const ZERO_MACROS: Macros = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

/** The macro carrying fields of an ingredient, in app casing. */
export type MacroSource = {
  grams: number | null;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
};

/**
 * Countable means a weight plus at least an energy value. Protein, carbs and
 * fat are allowed to be blank and are treated as zero, because someone logging
 * a quick calorie figure should not be blocked from getting a calorie total.
 */
export function isCountable(source: MacroSource): boolean {
  return (
    source.grams != null &&
    source.grams > 0 &&
    source.caloriesPer100g != null &&
    Number.isFinite(source.caloriesPer100g)
  );
}

/** Null when the line cannot be counted, never a silent zero. */
export function ingredientMacros(source: MacroSource): Macros | null {
  if (!isCountable(source)) return null;
  const factor = (source.grams as number) / 100;
  return {
    calories: (source.caloriesPer100g ?? 0) * factor,
    protein: (source.proteinPer100g ?? 0) * factor,
    carbs: (source.carbsPer100g ?? 0) * factor,
    fat: (source.fatPer100g ?? 0) * factor,
  };
}

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  };
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce(addMacros, ZERO_MACROS);
}

export function scaleMacros(macros: Macros, factor: number): Macros {
  if (!Number.isFinite(factor) || factor <= 0) return ZERO_MACROS;
  return {
    calories: macros.calories * factor,
    protein: macros.protein * factor,
    carbs: macros.carbs * factor,
    fat: macros.fat * factor,
  };
}

export function roundMacros(macros: Macros): Macros {
  return {
    calories: Math.round(macros.calories),
    protein: Math.round(macros.protein),
    carbs: Math.round(macros.carbs),
    fat: Math.round(macros.fat),
  };
}

export type RecipeMacros = {
  total: Macros;
  perServing: Macros;
  /** How many ingredient lines had enough information to count. */
  counted: number;
  /** How many lines there are in total. */
  lines: number;
  /** True when every line counted, so the total can be stated plainly. */
  complete: boolean;
  /** True when nothing counted, so there is no total worth showing. */
  empty: boolean;
};

export function recipeMacros(
  ingredients: MacroSource[],
  servings: number,
): RecipeMacros {
  const counted = ingredients.map(ingredientMacros);
  const usable = counted.filter((m): m is Macros => m !== null);
  const total = sumMacros(usable);
  const divisor = servings > 0 ? servings : 1;

  return {
    total: roundMacros(total),
    perServing: roundMacros(scaleMacros(total, 1 / divisor)),
    counted: usable.length,
    lines: ingredients.length,
    complete: usable.length === ingredients.length && ingredients.length > 0,
    empty: usable.length === 0,
  };
}

/**
 * The caveat line under a recipe total. Null when every line counted, so a
 * complete recipe is not nagged at.
 */
export function coverageNote(macros: RecipeMacros): string | null {
  if (macros.empty) {
    return "No macros yet. Add a weight in grams and the values per 100g to an ingredient to see totals.";
  }
  if (macros.complete) return null;
  const missing = macros.lines - macros.counted;
  return `Based on ${macros.counted} of ${macros.lines} ingredients. ${missing} ${missing === 1 ? "line is" : "lines are"} missing a weight or macro values.`;
}

/**
 * A day on the planner is the sum of one serving of each meal planned into it.
 *
 * One serving per planned meal is an assumption. It matches how the planner
 * reads (a slot is one meal for one person) and it is the only interpretation
 * available until planner entries carry their own portion size, which would be
 * a sensible thing to add later.
 */
export function dayMacros(perServingList: Macros[]): Macros {
  return roundMacros(sumMacros(perServingList));
}

export type TargetStatus = "under" | "on_track" | "over" | "unknown";

export type TargetComparison = {
  actual: number;
  target: number | null;
  /** Positive means above target, negative means below. */
  difference: number;
  status: TargetStatus;
};

/**
 * Calories sit in a band rather than on a number, because hitting an estimate
 * to the calorie is neither possible nor useful. Within 5 percent reads as on
 * track.
 */
export function compareCalories(
  actual: number,
  target: number | null,
): TargetComparison {
  if (!target || target <= 0) {
    return { actual, target: null, difference: 0, status: "unknown" };
  }
  const difference = Math.round(actual - target);
  const tolerance = target * 0.05;
  const status: TargetStatus =
    Math.abs(difference) <= tolerance
      ? "on_track"
      : difference < 0
        ? "under"
        : "over";
  return { actual: Math.round(actual), target, difference, status };
}

/**
 * Protein is a floor, not a band. Hitting it or going past it is fine, so
 * anything at or above target reads as on track and there is no "over".
 */
export function compareProtein(
  actual: number,
  target: number | null,
): TargetComparison {
  if (!target || target <= 0) {
    return { actual, target: null, difference: 0, status: "unknown" };
  }
  const difference = Math.round(actual - target);
  return {
    actual: Math.round(actual),
    target,
    difference,
    status: difference >= 0 ? "on_track" : "under",
  };
}

export function formatCalories(value: number): string {
  return `${Math.round(value).toLocaleString("en-GB")} kcal`;
}

export function formatGrams(value: number): string {
  return `${Math.round(value)}g`;
}

/** e.g. "320 kcal under target", "15g over target", "on target". */
export function formatDifference(
  comparison: TargetComparison,
  unit: "kcal" | "g",
): string {
  if (comparison.status === "unknown") return "No target set";
  if (comparison.status === "on_track" && Math.abs(comparison.difference) === 0) {
    return "Exactly on target";
  }
  const size = Math.abs(comparison.difference);
  const amount =
    unit === "kcal" ? `${size.toLocaleString("en-GB")} kcal` : `${size}g`;
  return comparison.difference < 0
    ? `${amount} under target`
    : `${amount} over target`;
}
