import { describe, expect, test } from "bun:test";
import { linearTypography, tableTypography } from "../src/index";

describe("IN 75/2020 Annex XII table typography", () => {
  test("standard formatting", () => {
    expect(tableTypography.standard).toEqual({
      fonts: ["Arial", "Helvetica"],
      titlePt: 10,
      subtitlePt: 8,
      columnHeaderPt: 8,
      constituentPt: 8,
      valuePt: 8,
      footnotePt: 6,
    });
  });

  test("reduced formatting keeps values at 8 pt", () => {
    expect(tableTypography.reduced).toMatchObject({
      titlePt: 8,
      subtitlePt: 6,
      columnHeaderPt: 6,
      constituentPt: 6,
      valuePt: 8,
      footnotePt: 6,
    });
  });
});

describe("IN 75/2020 Annex XIV linear typography", () => {
  test("uses 8 pt title and 6 pt text", () => {
    expect(linearTypography).toMatchObject({
      titlePt: 8,
      subtitlePt: 6,
      basisPt: 6,
      constituentPt: 6,
      valuePt: 6,
      footnotePt: 6,
    });
  });
});
