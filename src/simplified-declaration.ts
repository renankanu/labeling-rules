import { nutrients } from "./nutrients";

/**
 * Separator of the linear model and of the simplified declarations: "Black
 * Circle" from the geometric shapes subset (IN 75/2020 Annexes X and XIV).
 */
export const BLACK_CIRCLE_SEPARATOR = " ● ";

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) {
    return items.join("");
  }
  return `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`;
}

/**
 * IN 75/2020 Annex X item 1 (RDC 429/2020 Art. 15 § 3º): text that replaces
 * the grid rows of energy and nutrients present in non-significant amounts.
 * Returns null when there is nothing to declare.
 */
export function nonSignificantStatement(names: string[]): string | null {
  if (names.length === 0) {
    return null;
  }
  return `Não contém quantidades significativas de ${joinWithAnd(
    names.map((name) => name.toLowerCase()),
  )}.`;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

const vitaminOrMineralByName = new Map(
  nutrients.vitaminsAndMinerals.flatMap((nutrient) =>
    [nutrient.labelPt, ...(nutrient.alternativeNamesPt ?? [])].map(
      (name) => [normalize(name), nutrient] as const,
    ),
  ),
);

export type VitaminOrMineral = (typeof nutrients.vitaminsAndMinerals)[number];

/** Finds a vitamin or mineral by its Annex XI name or alternative name. */
export function findVitaminOrMineral(
  name: string,
): VitaminOrMineral | undefined {
  return vitaminOrMineralByName.get(normalize(name));
}

/** Annex X item 2 lists these minerals; choline is not part of it. */
const ANNEX_X_MINERALS = new Set([
  "calcium",
  "chloride",
  "copper",
  "chromium",
  "iron",
  "fluoride",
  "phosphorus",
  "iodine",
  "magnesium",
  "manganese",
  "molybdenum",
  "potassium",
  "selenium",
  "zinc",
]);

export type SimplifiedDeclarationItem = {
  name: string;
  /** Amount per 100 g/ml with unit, e.g. "120 mg". */
  referenceValue?: string;
  /** Amount per portion with unit, e.g. "36 mg". */
  value: string;
  /** "%VD" text, e.g. "4%". */
  dailyValue: string;
};

function formatItem(item: SimplifiedDeclarationItem, name: string): string {
  const parts = [
    item.referenceValue !== undefined ? item.value : undefined,
    item.dailyValue || undefined,
  ].filter((part): part is string => part !== undefined);
  const main = item.referenceValue ?? item.value;
  return parts.length > 0 ? `${name} ${main} (${parts.join(", ")})` : `${name} ${main}`;
}

/**
 * IN 75/2020 Annex X item 2 (RDC 429/2020 Art. 16 § 3º I): simplified
 * declaration of vitamins and minerals, a compaction resource. Moves the
 * listed vitamins and minerals out of the grid into two lines, in Annex XI
 * order and with Annex XI names. Items that are not in Annex X stay in
 * `remaining`.
 */
export function simplifiedVitaminsAndMinerals(
  items: SimplifiedDeclarationItem[],
  basis: string,
): {
  mineralsText: string | null;
  vitaminsText: string | null;
  remaining: SimplifiedDeclarationItem[];
} {
  const order = new Map(
    nutrients.vitaminsAndMinerals.map((nutrient, index) => [nutrient.id, index]),
  );
  const minerals: { index: number; text: string }[] = [];
  const vitamins: { index: number; text: string }[] = [];
  const remaining: SimplifiedDeclarationItem[] = [];

  for (const item of items) {
    const nutrient = findVitaminOrMineral(item.name);
    const index = nutrient ? order.get(nutrient.id) : undefined;
    if (!nutrient || index === undefined) {
      remaining.push(item);
    } else if (ANNEX_X_MINERALS.has(nutrient.id)) {
      minerals.push({ index, text: formatItem(item, nutrient.labelPt) });
    } else if (nutrient.id.startsWith("vitamin")) {
      vitamins.push({ index, text: formatItem(item, nutrient.labelPt) });
    } else {
      remaining.push(item);
    }
  }

  const line = (title: string, entries: { index: number; text: string }[]) =>
    entries.length === 0
      ? null
      : `${title}. ${basis}: ${entries
          .sort((a, b) => a.index - b.index)
          .map((entry) => entry.text)
          .join(BLACK_CIRCLE_SEPARATOR)}.`;

  return {
    mineralsText: line("MINERAIS", minerals),
    vitaminsText: line("VITAMINAS", vitamins),
    remaining,
  };
}
