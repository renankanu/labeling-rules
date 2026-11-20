import { describe, expect, test } from "bun:test";
import {
  findPortionReferenceProduct,
  portions,
  validatePortion,
} from "../src/index";

describe("IN 75/2020 Annex V reference portions", () => {
  test("has the 8 groups with their average energy", () => {
    expect(
      portions.groups.map((group) => [group.id, group.averageEnergyKcal]),
    ).toEqual([
      ["I", 150],
      ["II", 30],
      ["III", 70],
      ["IV", 125],
      ["V", 125],
      ["VI", 100],
      ["VII", 100],
      ["VIII", undefined],
    ]);
  });

  test("has every product of each group", () => {
    const countByGroup = Object.fromEntries(
      portions.groups.map((group) => [
        group.id,
        portions.products.filter((product) => product.group === group.id)
          .length,
      ]),
    );

    expect(countByGroup).toEqual({
      I: 43,
      II: 12,
      III: 6,
      IV: 11,
      V: 15,
      VI: 13,
      VII: 27,
      VIII: 11,
    });
  });

  test("uses unique ids", () => {
    const ids = portions.products.map((product) => product.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test.each([
    ["I-09", "Bolos, todos os tipos sem recheio", 60],
    ["I-21", "Pães embalados fatiados ou não, com ou sem recheio", 50],
    ["II-06", "Sucos de vegetais, frutas e sojas", 200],
    ["III-05", "Uva passa", 30],
    ["IV-07", "Outros queijos (ricota, semiduros, branco, requeijão, queijo cremoso, fundidos e em pasta)", 30],
    ["V-08", "Linguiça, salsicha, todos os tipos", 50],
    ["VI-01", "Óleos vegetais, todos os tipos", 13],
    ["VII-19", "Biscoito doce, com ou sem recheio", 30],
    ["VII-24", "Bolos e similares com recheio ou cobertura", 60],
    ["VIII-09", "Pratos preparados prontos e semipronto não incluídos em outros itens da tabela", 100],
  ])("%s %s has a %d portion", (id, labelPt, amount) => {
    const product = findPortionReferenceProduct(id);
    expect(product?.labelPt).toBe(labelPt);
    expect(product?.portion).toEqual({ kind: "fixed", options: [{ amount }] });
  });

  test("keeps the special portion kinds", () => {
    expect(findPortionReferenceProduct("I-43")?.portion).toEqual({
      kind: "toPrepare",
      preparedAmount: 60,
      unit: "g",
    });
    expect(findPortionReferenceProduct("V-15")?.portion).toEqual({
      kind: "manufacturerDefined",
    });
    expect(findPortionReferenceProduct("VII-14")?.portion).toEqual({
      kind: "fixed",
      options: [
        { amount: 60, unit: "g" },
        { amount: 130, unit: "ml" },
      ],
    });
    expect(findPortionReferenceProduct("VIII-11")?.portion).toEqual({
      kind: "alcoholEquivalent",
      ethanolGrams: 10,
    });
  });
});

describe("validatePortion", () => {
  test("accepts the annex portion", () => {
    expect(
      validatePortion({ productId: "I-09", portionSize: 60, unit: "g" }),
    ).toEqual({ valid: true });
  });

  test("rejects another portion and says which one is expected", () => {
    expect(
      validatePortion({ productId: "I-09", portionSize: 50, unit: "g" }),
    ).toEqual({ valid: false, expectedPt: "60 g" });
  });

  test("checks the unit when the annex gives one", () => {
    expect(
      validatePortion({ productId: "VII-14", portionSize: 130, unit: "ml" }),
    ).toEqual({ valid: true });
    expect(
      validatePortion({ productId: "VII-14", portionSize: 130, unit: "g" }),
    ).toEqual({ valid: false, expectedPt: "60 g ou 130 ml" });
  });

  test("accepts any portion for individual packaging (RDC Art. 9º I)", () => {
    expect(
      validatePortion({
        productId: "I-09",
        portionSize: 120,
        unit: "g",
        individualPackaging: true,
      }),
    ).toEqual({ valid: true });
  });

  test("accepts portions it cannot check from the amount", () => {
    expect(
      validatePortion({ productId: "V-15", portionSize: 50, unit: "g" }),
    ).toEqual({ valid: true });
  });

  test("throws for an unknown product", () => {
    expect(() =>
      validatePortion({ productId: "IX-01", portionSize: 50, unit: "g" }),
    ).toThrow();
  });
});
