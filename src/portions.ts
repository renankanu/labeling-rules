import portionsData from "./data/portions.json";
import { portionsSchema } from "./schemas";

/**
 * IN 75/2020 Annex V: reference portion of each food product, grouped as in
 * the annex. RDC 429/2020 Art. 8º II and Art. 9º require the declared portion
 * to follow it.
 */
export const portions = portionsSchema.parse(portionsData);

export type PortionReferenceProduct = (typeof portions.products)[number];
export type PortionUnit = "g" | "ml";

const productsById = new Map(
  portions.products.map((product) => [product.id, product]),
);

export function findPortionReferenceProduct(
  id: string,
): PortionReferenceProduct | undefined {
  return productsById.get(id);
}

export type PortionValidation =
  | { valid: true }
  | { valid: false; expectedPt: string };

/**
 * Checks a declared portion against the Annex V reference portion.
 *
 * - Individual packaging: the portion is the whole content (RDC 429/2020
 *   Art. 9º I), so any amount is valid.
 * - Fixed portions must match one of the annex options exactly.
 * - "Enough to prepare", manufacturer-defined ("x gramas") and alcoholic
 *   beverage portions cannot be checked from the amount alone and are valid.
 */
export function validatePortion(input: {
  productId: string;
  portionSize: number;
  unit: PortionUnit;
  individualPackaging?: boolean;
}): PortionValidation {
  const product = productsById.get(input.productId);
  if (!product) {
    throw new Error(`Unknown Annex V product: ${input.productId}`);
  }

  if (input.individualPackaging || product.portion.kind !== "fixed") {
    return { valid: true };
  }

  const matches = product.portion.options.some(
    (option) =>
      option.amount === input.portionSize &&
      (option.unit === undefined || option.unit === input.unit),
  );

  if (matches) {
    return { valid: true };
  }

  return {
    valid: false,
    expectedPt: product.portion.options
      .map((option) => `${option.amount} ${option.unit ?? input.unit}`)
      .join(" ou "),
  };
}
