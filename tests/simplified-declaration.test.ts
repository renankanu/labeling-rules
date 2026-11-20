import { describe, expect, test } from "bun:test";
import {
  findVitaminOrMineral,
  nonSignificantStatement,
  simplifiedVitaminsAndMinerals,
} from "../src/index";

describe("IN 75/2020 Annex X item 1", () => {
  test("lists the non-significant constituents", () => {
    expect(
      nonSignificantStatement(["Gorduras trans", "Fibras alimentares", "Sódio"]),
    ).toBe(
      "Não contém quantidades significativas de gorduras trans, fibras alimentares e sódio.",
    );
    expect(nonSignificantStatement(["Gorduras trans"])).toBe(
      "Não contém quantidades significativas de gorduras trans.",
    );
    expect(nonSignificantStatement([])).toBeNull();
  });
});

describe("IN 75/2020 Annex X item 2", () => {
  test("finds vitamins and minerals by any Annex XI name", () => {
    expect(findVitaminOrMineral("Tiamina")?.id).toBe("vitaminB1");
    expect(findVitaminOrMineral("calcio")?.id).toBe("calcium");
    expect(findVitaminOrMineral("Colesterol")).toBeUndefined();
  });

  test("builds the MINERAIS and VITAMINAS lines in Annex XI order", () => {
    const result = simplifiedVitaminsAndMinerals(
      [
        { name: "Ferro", referenceValue: "4 mg", value: "1,2 mg", dailyValue: "9%" },
        { name: "Tiamina", referenceValue: "0,4 mg", value: "0,12 mg", dailyValue: "10%" },
        { name: "Cálcio", referenceValue: "120 mg", value: "36 mg", dailyValue: "4%" },
        { name: "Colesterol", referenceValue: "10 mg", value: "3 mg", dailyValue: "" },
      ],
      "Por 100 g (30 g, %VD*)",
    );

    expect(result.mineralsText).toBe(
      "MINERAIS. Por 100 g (30 g, %VD*): Cálcio 120 mg (36 mg, 4%) ● Ferro 4 mg (1,2 mg, 9%).",
    );
    expect(result.vitaminsText).toBe(
      "VITAMINAS. Por 100 g (30 g, %VD*): Vitamina B1 0,4 mg (0,12 mg, 10%).",
    );
    expect(result.remaining.map((item) => item.name)).toEqual(["Colesterol"]);
  });

  test("uses only the portion when there is no 100 g column", () => {
    const result = simplifiedVitaminsAndMinerals(
      [{ name: "Cálcio", value: "120 mg", dailyValue: "12%" }],
      "Por porção (100 g, %VD*)",
    );

    expect(result.mineralsText).toBe(
      "MINERAIS. Por porção (100 g, %VD*): Cálcio 120 mg (12%).",
    );
    expect(result.vitaminsText).toBeNull();
  });
});
