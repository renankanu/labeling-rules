import populationDailyValuesData from "./data/population-daily-values.json";
import { dailyValues } from "./nutrients";
import { populationDailyValuesSchema } from "./schemas";

/**
 * IN 75/2020 Annex VIII: VDR by population group for food supplements and
 * special purpose foods labeled for specific groups (RDC 429/2020 Art. 12
 * § 4º).
 */
export const populationDailyValues = populationDailyValuesSchema.parse(
  populationDailyValuesData,
);

export function isPopulationGroup(id: string): boolean {
  return populationDailyValues.groups.some((group) => group.id === id);
}

/**
 * VDR of a nutrient: Annex VIII for the population group when given, Annex
 * II otherwise. Undefined when the annex has no VDR ("-") for it.
 */
export function dailyValueFor(
  nutrientId: string,
  populationGroup?: string | null,
): { amount: number; unit: string } | undefined {
  if (!populationGroup) {
    return dailyValues.values[nutrientId];
  }
  if (!isPopulationGroup(populationGroup)) {
    throw new Error(`Unknown Annex VIII population group: ${populationGroup}`);
  }
  const value = populationDailyValues.values[nutrientId];
  const amount = value?.byGroup[populationGroup];
  return value && amount !== undefined ? { amount, unit: value.unit } : undefined;
}
