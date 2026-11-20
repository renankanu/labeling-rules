/**
 * IN 75/2020 Annex XXII: energy conversion factors (kcal/g) for the mandatory
 * macronutrients. Polyols, alcohol, organic acids and soluble fibers have their
 * own factors and are not covered.
 */
export const energyConversionFactors = {
  carbohydrates: 4,
  proteins: 4,
  totalFat: 9,
} as const;

/**
 * RDC 429/2020 Art. 32 § 1º: energy is calculated indirectly from the Annex
 * XXII factors, using the rounded amounts declared in the table (in grams).
 * The result is unrounded; declare it as an integer (Art. 7º § 1º).
 */
export function calculateEnergyKcal(declared: {
  carbohydrates: number;
  proteins: number;
  totalFat: number;
}): number {
  return (
    declared.carbohydrates * energyConversionFactors.carbohydrates +
    declared.proteins * energyConversionFactors.proteins +
    declared.totalFat * energyConversionFactors.totalFat
  );
}
