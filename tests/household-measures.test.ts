import { describe, expect, test } from "bun:test";
import {
  findReducibleFractions,
  formatHouseholdMeasure,
  householdUtensils,
} from "../src/index";

describe("IN 75/2020 Annex VII household utensils", () => {
  test("matches the Annex VII utensils and capacities", () => {
    expect(
      householdUtensils.map((utensil) => [utensil.labelPt, utensil.capacityPt]),
    ).toEqual([
      ["xícara de chá", "200 ml"],
      ["copo", "200 ml"],
      ["colher de sopa", "10 ml"],
      ["colher de chá", "5 ml"],
      ["prato raso", "22 cm de diâmetro"],
      ["prato fundo", "250 ml"],
    ]);
  });
});

describe("formatHouseholdMeasure (RDC 429/2020 Art. 11 IV)", () => {
  test("writes whole amounts", () => {
    expect(formatHouseholdMeasure({ utensil: "tablespoon", whole: 1 })).toBe(
      "1 colher de sopa",
    );
    expect(formatHouseholdMeasure({ utensil: "tablespoon", whole: 2 })).toBe(
      "2 colheres de sopa",
    );
  });

  test("reduces fractions", () => {
    expect(
      formatHouseholdMeasure({ utensil: "teacup", numerator: 2, denominator: 4 }),
    ).toBe("1/2 xícara de chá");
    expect(
      formatHouseholdMeasure({
        utensil: "teaspoon",
        whole: 1,
        numerator: 3,
        denominator: 6,
      }),
    ).toBe("1 1/2 colher de chá");
  });

  test("carries improper fractions into the whole part", () => {
    expect(
      formatHouseholdMeasure({ utensil: "glass", numerator: 5, denominator: 2 }),
    ).toBe("2 1/2 copos");
  });

  test("rejects zero and invalid fractions", () => {
    expect(() => formatHouseholdMeasure({ utensil: "glass" })).toThrow();
    expect(() =>
      formatHouseholdMeasure({ utensil: "glass", numerator: 1, denominator: 0 }),
    ).toThrow();
  });
});

describe("findReducibleFractions", () => {
  test("finds fractions that are not irreducible", () => {
    expect(findReducibleFractions("2/4 xícara")).toEqual(["2/4"]);
    expect(findReducibleFractions("1 3 / 6 colher")).toEqual(["3/6"]);
    expect(findReducibleFractions("1/2 fatia e 1/3 xícara")).toEqual([]);
    expect(findReducibleFractions("1 unidade")).toEqual([]);
  });
});
