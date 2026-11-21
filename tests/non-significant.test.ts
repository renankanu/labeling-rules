import { describe, expect, test } from "bun:test";
import { nonSignificantNutrients } from "../src/index";

const allZero = {
  energy: 0,
  carbohydrates: 0,
  totalSugars: 0,
  addedSugars: 0,
  proteins: 0,
  totalFat: 0,
  saturatedFat: 0,
  transFat: 0,
  dietaryFiber: 0,
  sodium: 0,
};

describe("IN 75/2020 Annex IV non-significant amounts", () => {
  test("zeroes every mandatory nutrient at the limits", () => {
    const column = {
      energy: 4,
      carbohydrates: 0.5,
      totalSugars: 0.5,
      addedSugars: 0,
      proteins: 0.5,
      totalFat: 0.5,
      saturatedFat: 0.1,
      transFat: 0.1,
      dietaryFiber: 0.5,
      sodium: 5,
    };

    expect([...nonSignificantNutrients([column, column])].sort()).toEqual(
      Object.keys(allZero).sort(),
    );
  });

  test("keeps nutrients above the limits", () => {
    const column = {
      energy: 4.1,
      carbohydrates: 0.51,
      totalSugars: 0.51,
      addedSugars: 0.01,
      proteins: 0.51,
      totalFat: 0.51,
      saturatedFat: 0.11,
      transFat: 0.11,
      dietaryFiber: 0.51,
      sodium: 5.1,
    };

    expect(nonSignificantNutrients([column]).size).toBe(0);
  });

  test("requires the amount to be non-significant in every column", () => {
    const perPortion = { ...allZero, totalFat: 0.4, sodium: 4 };
    const per100g = { ...allZero, totalFat: 2, sodium: 20 };

    const zero = nonSignificantNutrients([perPortion, per100g]);

    expect(zero.has("totalFat")).toBe(false);
    expect(zero.has("sodium")).toBe(false);
  });

  test("keeps total sugars when the product has added sugars", () => {
    const zero = nonSignificantNutrients([
      { ...allZero, totalSugars: 0.24, addedSugars: 0.26 },
    ]);

    expect(zero.has("addedSugars")).toBe(false);
    expect(zero.has("totalSugars")).toBe(false);
    expect(zero.has("carbohydrates")).toBe(false);
  });

  test("keeps carbohydrates when total sugars are not zero", () => {
    const zero = nonSignificantNutrients([
      { ...allZero, carbohydrates: 0.5, totalSugars: 0.6 },
    ]);

    expect(zero.has("totalSugars")).toBe(false);
    expect(zero.has("carbohydrates")).toBe(false);
  });

  test("keeps total fat when saturated or trans fat are not zero", () => {
    expect(
      nonSignificantNutrients([
        { ...allZero, totalFat: 0.25, saturatedFat: 0.15 },
      ]).has("totalFat"),
    ).toBe(false);
    expect(
      nonSignificantNutrients([
        { ...allZero, totalFat: 0.25, transFat: 0.15 },
      ]).has("totalFat"),
    ).toBe(false);
  });

  test("treats missing amounts as zero", () => {
    expect(nonSignificantNutrients([{}]).size).toBe(10);
  });

  test("IN 75/2020 Anexo IV — keeps carbohydrates when another carbohydrate is declared", () => {
    const zero = nonSignificantNutrients([
      { ...allZero, otherCarbohydrates: 0.1 },
    ]);
    expect(zero.has("carbohydrates")).toBe(false);
  });

  test("IN 75/2020 Anexo IV — keeps total sugars when lactose is declared", () => {
    const zero = nonSignificantNutrients([
      { ...allZero, totalSugars: 0.3, lactose: 0.2 },
    ]);
    expect(zero.has("totalSugars")).toBe(false);
    expect(zero.has("carbohydrates")).toBe(false);
  });

  test("IN 75/2020 Anexo IV — keeps total fat when cholesterol is declared", () => {
    const zero = nonSignificantNutrients([
      { ...allZero, totalFat: 0.4, saturatedFat: 0.05, transFat: 0.05, cholesterol: 8 },
    ]);
    expect(zero.has("totalFat")).toBe(false);
  });

  test("IN 75/2020 Anexo IV — keeps proteins when an amino acid is declared", () => {
    const zero = nonSignificantNutrients([
      { ...allZero, proteins: 0.3, aminoAcids: 0.05 },
    ]);
    expect(zero.has("proteins")).toBe(false);
  });

  test("IN 75/2020 Anexo IV — optional must be non-significant in every column", () => {
    const perPortion = { ...allZero, totalFat: 0.4, saturatedFat: 0.05, transFat: 0.05, cholesterol: 0 };
    const per100 = { ...allZero, totalFat: 0.4, saturatedFat: 0.05, transFat: 0.05, cholesterol: 5 };
    expect(nonSignificantNutrients([perPortion, per100]).has("totalFat")).toBe(false);
  });
});
