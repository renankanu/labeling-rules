import dailyValuesData from "./data/daily-values.json";
import nutrientsData from "./data/nutrients.json";
import { dailyValuesSchema, nutrientsSchema } from "./schemas";

/** IN 75/2020 Annex II daily reference values (VDR). */
export const dailyValues = dailyValuesSchema.parse(dailyValuesData);

/** RDC 429/2020 Art. 5 and IN 75/2020 Annex XI nutrient names and order. */
export const nutrients = nutrientsSchema.parse(nutrientsData);
