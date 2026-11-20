import { describe, expect, test } from "bun:test";
import type { FrontLabelProhibitedCategoryId } from "../src/front-label";
import mapping from "../src/data/portion-to-front-label-category.json";
import { suggestedFrontLabelCategory } from "../src/portion-front-label-category";

const mappedPairs = Object.entries(mapping) as Array<
  [string, FrontLabelProhibitedCategoryId]
>;

describe("suggestedFrontLabelCategory", () => {
  test.each(mappedPairs)("maps %s to %s", (productId, categoryId) => {
      const suggestion = suggestedFrontLabelCategory(productId);
      expect(suggestion).not.toBeNull();
      expect(suggestion?.id).toBe(categoryId);
      expect(suggestion?.labelPt.length).toBeGreaterThan(0);
    },
  );

  test("IV-05 suggests cheeses (Queijo ralado)", () => {
    const suggestion = suggestedFrontLabelCategory("IV-05");
    expect(suggestion?.id).toBe("cheeses");
    expect(suggestion?.labelPt).toContain("Queijos");
  });

  test("IV-03 suggests milks (Leite fluido)", () => {
    const suggestion = suggestedFrontLabelCategory("IV-03");
    expect(suggestion?.id).toBe("milks");
    expect(suggestion?.labelPt).toContain("Leites");
  });

  test("returns null for unmapped Annex V product", () => {
    expect(suggestedFrontLabelCategory("I-09")).toBeNull();
  });

  test("returns null for empty or unknown id", () => {
    expect(suggestedFrontLabelCategory(null)).toBeNull();
    expect(suggestedFrontLabelCategory("")).toBeNull();
    expect(suggestedFrontLabelCategory("INVALID")).toBeNull();
  });
});