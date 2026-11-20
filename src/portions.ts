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
 * - "Enough to prepare X": with the preparation (product amount that makes
 *   a prepared weight), the portion is the product needed for X of prepared
 *   food (RDC 429/2020 Art. 8º § 4º II), rounded to a whole number.
 * - Manufacturer-defined ("x gramas") and alcoholic beverage portions, and
 *   "enough to prepare" without preparation data, cannot be checked from the
 *   amount alone and are valid.
 */
export function validatePortion(input: {
  productId: string;
  portionSize: number;
  unit: PortionUnit;
  individualPackaging?: boolean;
  preparation?: { productQuantity: number; preparedWeight: number };
}): PortionValidation {
  const product = productsById.get(input.productId);
  if (!product) {
    throw new Error(`Unknown Annex V product: ${input.productId}`);
  }

  if (input.individualPackaging) {
    return { valid: true };
  }

  if (product.portion.kind === "toPrepare") {
    const { preparedAmount } = product.portion;
    if (!input.preparation || preparedAmount === undefined) {
      return { valid: true };
    }
    const expected = Math.round(
      (input.preparation.productQuantity * preparedAmount) /
        input.preparation.preparedWeight,
    );
    return Math.round(input.portionSize) === expected
      ? { valid: true }
      : {
          valid: false,
          expectedPt: `${expected} ${input.unit} (para preparar ${preparedAmount} ${product.portion.unit ?? input.unit})`,
        };
  }

  if (product.portion.kind !== "fixed") {
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

/**
 * RDC 429/2020 Art. 8º § 5º: footnote of the 100 g/ml column when it refers
 * to the food ready for consumption.
 */
export const PREPARED_FOOD_FOOTNOTE = "**No alimento pronto para o consumo.";

/**
 * RDC 429/2020 Art. 10 with IN 75/2020 Annex V: a package whose content is
 * up to twice the reference portion may be declared as an individual package
 * (portion = whole content). Only fixed Annex V portions are checked; other
 * kinds return false.
 */
export function isIndividualPackagingEligible(input: {
  productId: string;
  contentAmount: number;
  unit: PortionUnit;
}): boolean {
  const product = productsById.get(input.productId);
  if (!product) {
    throw new Error(`Unknown Annex V product: ${input.productId}`);
  }
  if (product.portion.kind !== "fixed" || input.contentAmount <= 0) {
    return false;
  }
  const option =
    product.portion.options.find((item) => item.unit === input.unit) ??
    product.portion.options.find((item) => item.unit === undefined);
  return option !== undefined && input.contentAmount <= 2 * option.amount;
}
