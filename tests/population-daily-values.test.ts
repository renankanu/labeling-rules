import { describe, expect, test } from "bun:test";
import { dailyValueFor, populationDailyValues } from "../src/index";

describe("IN 75/2020 Annex VIII VDR by population group", () => {
  test("has the 8 groups and 42 constituents", () => {
    expect(populationDailyValues.groups.map((group) => group.labelPt)).toEqual([
      "0 a 6 meses",
      "7 a 11 meses",
      "1 a 3 anos",
      "4 a 8 anos",
      "9 a 18 anos",
      "≥ 19 anos",
      "Gestantes",
      "Lactantes",
    ]);
    expect(Object.keys(populationDailyValues.values)).toHaveLength(42);
  });

  test.each([
    ["energy", "child1to3Years", 1000, "kcal"],
    ["proteins", "pregnant", 55, "g"],
    ["sodium", "infant0to6Months", 120, "mg"],
    ["vitaminA", "lactating", 1300, "mcg"],
    ["iron", "pregnant", 27, "mg"],
    ["manganese", "infant0to6Months", 0.003, "mg"],
    ["molybdenum", "pregnant", 5, "mcg"],
  ])("%s for %s is %d %s", (nutrient, group, amount, unit) => {
    expect(dailyValueFor(nutrient, group)).toEqual({ amount, unit });
  });

  test("has no VDR where the annex shows '-'", () => {
    expect(dailyValueFor("addedSugars", "infant7to11Months")).toBeUndefined();
  });

  test("falls back to Annex II without a group", () => {
    expect(dailyValueFor("energy")).toEqual({ amount: 2000, unit: "kcal" });
  });

  test("rejects an unknown group", () => {
    expect(() => dailyValueFor("energy", "elderly")).toThrow();
  });
});
