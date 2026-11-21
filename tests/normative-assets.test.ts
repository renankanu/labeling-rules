import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DOCS_DIR = resolve(import.meta.dir, "../docs/anvisa");

export const ALLERGEN_NORM_PDF = "RDC_727_2022.pdf";
export const LACTOSE_NORM_PDF = "RDC_715_2022.pdf";
export const GLUTEN_NORM_PDF = "RDC_040_2002.pdf";

const EXPECTED_PDFS = [
  ALLERGEN_NORM_PDF,
  LACTOSE_NORM_PDF,
  GLUTEN_NORM_PDF,
] as const;

describe("docs/anvisa normative PDFs (QUE-669 AC1)", () => {
  for (const filename of EXPECTED_PDFS) {
    test(`exists ${filename} under docs/anvisa`, () => {
      const path = resolve(DOCS_DIR, filename);
      expect(existsSync(path)).toBe(true);
    });
  }

  test("links.md references each committed allergen/lactose/gluten PDF", () => {
    const links = readFileSync(resolve(DOCS_DIR, "links.md"), "utf8");
    for (const filename of EXPECTED_PDFS) {
      expect(links).toContain(filename);
    }
  });
});