/**
 * IN 75/2020 Annex IV: non-significant amounts of energy and nutrients, which
 * must be declared as 0 in the nutrition facts table.
 *
 * Covers the mandatory nutrients for "demais alimentos" (not food
 * supplements). Optional nutrients that Annex IV also depends on (other
 * carbohydrates, other fats, cholesterol, amino acids) are not considered.
 */
export const nonSignificantLimits = {
  energy: 4,
  carbohydrates: 0.5,
  totalSugars: 0.5,
  proteins: 0.5,
  totalFat: 0.5,
  saturatedFat: 0.1,
  transFat: 0.1,
  dietaryFiber: 0.5,
  sodium: 5,
} as const;

/** Raw (unrounded) amounts by nutrient id, in the units of nutrients.json. */
export type NutrientAmounts = Readonly<Record<string, number | undefined>>;

const INDEPENDENT_NUTRIENTS = [
  "energy",
  "proteins",
  "saturatedFat",
  "transFat",
  "dietaryFiber",
  "sodium",
] as const;

/**
 * Returns the ids of the mandatory nutrients that must be declared as 0.
 *
 * `columns` holds the raw amounts of every column the table declares (per
 * portion and per 100 g/ml). Annex IV requires the amount to be
 * non-significant in all of them, so a nutrient is zeroed in every column or
 * in none. Missing amounts count as 0.
 */
export function nonSignificantNutrients(
  columns: readonly NutrientAmounts[],
): Set<string> {
  const isWithin = (id: string, limit: number) =>
    columns.every((column) => (column[id] ?? 0) <= limit);

  const zero = new Set<string>();

  for (const id of INDEPENDENT_NUTRIENTS) {
    if (isWithin(id, nonSignificantLimits[id])) {
      zero.add(id);
    }
  }

  // Added sugars are 0 only when the product has no added sugars.
  if (isWithin("addedSugars", 0)) {
    zero.add("addedSugars");
  }

  // Total sugars: no added sugars and no other sugar declared above 0.
  if (
    isWithin("totalSugars", nonSignificantLimits.totalSugars) &&
    zero.has("addedSugars")
  ) {
    zero.add("totalSugars");
  }

  // Carbohydrates: total sugars expressed as 0 and no other carbohydrate
  // declared above 0.
  if (
    isWithin("carbohydrates", nonSignificantLimits.carbohydrates) &&
    zero.has("totalSugars") &&
    zero.has("addedSugars")
  ) {
    zero.add("carbohydrates");
  }

  // Total fat: saturated and trans fat expressed as 0.
  if (
    isWithin("totalFat", nonSignificantLimits.totalFat) &&
    zero.has("saturatedFat") &&
    zero.has("transFat")
  ) {
    zero.add("totalFat");
  }

  return zero;
}
