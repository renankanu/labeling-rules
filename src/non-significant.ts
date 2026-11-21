/**
 * IN 75/2020 Annex IV: non-significant amounts of energy and nutrients, which
 * must be declared as 0 in the nutrition facts table.
 *
 * Covers mandatory nutrients for "demais alimentos" (not food supplements).
 * Optional constituents named in Annex IV (other carbohydrates, other sugars
 * such as lactose, other fats including cholesterol, amino acids) block parent
 * nutrients from being expressed as zero when declared above 0.
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

/** Optional nutrient ids from IN 75/2020 Anexo IV dependency rules (demais alimentos). */
export const annexIvOptionalNutrientIds = [
  "otherCarbohydrates",
  "otherSugars",
  "lactose",
  "cholesterol",
  "otherFats",
  "aminoAcids",
] as const;

/** Raw (unrounded) amounts by nutrient id, in the units of nutrients.json. */
export type NutrientAmounts = Readonly<Record<string, number | undefined>>;

const INDEPENDENT_NUTRIENTS = [
  "energy",
  "saturatedFat",
  "transFat",
  "dietaryFiber",
  "sodium",
] as const;

const hasDeclaredAboveZero = (
  columns: readonly NutrientAmounts[],
  id: string,
): boolean => columns.some((column) => (column[id] ?? 0) > 0);

const hasOtherSugarDeclared = (columns: readonly NutrientAmounts[]): boolean =>
  hasDeclaredAboveZero(columns, "otherSugars") ||
  hasDeclaredAboveZero(columns, "lactose");

const hasOtherFatDeclared = (columns: readonly NutrientAmounts[]): boolean =>
  hasDeclaredAboveZero(columns, "cholesterol") ||
  hasDeclaredAboveZero(columns, "otherFats");

/**
 * Returns the ids of the mandatory nutrients that must be declared as 0.
 *
 * `columns` holds the raw amounts of every column the table declares (per
 * portion and per 100 g/ml), including optional constituents when the product
 * declares them. Annex IV requires the amount to be non-significant in all
 * columns, so a nutrient is zeroed in every column or in none. Missing amounts
 * count as 0.
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

  // IN 75/2020 Anexo IV — Proteínas (demais alimentos): sem aminoácido declarado > 0.
  if (
    isWithin("proteins", nonSignificantLimits.proteins) &&
    !hasDeclaredAboveZero(columns, "aminoAcids")
  ) {
    zero.add("proteins");
  }

  // Added sugars are 0 only when the product has no added sugars.
  if (isWithin("addedSugars", 0)) {
    zero.add("addedSugars");
  }

  // Total sugars: no added sugars, no other sugar (ex.: lactose) declared > 0.
  if (
    isWithin("totalSugars", nonSignificantLimits.totalSugars) &&
    zero.has("addedSugars") &&
    !hasOtherSugarDeclared(columns)
  ) {
    zero.add("totalSugars");
  }

  // Carbohydrates: total sugars expressed as 0 and no other carbohydrate > 0.
  if (
    isWithin("carbohydrates", nonSignificantLimits.carbohydrates) &&
    zero.has("totalSugars") &&
    zero.has("addedSugars") &&
    !hasDeclaredAboveZero(columns, "otherCarbohydrates")
  ) {
    zero.add("carbohydrates");
  }

  // Total fat: saturated and trans expressed as 0; no other fat (incl. colesterol) > 0.
  if (
    isWithin("totalFat", nonSignificantLimits.totalFat) &&
    zero.has("saturatedFat") &&
    zero.has("transFat") &&
    !hasOtherFatDeclared(columns)
  ) {
    zero.add("totalFat");
  }

  return zero;
}