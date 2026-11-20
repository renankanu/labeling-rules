import { describe, expect, test } from "bun:test";
import { frontLabelSize } from "../src/index";

describe("IN 75/2020 Annex XVIII front label size", () => {
  test("is optional below 35 cm² (RDC Art. 18 § 3º I)", () => {
    expect(frontLabelSize({ panelAreaCm2: 30, nutrientCount: 3 })).toEqual({
      optional: true,
    });
  });

  test("uses the 35 to 100 cm² occupation and the 9 pt maximum", () => {
    expect(frontLabelSize({ panelAreaCm2: 100, nutrientCount: 1 })).toEqual({
      optional: false,
      blocks: 2,
      minimumAreaCm2: 3.5,
      fontPt: { max: 9 },
    });
    expect(frontLabelSize({ panelAreaCm2: 80, nutrientCount: 3 })).toMatchObject({
      blocks: 4,
      minimumAreaCm2: 5.6,
    });
  });

  test("uses the over 100 cm² occupation and the 9 to 15 pt range", () => {
    expect(frontLabelSize({ panelAreaCm2: 200, nutrientCount: 2 })).toEqual({
      optional: false,
      blocks: 3,
      minimumAreaCm2: 6,
      fontPt: { min: 9, max: 15 },
    });
  });

  test("rejects a label without nutrients", () => {
    expect(() => frontLabelSize({ panelAreaCm2: 200, nutrientCount: 0 })).toThrow();
  });
});
