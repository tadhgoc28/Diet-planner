/**
 * Daily calorie and protein targets.
 *
 * Pure functions with no storage and no imports, so the same numbers come out
 * whether the answers came from a Supabase profile or from localStorage. This
 * file is the single source of truth for the formula: the database stores the
 * result in profiles.calorie_target and profiles.protein_target_g, but never
 * calculates it.
 *
 * The method is Mifflin St Jeor for basal metabolic rate, multiplied by an
 * activity factor to get maintenance, then adjusted by the chosen goal.
 * It is a population average fitted to a lot of people, so it will be wrong for
 * any particular person by some margin. Everything the user sees says so.
 */

export const SEXES = ["male", "female"] as const;
export type Sex = (typeof SEXES)[number];

export const ACTIVITY_LEVELS = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export const GOALS = ["bulk", "maintain", "cut"] as const;
export type Goal = (typeof GOALS)[number];

/** The standard Harris Benedict style activity multipliers. */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  light: "Lightly active",
  moderate: "Moderately active",
  active: "Active",
  very_active: "Very active",
};

export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: "Desk job, little or no exercise",
  light: "Light exercise 1 to 3 days a week",
  moderate: "Moderate exercise 3 to 5 days a week",
  active: "Hard exercise 6 or 7 days a week",
  very_active: "Hard daily exercise, or a physical job",
};

export const GOAL_LABELS: Record<Goal, string> = {
  bulk: "Bulk",
  maintain: "Maintain",
  cut: "Cut",
};

export const GOAL_DESCRIPTIONS: Record<Goal, string> = {
  bulk: "Gain weight slowly, eating above maintenance",
  maintain: "Stay roughly where you are",
  cut: "Lose weight slowly, eating below maintenance",
};

/**
 * How far each goal moves you from maintenance calories.
 * A 20 percent deficit is a common starting point for steady loss, and a
 * 10 percent surplus is the usual advice for gaining with less added fat.
 */
export const GOAL_CALORIE_FACTORS: Record<Goal, number> = {
  bulk: 1.1,
  maintain: 1.0,
  cut: 0.8,
};

/**
 * Protein target in grams per kilogram of bodyweight.
 * Highest on a cut, where protein protects muscle while calories are low.
 */
export const GOAL_PROTEIN_PER_KG: Record<Goal, number> = {
  bulk: 1.8,
  maintain: 1.6,
  cut: 2.0,
};

export type TargetInputs = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
};

export type DailyTargets = {
  /** Energy burned at complete rest. */
  bmr: number;
  /** BMR times the activity multiplier: roughly what holds weight steady. */
  maintenanceCalories: number;
  calorieTarget: number;
  proteinTargetG: number;
};

/**
 * Mifflin St Jeor. The only thing sex changes is the constant on the end,
 * plus 5 or minus 161.
 */
export function basalMetabolicRate(input: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
}): number {
  const base =
    10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.sex === "male" ? base + 5 : base - 161;
}

export function isTargetInputs(
  value: Partial<TargetInputs> | null | undefined,
): value is TargetInputs {
  if (!value) return false;
  return (
    (SEXES as readonly string[]).includes(value.sex ?? "") &&
    (ACTIVITY_LEVELS as readonly string[]).includes(value.activityLevel ?? "") &&
    (GOALS as readonly string[]).includes(value.goal ?? "") &&
    typeof value.age === "number" &&
    typeof value.heightCm === "number" &&
    typeof value.weightKg === "number" &&
    value.age > 0 &&
    value.heightCm > 0 &&
    value.weightKg > 0
  );
}

/**
 * Calories are rounded to the nearest 10 and protein to the nearest 5, because
 * a target of 2417 kcal implies a precision this method does not have.
 */
export function calculateTargets(input: TargetInputs): DailyTargets {
  const bmr = basalMetabolicRate(input);
  const maintenance = bmr * ACTIVITY_MULTIPLIERS[input.activityLevel];
  const calories = maintenance * GOAL_CALORIE_FACTORS[input.goal];
  const protein = input.weightKg * GOAL_PROTEIN_PER_KG[input.goal];

  return {
    bmr: Math.round(bmr),
    maintenanceCalories: Math.round(maintenance / 10) * 10,
    calorieTarget: Math.round(calories / 10) * 10,
    proteinTargetG: Math.round(protein / 5) * 5,
  };
}

/**
 * Shown wherever a target appears. Kept here so the wording cannot drift
 * between the onboarding screen, the planner and the profile page.
 */
export const GUIDANCE_NOTE =
  "These numbers are general guidance worked out from a standard formula, not dietary or medical advice. Everyone differs. If you have a health condition, are pregnant, or are unsure what is right for you, please talk to a doctor or a registered dietitian.";

export const GUIDANCE_NOTE_SHORT =
  "General guidance from a standard formula, not medical advice.";
