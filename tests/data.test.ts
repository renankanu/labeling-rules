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
      nutrients.mandatory
        .filter((nutrient) => nutrient.id !== "totalSugars")
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
    });
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