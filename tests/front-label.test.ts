import { describe, expect, test } from "bun:test";
import {
  frontLabelLimits,
  frontLabelProhibitedCategories,
  frontLabelWarnings,
  isFrontLabelProhibitedCategory,
} from "../src/index";

describe("IN 75/2020 Annex XV front-label limits", () => {
  test("matches the Annex XV limits", () => {
    expect(frontLabelLimits).toEqual({
      solid: { addedSugars: 15, saturatedFat: 6, sodium: 600 },
      liquid: { addedSugars: 7.5, saturatedFat: 3, sodium: 300 },
    });
  });

  test("flags nutrients at or above the limit", () => {
    expect(
      frontLabelWarnings({
        per100: { addedSugars: 15, saturatedFat: 5.9, sodium: 600 },
        form: "solid",
      }),
    ).toEqual(["addedSugars", "sodium"]);

    expect(
      frontLabelWarnings({
        per100: { addedSugars: 7.4, saturatedFat: 3, sodium: 299 },
        form: "liquid",
      }),
    ).toEqual(["saturatedFat"]);
  });
});

describe("IN 75/2020 Annex XVI prohibited categories", () => {
  test("lists the 18 Annex XVI items in order", () => {
    expect(
      frontLabelProhibitedCategories.map((category): number => category.item),
    ).toEqual(
      Array.from({ length: 18 }, (_, index) => index + 1),
    );
  });

  test("never flags a food in a prohibited category", () => {
    expect(
      frontLabelWarnings({
        per100: { addedSugars: 0, saturatedFat: 20, sodium: 1500 },
        form: "solid",
        prohibitedCategory: "cheeses",
      }),
    ).toEqual([]);
  });

  test("validates category ids", () => {
    expect(isFrontLabelProhibitedCategory("cheeses")).toBe(true);
    expect(isFrontLabelProhibitedCategory("cakes")).toBe(false);
  });
});
