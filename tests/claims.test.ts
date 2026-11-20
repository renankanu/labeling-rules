import { describe, expect, test } from "bun:test";
import {
  claimTerms,
  evaluateNutritionClaims,
  isNutritionClaim,
  type ClaimContext,
} from "../src/index";

function context(overrides: Partial<ClaimContext> = {}): ClaimContext {
  const perPortion = {
    energy: 120,
    carbohydrates: 20,
    totalSugars: 3,
    addedSugars: 0,
    proteins: 6,
    totalFat: 2,
    saturatedFat: 0.5,
    transFat: 0,
    dietaryFiber: 3,
    sodium: 60,
    calcium: 160,
  };
  return {
    portionSize: 50,
    perPortion,
    per100: Object.fromEntries(
      Object.entries(perPortion).map(([id, value]) => [id, value * 2]),
    ),
    frontLabelNutrients: [],
    frontLabelExempt: false,
    ...overrides,
  };
}

const claim = (ctx: ClaimContext, id: string) => {
  const found = evaluateNutritionClaims(ctx).find((item) => item.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};

describe("IN 75/2020 Annex XIX terms", () => {
  test("lists the authorized terms of each attribute", () => {
    expect(claimTerms.source).toEqual(["fonte de", "com", "contém"]);
    expect(claimTerms.reduced).toContain("light em");
  });
});

describe("IN 75/2020 Annex XX absolute claims", () => {
  test("source and high in fiber use 10% and 20% of the VDR", () => {
    // 3 g = 12% de 25 g
    expect(claim(context(), "dietaryFiber.source").eligible).toBe(true);
    expect(claim(context(), "dietaryFiber.high").eligible).toBe(false);
  });

  test("source of calcium needs 15% of the VDR", () => {
    // 160 mg = 16% de 1.000 mg
    expect(claim(context(), "calcium.source").eligible).toBe(true);
    expect(claim(context(), "calcium.high").eligible).toBe(false);
  });

  test("low sodium uses the portion when it is larger than 30 g", () => {
    expect(claim(context(), "sodium.low").eligible).toBe(true);
    expect(claim(context(), "sodium.veryLow").eligible).toBe(false);
  });

  test("low claims use 50 g for portions up to 30 g", () => {
    const ctx = context({
      portionSize: 25,
      perPortion: { sodium: 30 },
      per100: { sodium: 120 },
    });
    // 120 mg / 100 g → 60 mg por 50 g
    expect(claim(ctx, "sodium.low").eligible).toBe(true);
  });

  test("low sodium is blocked by the Annex XV limit unless exempt", () => {
    const ctx = context({ frontLabelNutrients: ["sodium"] });
    expect(claim(ctx, "sodium.low").eligible).toBe(false);
    expect(
      claim({ ...ctx, frontLabelExempt: true }, "sodium.low").eligible,
    ).toBe(true);
  });

  test("low saturated fat caps its share of energy at 10%", () => {
    const ctx = context({
      perPortion: { energy: 30, saturatedFat: 1, transFat: 0 },
      per100: { energy: 60, saturatedFat: 2, transFat: 0 },
    });
    // 1 g × 9 kcal = 30% da energia
    expect(claim(ctx, "saturatedFat.low").reasonsPt).toContain(
      "No máximo 10% do valor energético pode vir de gorduras saturadas.",
    );
  });

  test("sugar claims add the energy phrase when the food is not low in energy", () => {
    const ctx = context({
      perPortion: { energy: 120, totalSugars: 0.2, addedSugars: 0 },
      per100: { energy: 240, totalSugars: 0.4, addedSugars: 0 },
    });
    expect(claim(ctx, "sugars.free").eligible).toBe(true);
    expect(claim(ctx, "sugars.free").requiredPhrasesPt).toContain(
      "Este não é um alimento baixo ou reduzido em valor energético",
    );
  });

  test("no added sugars needs confirmations and the ingredients phrase", () => {
    const result = claim(context(), "sugars.noAdded");
    expect(result.eligible).toBe(true);
    expect(result.confirmationsPt).toHaveLength(3);
    expect(result.requiredPhrasesPt).toContain(
      "contém açúcares próprios dos ingredientes",
    );
  });
});

describe("IN 75/2020 Annex XX comparative claims", () => {
  test("needs a reference food", () => {
    expect(claim(context(), "sodium.reduced").reasonsPt).toEqual([
      "Informe o alimento de referência (RDC 429/2020 Art. 28).",
    ]);
  });

  test("reduced needs at least 25% less than the reference", () => {
    expect(
      claim(context({ reference: { sodium: 200 } }), "sodium.reduced").eligible,
    ).toBe(true);
    expect(
      claim(context({ reference: { sodium: 70 } }), "sodium.reduced").eligible,
    ).toBe(false);
  });

  test("reduced sugars also needs 5 g less per portion", () => {
    expect(
      claim(context({ reference: { totalSugars: 6 } }), "sugars.reduced").reasonsPt,
    ).toContain(
      "Açúcares: diferença mínima de 5 g por porção em relação ao alimento de referência.",
    );
  });
});

describe("claim ids", () => {
  test("validates ids", () => {
    expect(isNutritionClaim("dietaryFiber.source")).toBe(true);
    expect(isNutritionClaim("vitaminC.high")).toBe(true);
    expect(isNutritionClaim("magic.high")).toBe(false);
  });
});
