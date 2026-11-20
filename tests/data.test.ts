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

  test("uses consistent units across both files", () => {
    for (const nutrient of nutrients.mandatory) {
      if (nutrient.id === "totalSugars") continue;

      expect(dailyValues.values[nutrient.id]?.unit).toBe(nutrient.unit);
    }
  });
});