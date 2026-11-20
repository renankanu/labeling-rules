import { describe, expect, test } from "bun:test";
import { dailyValues, nutrients } from "../src/index";

describe("labeling rules data", () => {
  test("contains the expected mandatory nutrient order", () => {
    expect(nutrients.mandatory.map((nutrient) => nutrient.id)).toEqual([
      "energy",
      "carbohydrates",
      "totalSugars",
      "addedSugars",
      "proteins",
      "totalFat",
      "saturatedFat",
      "transFat",
      "dietaryFiber",
      "sodium",
    ]);
  });

  test("contains the expected daily value keys", () => {
    expect(Object.keys(dailyValues.values).sort()).toEqual(
      [
        ...nutrients.mandatory.filter(
          (nutrient) => nutrient.id !== "totalSugars",
        ),
        ...nutrients.vitaminsAndMinerals,
      ]
        .map((nutrient) => nutrient.id)
        .sort(),
    );
  });

  test("matches IN 75/2020 Annex II daily values", () => {
    expect(dailyValues.values).toEqual({
      energy: { amount: 2000, unit: "kcal" },
      carbohydrates: { amount: 300, unit: "g" },
      addedSugars: { amount: 50, unit: "g" },
      proteins: { amount: 50, unit: "g" },
      totalFat: { amount: 65, unit: "g" },
      saturatedFat: { amount: 20, unit: "g" },
      transFat: { amount: 2, unit: "g" },
      dietaryFiber: { amount: 25, unit: "g" },
      sodium: { amount: 2000, unit: "mg" },
      vitaminA: { amount: 800, unit: "mcg" },
      vitaminD: { amount: 15, unit: "mcg" },
      vitaminE: { amount: 15, unit: "mg" },
      vitaminK: { amount: 120, unit: "mcg" },
      vitaminC: { amount: 100, unit: "mg" },
      vitaminB1: { amount: 1.2, unit: "mg" },
      vitaminB2: { amount: 1.2, unit: "mg" },
      vitaminB3: { amount: 15, unit: "mg" },
      vitaminB5: { amount: 5, unit: "mg" },
      vitaminB6: { amount: 1.3, unit: "mg" },
      vitaminB7: { amount: 30, unit: "mcg" },
      vitaminB9: { amount: 400, unit: "mcg" },
      vitaminB12: { amount: 2.4, unit: "mcg" },
      calcium: { amount: 1000, unit: "mg" },
      chloride: { amount: 2300, unit: "mg" },
      copper: { amount: 900, unit: "mcg" },
      chromium: { amount: 35, unit: "mcg" },
      iron: { amount: 14, unit: "mg" },
      fluoride: { amount: 4, unit: "mg" },
      phosphorus: { amount: 700, unit: "mg" },
      iodine: { amount: 150, unit: "mcg" },
      magnesium: { amount: 420, unit: "mg" },
      manganese: { amount: 3, unit: "mg" },
      molybdenum: { amount: 45, unit: "mcg" },
      potassium: { amount: 3500, unit: "mg" },
      selenium: { amount: 60, unit: "mcg" },
      zinc: { amount: 11, unit: "mg" },
      choline: { amount: 550, unit: "mg" },
    });
  });

  test("matches IN 75/2020 Annex XI vitamin and mineral names", () => {
    expect(
      nutrients.vitaminsAndMinerals.map((nutrient) => [
        nutrient.labelPt,
        ...(nutrient.alternativeNamesPt ?? []),
      ]),
    ).toEqual([
      ["Vitamina A"],
      ["Vitamina D"],
      ["Vitamina E"],
      ["Vitamina K"],
      ["Vitamina C"],
      ["Vitamina B1", "Tiamina"],
      ["Vitamina B2", "Riboflavina"],
      ["Vitamina B3", "Niacina"],
      ["Vitamina B5", "Ácido pantotênico"],
      ["Vitamina B6", "Piridoxina"],
      ["Vitamina B7", "Biotina"],
      ["Vitamina B9", "Ácido fólico"],
      ["Vitamina B12", "Cianocobalamina"],
      ["Cálcio"],
      ["Cloreto"],
      ["Cobre"],
      ["Cromo"],
      ["Ferro"],
      ["Flúor"],
      ["Fósforo"],
      ["Iodo"],
      ["Magnésio"],
      ["Manganês"],
      ["Molibdênio"],
      ["Potássio"],
      ["Selênio"],
      ["Zinco"],
      ["Colina"],
    ]);
  });

  test("matches IN 75/2020 Annex XI names, abbreviations, indentation and units", () => {
    expect(nutrients.mandatory).toEqual([
      { id: "energy", labelPt: "Valor energético", unit: "kcal", indent: 0 },
      { id: "carbohydrates", labelPt: "Carboidratos", unit: "g", indent: 0 },
      { id: "totalSugars", labelPt: "Açúcares totais", unit: "g", indent: 1 },
      {
        id: "addedSugars",
        labelPt: "Açúcares adicionados",
        abbreviationPt: "Aç adicionados",
        unit: "g",
        indent: 2,
      },
      { id: "proteins", labelPt: "Proteínas", unit: "g", indent: 0 },
      { id: "totalFat", labelPt: "Gorduras totais", unit: "g", indent: 0 },
      {
        id: "saturatedFat",
        labelPt: "Gorduras saturadas",
        abbreviationPt: "Gord saturadas",
        unit: "g",
        indent: 1,
      },
      {
        id: "transFat",
        labelPt: "Gorduras trans",
        abbreviationPt: "Gord trans",
        unit: "g",
        indent: 1,
      },
      { id: "dietaryFiber", labelPt: "Fibras alimentares", unit: "g", indent: 0 },
      { id: "sodium", labelPt: "Sódio", unit: "mg", indent: 0 },
    ]);
  });

  test("uses consistent units across both files", () => {
    for (const nutrient of nutrients.mandatory) {
      if (nutrient.id === "totalSugars") continue;

      expect(dailyValues.values[nutrient.id]?.unit).toBe(nutrient.unit);
    }
  });
});