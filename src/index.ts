import dailyValuesData from "./data/daily-values.json";
import nutrientsData from "./data/nutrients.json";

import {
  dailyValuesSchema,
  nutrientsSchema,
} from "./schemas";

export const dailyValues = dailyValuesSchema.parse(dailyValuesData);
export const nutrients = nutrientsSchema.parse(nutrientsData);
export {
  nonSignificantLimits,
  nonSignificantNutrients,
  type NutrientAmounts,
} from "./non-significant";
