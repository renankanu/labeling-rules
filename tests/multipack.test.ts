import { describe, expect, test } from "bun:test";
import { multipackDeclaration } from "../src/index";

describe("RDC 429/2020 Art. 13 multiple packages", () => {
  test("declares one table for units of the same product", () => {
    expect(multipackDeclaration({ distinctProducts: 1, jointConsumption: false })).toBe("single");
    expect(multipackDeclaration({ distinctProducts: 1, jointConsumption: true })).toBe("single");
  });

  test("declares one table per distinct unit not eaten together", () => {
    expect(multipackDeclaration({ distinctProducts: 3, jointConsumption: false })).toBe("perUnit");
  });

  test("declares the combination of distinct units eaten together", () => {
    expect(multipackDeclaration({ distinctProducts: 2, jointConsumption: true })).toBe("combined");
  });

  test("rejects an empty package", () => {
    expect(() => multipackDeclaration({ distinctProducts: 0, jointConsumption: false })).toThrow();
  });
});
