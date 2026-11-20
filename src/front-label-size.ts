/**
 * IN 75/2020 Annex XVIII items 3 and 4: font size limits and minimum
 * occupation of the main panel by the front-of-pack label, by panel area and
 * by number of information blocks ("ALTO EM" plus one per nutrient).
 */
export const frontLabelSizing = {
  /** Panels from 35 cm² up to 100 cm². */
  smallPanel: {
    fontPt: { min: undefined, max: 9 },
    occupation: { 2: 0.035, 3: 0.0525, 4: 0.07 },
  },
  /** Panels larger than 100 cm². */
  largePanel: {
    fontPt: { min: 9, max: 15 },
    occupation: { 2: 0.02, 3: 0.03, 4: 0.04 },
  },
} as const;

export type FrontLabelSize =
  | { optional: true }
  | {
      optional: false;
      blocks: 2 | 3 | 4;
      minimumAreaCm2: number;
      fontPt: { min?: number; max: number };
    };

/**
 * Minimum size of the front-of-pack label for a main panel area (RDC
 * 429/2020 Art. 22). Panels under 35 cm² may omit the label (Art. 18 § 3º I).
 * When the area implies a font outside the limits, the caller sizes the
 * label by the font limit instead (Art. 22 sole paragraph).
 */
export function frontLabelSize(input: {
  panelAreaCm2: number;
  nutrientCount: number;
}): FrontLabelSize {
  if (input.panelAreaCm2 < 35) {
    return { optional: true };
  }

  const blocks = input.nutrientCount + 1;
  if (blocks !== 2 && blocks !== 3 && blocks !== 4) {
    throw new Error("The front label has 1 to 3 nutrients");
  }

  const sizing =
    input.panelAreaCm2 <= 100
      ? frontLabelSizing.smallPanel
      : frontLabelSizing.largePanel;

  return {
    optional: false,
    blocks,
    // Rounded to 4 decimals to drop floating point noise.
    minimumAreaCm2:
      Math.round(input.panelAreaCm2 * sizing.occupation[blocks] * 10_000) /
      10_000,
    fontPt: {
      ...(sizing.fontPt.min === undefined ? {} : { min: sizing.fontPt.min }),
      max: sizing.fontPt.max,
    },
  };
}
