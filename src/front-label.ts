/**
 * IN 75/2020 Annex XV: added sugars, saturated fat and sodium limits (per 100 g
 * of solid/semi-solid food or per 100 ml of liquid food) at or above which the
 * front-of-pack "ALTO EM" label is mandatory (RDC 429/2020 Art. 18).
 */
export const frontLabelLimits = {
  solid: { addedSugars: 15, saturatedFat: 6, sodium: 600 },
  liquid: { addedSugars: 7.5, saturatedFat: 3, sodium: 300 },
} as const;

export type FrontLabelNutrient = keyof (typeof frontLabelLimits)["solid"];
export type FoodForm = keyof typeof frontLabelLimits;

/**
 * IN 75/2020 Annex XVI: foods whose front-of-pack nutrition label is
 * prohibited (RDC 429/2020 Art. 18 § 1º). Items 1 to 6 only qualify when no
 * ingredient adds added sugars or a significant amount of saturated fat or
 * sodium (Annex IV).
 */
export const frontLabelProhibitedCategories = [
  {
    id: "unprocessedPlantFoods",
    item: 1,
    labelPt:
      "Frutas, hortaliças, leguminosas, tubérculos, cereais, nozes, castanhas, sementes e cogumelos, sem adição de ingredientes que agreguem açúcares adicionados, gorduras saturadas ou sódio",
  },
  {
    id: "flours",
    item: 2,
    labelPt:
      "Farinhas, sem adição de ingredientes que agreguem açúcares adicionados, gorduras saturadas ou sódio",
  },
  {
    id: "meatsAndFish",
    item: 3,
    labelPt:
      "Carnes e pescados embalados, refrigerados ou congelados, sem adição de ingredientes que agreguem açúcares adicionados, gorduras saturadas ou sódio",
  },
  {
    id: "eggs",
    item: 4,
    labelPt:
      "Ovos, sem adição de ingredientes que agreguem açúcares adicionados, gorduras saturadas ou sódio",
  },
  {
    id: "fermentedMilks",
    item: 5,
    labelPt:
      "Leites fermentados, sem adição de ingredientes opcionais que agreguem açúcares adicionados, gorduras saturadas ou sódio",
  },
  {
    id: "cheeses",
    item: 6,
    labelPt:
      "Queijos, sem adição de ingredientes opcionais que agreguem açúcares adicionados, gorduras saturadas ou sódio",
  },
  { id: "milks", item: 7, labelPt: "Leites de todas as espécies de animais mamíferos" },
  { id: "powderedMilk", item: 8, labelPt: "Leite em pó" },
  {
    id: "vegetableOils",
    item: 9,
    labelPt: "Azeite de oliva e outros óleos vegetais, prensados a frio ou refinados",
  },
  { id: "salt", item: 10, labelPt: "Sal destinado ao consumo humano" },
  { id: "infantFormulas", item: 11, labelPt: "Fórmulas infantis" },
  { id: "enteralFormulas", item: 12, labelPt: "Fórmulas para nutrição enteral" },
  { id: "weightControlFoods", item: 13, labelPt: "Alimentos para controle de peso" },
  { id: "foodSupplements", item: 14, labelPt: "Suplementos alimentares" },
  { id: "alcoholicBeverages", item: 15, labelPt: "Bebidas alcoólicas" },
  {
    id: "industrialProcessingOnly",
    item: 16,
    labelPt: "Produtos destinados exclusivamente ao processamento industrial",
  },
  {
    id: "foodServiceOnly",
    item: 17,
    labelPt: "Produtos destinados exclusivamente aos serviços de alimentação",
  },
  {
    id: "foodAdditives",
    item: 18,
    labelPt: "Aditivos alimentares e coadjuvantes de tecnologia",
  },
] as const;

export type FrontLabelProhibitedCategoryId =
  (typeof frontLabelProhibitedCategories)[number]["id"];

const prohibitedCategoryIds: ReadonlySet<string> = new Set(
  frontLabelProhibitedCategories.map((category) => category.id),
);

export function isFrontLabelProhibitedCategory(
  id: string,
): id is FrontLabelProhibitedCategoryId {
  return prohibitedCategoryIds.has(id);
}

/**
 * Returns the nutrients that need the front-of-pack "ALTO EM" label, in the
 * order added sugars, saturated fat, sodium.
 *
 * `per100` holds the amounts per 100 g or 100 ml of the food as sold (RDC
 * 429/2020 Art. 19). Foods in an Annex XVI category never get the label.
 */
export function frontLabelWarnings(input: {
  per100: Readonly<Record<FrontLabelNutrient, number>>;
  form: FoodForm;
  prohibitedCategory?: FrontLabelProhibitedCategoryId | null;
}): FrontLabelNutrient[] {
  if (input.prohibitedCategory) {
    return [];
  }

  const limits = frontLabelLimits[input.form];
  const nutrients: FrontLabelNutrient[] = ["addedSugars", "saturatedFat", "sodium"];

  return nutrients.filter((nutrient) => input.per100[nutrient] >= limits[nutrient]);
}
