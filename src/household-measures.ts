/**
 * IN 75/2020 Annex VII: household utensils and their capacities for the
 * household measure declared with the portion (RDC 429/2020 Art. 11 I).
 */
export const householdUtensils = [
  { id: "teacup", labelPt: "xícara de chá", pluralPt: "xícaras de chá", capacityPt: "200 ml" },
  { id: "glass", labelPt: "copo", pluralPt: "copos", capacityPt: "200 ml" },
  { id: "tablespoon", labelPt: "colher de sopa", pluralPt: "colheres de sopa", capacityPt: "10 ml" },
  { id: "teaspoon", labelPt: "colher de chá", pluralPt: "colheres de chá", capacityPt: "5 ml" },
  { id: "shallowPlate", labelPt: "prato raso", pluralPt: "pratos rasos", capacityPt: "22 cm de diâmetro" },
  { id: "deepPlate", labelPt: "prato fundo", pluralPt: "pratos fundos", capacityPt: "250 ml" },
] as const;

export type HouseholdUtensilId = (typeof householdUtensils)[number]["id"];

export function isHouseholdUtensil(id: string): id is HouseholdUtensilId {
  return householdUtensils.some((utensil) => utensil.id === id);
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Formats a household measure with a utensil from Annex VII. Non-whole
 * amounts are written as the irreducible fraction (RDC 429/2020 Art. 11 IV):
 * `{ whole: 1, numerator: 2, denominator: 4 }` becomes "1 1/2".
 */
export function formatHouseholdMeasure(input: {
  utensil: HouseholdUtensilId;
  whole?: number;
  numerator?: number;
  denominator?: number;
}): string {
  const utensil = householdUtensils.find((item) => item.id === input.utensil);
  if (!utensil) {
    throw new Error(`Unknown household utensil: ${input.utensil}`);
  }

  const numerator = input.numerator ?? 0;
  const denominator = input.denominator ?? 1;
  if (
    !Number.isInteger(numerator) ||
    !Number.isInteger(denominator) ||
    numerator < 0 ||
    denominator <= 0
  ) {
    throw new Error("Fraction must use non-negative integers");
  }

  const whole = (input.whole ?? 0) + Math.floor(numerator / denominator);
  const rest = numerator % denominator;
  const divisor = rest === 0 ? 1 : gcd(rest, denominator);
  const fraction = rest === 0 ? "" : `${rest / divisor}/${denominator / divisor}`;

  const amount = [whole > 0 ? String(whole) : "", fraction].filter(Boolean).join(" ");
  if (!amount) {
    throw new Error("Household measure amount must be greater than zero");
  }

  return `${amount} ${whole >= 2 ? utensil.pluralPt : utensil.labelPt}`;
}

/**
 * Returns the fractions in a free-text household measure that are not
 * irreducible (RDC 429/2020 Art. 11 IV), e.g. "2/4" in "2/4 xícara".
 */
export function findReducibleFractions(text: string): string[] {
  return [...text.matchAll(/(\d+)\s*\/\s*(\d+)/g)]
    .filter(([, numerator, denominator]) => {
      const n = Number(numerator);
      const d = Number(denominator);
      return d > 0 && gcd(n, d) > 1;
    })
    .map(([match]) => match.replace(/\s+/g, ""));
}
