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

export {
  calculateEnergyKcal,
  energyConversionFactors,
} from "./energy";

export {
  type FoodForm,
  type FrontLabelNutrient,
  type FrontLabelProhibitedCategoryId,
  frontLabelLimits,
  frontLabelProhibitedCategories,
  frontLabelWarnings,
  isFrontLabelProhibitedCategory,
} from "./front-label";

export {
  findPortionReferenceProduct,
  portions,
  type PortionReferenceProduct,
  type PortionUnit,
  type PortionValidation,
  validatePortion,
} from "./portions";

export { referencePortionSchema } from "./schemas";

export {
  findReducibleFractions,
  formatHouseholdMeasure,
  type HouseholdUtensilId,
  householdUtensils,
  isHouseholdUtensil,
} from "./household-measures";
