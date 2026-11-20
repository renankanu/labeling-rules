import { describe, expect, test } from "bun:test";
import { calculateEnergyKcal, energyConversionFactors } from "../src/index";

describe("IN 75/2020 Annex XXII energy conversion", () => {
  test("uses 4 kcal/g for carbohydrates and proteins and 9 kcal/g for fat", () => {
    expect(energyConversionFactors).toEqual({
      carbohydrates: 4,
      proteins: 4,
      totalFat: 9,
    });
  });

  test("calculates energy from declared amounts", () => {
    expect(
      calculateEnergyKcal({ carbohydrates: 30, proteins: 10, totalFat: 13 }),
    ).toBe(277);
    expect(
      calculateEnergyKcal({ carbohydrates: 0.4, proteins: 0, totalFat: 0 }),
    ).toBeCloseTo(1.6);
  });
});
