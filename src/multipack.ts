/**
 * RDC 429/2020 Art. 13 (table) and Art. 20 (front label) for multiple
 * packages:
 * - "single": every unit has the same nature and nutritional value, so the
 *   multiple package declares one table (§ 1º);
 * - "perUnit": distinct units that are not eaten together get one table each,
 *   in the aggregated model of IN 75/2020 Annex IX item 5 (§ 2º);
 * - "combined": distinct units eaten together get one table for the
 *   combination (§ 3º), with a single portion that is the sum of the units'
 *   portions (Art. 9º IV).
 */
export type MultipackDeclaration = "single" | "perUnit" | "combined";

export function multipackDeclaration(input: {
  distinctProducts: number;
  jointConsumption: boolean;
}): MultipackDeclaration {
  if (!Number.isInteger(input.distinctProducts) || input.distinctProducts < 1) {
    throw new Error("A multiple package has at least one product");
  }
  if (input.distinctProducts === 1) {
    return "single";
  }
  return input.jointConsumption ? "combined" : "perUnit";
}
