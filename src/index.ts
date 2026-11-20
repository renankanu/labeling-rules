export { dailyValues, nutrients } from "./nutrients";
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
  PREPARED_FOOD_FOOTNOTE,
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

export {
  indentationInN,
  linearTypography,
  type TableFormatting,
  tableTypography,
} from "./typography";

export {
  BLACK_CIRCLE_SEPARATOR,
  findVitaminOrMineral,
  nonSignificantStatement,
  type SimplifiedDeclarationItem,
  simplifiedVitaminsAndMinerals,
  type VitaminOrMineral,
} from "./simplified-declaration";

export {
  type FrontLabelSize,
  frontLabelSize,
  frontLabelSizing,
} from "./front-label-size";

export {
  dailyValueFor,
  isPopulationGroup,
  populationDailyValues,
} from "./population-daily-values";
