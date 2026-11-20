/**
 * IN 75/2020 Annex XII: typography of the nutrition facts table (vertical,
 * horizontal and broken models), in points. "standard" is the default;
 * "reduced" is a compaction resource allowed only when the table does not fit
 * the package (RDC 429/2020 Art. 16 § 3º III and IV). The sizes are minimums:
 * larger is allowed if every element grows proportionally (Art. 16 § 1º).
 */
export const tableTypography = {
  standard: {
    fonts: ["Arial", "Helvetica"],
    titlePt: 10,
    subtitlePt: 8,
    columnHeaderPt: 8,
    constituentPt: 8,
    valuePt: 8,
    footnotePt: 6,
  },
  reduced: {
    fonts: ["Arial", "Helvetica", "Arial Narrow", "Helvetica Condensed"],
    titlePt: 8,
    subtitlePt: 6,
    columnHeaderPt: 6,
    constituentPt: 6,
    valuePt: 8,
    footnotePt: 6,
  },
} as const;

export type TableFormatting = keyof typeof tableTypography;

/**
 * IN 75/2020 Annex XIV: typography of the linear model, in points. The
 * title and every line are left aligned.
 */
export const linearTypography = {
  fonts: ["Arial", "Helvetica", "Arial Narrow", "Helvetica Condensed"],
  titlePt: 8,
  subtitlePt: 6,
  basisPt: 6,
  constituentPt: 6,
  valuePt: 6,
  footnotePt: 6,
} as const;

/**
 * IN 75/2020 Annex XII: indentation of each level is the width of "n" (first
 * level), "nn" (second) and "nnn" (third), in the constituent name font.
 */
export const indentationInN = { 0: 0, 1: 1, 2: 2, 3: 3 } as const;
