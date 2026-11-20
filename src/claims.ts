import { nutrients, dailyValues } from "./nutrients";

/**
 * IN 75/2020 Annex XIX: authorized terms of each nutritional attribute.
 */
export const claimTerms = {
  low: ["baixo em", "pouco", "baixo teor de", "leve em"],
  veryLow: ["muito baixo em"],
  free: ["não contém", "livre de", "zero (0 ou 0%)", "sem", "isento de"],
  noAdded: ["sem adição de", "zero adição de", "sem ... adicionado"],
  high: ["alto conteúdo em", "rico em", "alto teor"],
  source: ["fonte de", "com", "contém"],
  reduced: ["reduzido em", "menos", "menor teor de", "light em"],
  increased: ["aumentado em", "mais"],
} as const;

export type ClaimAttribute = keyof typeof claimTerms;

/** Amounts by nutrient id (labeling-rules ids), in nutrients.json units. */
export type ClaimAmounts = Readonly<Record<string, number | undefined>>;

export type ClaimContext = {
  /** Reference portion (Annex V) in g or ml. */
  portionSize: number;
  /** Amounts per reference portion of the food ready for consumption. */
  perPortion: ClaimAmounts;
  /** Amounts per 100 g or ml of the food ready for consumption. */
  per100: ClaimAmounts;
  /**
   * Nutrients at or above the Annex XV limits, ignoring the Annex XVI
   * exemption: "addedSugars", "saturatedFat", "sodium".
   */
  frontLabelNutrients: readonly string[];
  /** The food is in an Annex XVI category (front label prohibited). */
  frontLabelExempt: boolean;
  /** Amounts per reference portion of the reference food (Art. 28). */
  reference?: ClaimAmounts;
};

export type ClaimEvaluation = {
  id: string;
  nutrient: string;
  attribute: ClaimAttribute;
  termsPt: readonly string[];
  /** Quantitative criteria of Annex XX are met. */
  eligible: boolean;
  /** Why the quantitative criteria are not met. */
  reasonsPt: string[];
  /** Ingredient and processing conditions the manufacturer must confirm. */
  confirmationsPt: string[];
  /** Phrases that must go with the claim (Annex XX labeling criteria). */
  requiredPhrasesPt: string[];
};

const at = (amounts: ClaimAmounts, id: string) => amounts[id] ?? 0;

/**
 * Annex XX "low"/"very low" basis: per reference portion when the portion is
 * larger than 30 g or ml, per 50 g or ml otherwise.
 */
function lowBasis(ctx: ClaimContext, id: string): number {
  return ctx.portionSize > 30 ? at(ctx.perPortion, id) : at(ctx.per100, id) / 2;
}

const LOW_ENERGY_PHRASE =
  "Este não é um alimento baixo ou reduzido em valor energético";

type Rule = {
  id: string;
  nutrient: string;
  attribute: ClaimAttribute;
  check: (ctx: ClaimContext, met: (id: string) => boolean) => string[];
  confirmationsPt?: string[];
  phrases?: (ctx: ClaimContext, met: (id: string) => boolean) => string[];
};

function needsReference(ctx: ClaimContext): string[] {
  return ctx.reference
    ? []
    : ["Informe o alimento de referência (RDC 429/2020 Art. 28)."];
}

function minReduction(ctx: ClaimContext, id: string, label: string): string[] {
  if (!ctx.reference) return needsReference(ctx);
  const reference = at(ctx.reference, id);
  return reference > 0 && at(ctx.perPortion, id) <= reference * 0.75
    ? []
    : [`${label}: redução mínima de 25% em relação ao alimento de referência.`];
}

function minIncrease(ctx: ClaimContext, id: string, label: string): string[] {
  if (!ctx.reference) return needsReference(ctx);
  return at(ctx.perPortion, id) >= at(ctx.reference, id) * 1.25
    ? []
    : [`${label}: aumento mínimo de 25% em relação ao alimento de referência.`];
}

function noFrontLabel(ctx: ClaimContext, nutrient: string, label: string): string[] {
  return ctx.frontLabelNutrients.includes(nutrient) && !ctx.frontLabelExempt
    ? [`Atinge o limite do Anexo XV para ${label}.`]
    : [];
}

function maxBoth(ctx: ClaimContext, id: string, max: number, label: string): string[] {
  return at(ctx.perPortion, id) <= max && at(ctx.per100, id) <= max
    ? []
    : [`${label}: máximo de ${max} por porção e por 100 g ou ml.`];
}

function maxLow(ctx: ClaimContext, id: string, max: number, label: string): string[] {
  return lowBasis(ctx, id) <= max
    ? []
    : [`${label}: máximo de ${max} por porção (ou por 50 g/ml em porções até 30 g/ml).`];
}

/** Whether the reference food already meets a "low" limit (Annex XX). */
function referenceIsLow(ctx: ClaimContext, id: string, max: number): boolean {
  if (!ctx.reference) return false;
  const perPortion = at(ctx.reference, id);
  const basis =
    ctx.portionSize > 30 ? perPortion : (perPortion * 100) / ctx.portionSize / 2;
  return basis <= max;
}

function percentOfVdr(ctx: ClaimContext, id: string): number {
  const vdr = dailyValues.values[id]?.amount;
  return vdr ? (at(ctx.perPortion, id) / vdr) * 100 : 0;
}

function satFatEnergyShare(ctx: ClaimContext): number {
  const energy = at(ctx.perPortion, "energy");
  return energy > 0 ? (at(ctx.perPortion, "saturatedFat") * 9) / energy : 0;
}

const energyPhrase = (_ctx: ClaimContext, met: (id: string) => boolean) =>
  met("energy.low") || met("energy.reduced") ? [] : [LOW_ENERGY_PHRASE];

const RULES: Rule[] = [
  // 1. Valor energético
  {
    id: "energy.free",
    nutrient: "energy",
    attribute: "free",
    check: (ctx) => maxBoth(ctx, "energy", 4, "Valor energético (kcal)"),
  },
  {
    id: "energy.low",
    nutrient: "energy",
    attribute: "low",
    check: (ctx) => maxLow(ctx, "energy", 40, "Valor energético (kcal)"),
  },
  {
    id: "energy.reduced",
    nutrient: "energy",
    attribute: "reduced",
    check: (ctx) => [
      ...minReduction(ctx, "energy", "Valor energético"),
      ...(referenceIsLow(ctx, "energy", 40)
        ? ["O alimento de referência já é baixo em valor energético."]
        : []),
    ],
  },
  // 2. Açúcares
  {
    id: "sugars.free",
    nutrient: "totalSugars",
    attribute: "free",
    check: (ctx) => [
      ...maxBoth(ctx, "totalSugars", 0.5, "Açúcares (g)"),
      ...(at(ctx.perPortion, "addedSugars") > 0
        ? ["Nenhum açúcar pode ser declarado acima de zero na tabela."]
        : []),
    ],
    phrases: (ctx, met) => [
      "Ingredientes com açúcares devem ter asterisco e a nota “(*) fornece quantidades não significativas de açúcares” após a lista de ingredientes",
      ...energyPhrase(ctx, met),
    ],
  },
  {
    id: "sugars.low",
    nutrient: "totalSugars",
    attribute: "low",
    check: (ctx) => [
      ...noFrontLabel(ctx, "addedSugars", "açúcares adicionados"),
      ...maxLow(ctx, "totalSugars", 5, "Açúcares (g)"),
    ],
    phrases: energyPhrase,
  },
  {
    id: "sugars.noAdded",
    nutrient: "addedSugars",
    attribute: "noAdded",
    check: (ctx) =>
      at(ctx.perPortion, "addedSugars") > 0 || at(ctx.per100, "addedSugars") > 0
        ? ["O alimento contém açúcares adicionados."]
        : [],
    confirmationsPt: [
      "Nenhum ingrediente contém açúcares adicionados.",
      "Nenhum ingrediente com açúcares naturais é usado para substituir açúcares e dar sabor doce.",
      "Nenhum processo (ex.: enzimas) aumenta o conteúdo de açúcares no produto final.",
    ],
    phrases: (ctx, met) => [
      ...(met("sugars.free") ? [] : ["contém açúcares próprios dos ingredientes"]),
      ...energyPhrase(ctx, met),
    ],
  },
  {
    id: "sugars.reduced",
    nutrient: "totalSugars",
    attribute: "reduced",
    check: (ctx) => [
      ...noFrontLabel(ctx, "addedSugars", "açúcares adicionados"),
      ...minReduction(ctx, "totalSugars", "Açúcares"),
      ...(ctx.reference &&
      at(ctx.reference, "totalSugars") - at(ctx.perPortion, "totalSugars") < 5
        ? ["Açúcares: diferença mínima de 5 g por porção em relação ao alimento de referência."]
        : []),
    ],
    phrases: energyPhrase,
  },
  // 4. Gorduras totais
  {
    id: "totalFat.free",
    nutrient: "totalFat",
    attribute: "free",
    check: (ctx, met) => [
      ...maxBoth(ctx, "totalFat", 0.5, "Gorduras totais (g)"),
      ...(met("saturatedFat.free") && met("transFat.free")
        ? []
        : ["Precisa atender a não contém gorduras saturadas e gorduras trans."]),
    ],
    confirmationsPt: [
      "O alimento atende aos critérios de não contém colesterol.",
      "Nenhum tipo de gordura é declarado acima de zero na tabela.",
    ],
    phrases: (ctx, met) => [
      "Ingredientes com gorduras devem ter asterisco e a nota “(*) fornece quantidades não significativas de gorduras” após a lista de ingredientes",
      ...energyPhrase(ctx, met),
    ],
  },
  {
    id: "totalFat.low",
    nutrient: "totalFat",
    attribute: "low",
    check: (ctx) => [
      ...noFrontLabel(ctx, "saturatedFat", "gorduras saturadas"),
      ...maxLow(ctx, "totalFat", 3, "Gorduras totais (g)"),
    ],
    phrases: energyPhrase,
  },
  {
    id: "totalFat.noAdded",
    nutrient: "totalFat",
    attribute: "noAdded",
    check: (ctx) => noFrontLabel(ctx, "saturatedFat", "gorduras saturadas"),
    confirmationsPt: [
      "Não há gorduras ou óleos de origem animal ou vegetal adicionados.",
      "Não há manteiga, margarina ou cremes vegetais adicionados.",
      "Não há creme de leite ou derivados adicionados.",
      "Nenhum ingrediente contém os ingredientes acima adicionados.",
    ],
    phrases: (ctx, met) => [
      ...(met("totalFat.free") ? [] : ["contém gordura própria dos ingredientes"]),
      ...energyPhrase(ctx, met),
    ],
  },
  {
    id: "totalFat.reduced",
    nutrient: "totalFat",
    attribute: "reduced",
    check: (ctx) => [
      ...noFrontLabel(ctx, "saturatedFat", "gorduras saturadas"),
      ...minReduction(ctx, "totalFat", "Gorduras totais"),
      ...(referenceIsLow(ctx, "totalFat", 3)
        ? ["O alimento de referência já é baixo em gorduras totais."]
        : []),
    ],
    phrases: energyPhrase,
  },
  // 5. Gorduras saturadas
  {
    id: "saturatedFat.free",
    nutrient: "saturatedFat",
    attribute: "free",
    check: (ctx, met) => [
      ...maxBoth(ctx, "saturatedFat", 0.1, "Gorduras saturadas (g)"),
      ...(met("transFat.free") ? [] : ["Precisa atender a não contém gorduras trans."]),
    ],
  },
  {
    id: "saturatedFat.low",
    nutrient: "saturatedFat",
    attribute: "low",
    check: (ctx) => [
      ...noFrontLabel(ctx, "saturatedFat", "gorduras saturadas"),
      ...((ctx.portionSize > 30
        ? at(ctx.perPortion, "saturatedFat") + at(ctx.perPortion, "transFat")
        : (at(ctx.per100, "saturatedFat") + at(ctx.per100, "transFat")) / 2) <= 1.5
        ? []
        : ["Gorduras saturadas + trans: máximo de 1,5 g por porção (ou por 50 g/ml em porções até 30 g/ml)."]),
      ...(at(ctx.perPortion, "transFat") <= 0.1 && at(ctx.per100, "transFat") <= 0.1
        ? []
        : ["Precisa atender a não contém gorduras trans."]),
      ...(satFatEnergyShare(ctx) <= 0.1
        ? []
        : ["No máximo 10% do valor energético pode vir de gorduras saturadas."]),
    ],
  },
  {
    id: "saturatedFat.reduced",
    nutrient: "saturatedFat",
    attribute: "reduced",
    check: (ctx) => [
      ...noFrontLabel(ctx, "saturatedFat", "gorduras saturadas"),
      ...minReduction(ctx, "saturatedFat", "Gorduras saturadas"),
      ...(ctx.reference && at(ctx.perPortion, "transFat") > at(ctx.reference, "transFat")
        ? ["A redução não pode aumentar as gorduras trans."]
        : []),
      ...(satFatEnergyShare(ctx) <= 0.1
        ? []
        : ["No máximo 10% do valor energético pode vir de gorduras saturadas."]),
    ],
  },
  // 6. Gorduras trans
  {
    id: "transFat.free",
    nutrient: "transFat",
    attribute: "free",
    check: (ctx, met) => [
      ...maxBoth(ctx, "transFat", 0.1, "Gorduras trans (g)"),
      ...(met("saturatedFat.low") ? [] : ["Precisa atender a baixo em gorduras saturadas."]),
    ],
  },
  // 8. Sódio
  {
    id: "sodium.free",
    nutrient: "sodium",
    attribute: "free",
    check: (ctx) => maxBoth(ctx, "sodium", 5, "Sódio (mg)"),
  },
  {
    id: "sodium.veryLow",
    nutrient: "sodium",
    attribute: "veryLow",
    check: (ctx) => [
      ...noFrontLabel(ctx, "sodium", "sódio"),
      ...maxLow(ctx, "sodium", 40, "Sódio (mg)"),
    ],
  },
  {
    id: "sodium.low",
    nutrient: "sodium",
    attribute: "low",
    check: (ctx) => [
      ...noFrontLabel(ctx, "sodium", "sódio"),
      ...maxLow(ctx, "sodium", 80, "Sódio (mg)"),
    ],
  },
  {
    id: "sodium.reduced",
    nutrient: "sodium",
    attribute: "reduced",
    check: (ctx) => [
      ...noFrontLabel(ctx, "sodium", "sódio"),
      ...minReduction(ctx, "sodium", "Sódio"),
      ...(referenceIsLow(ctx, "sodium", 80)
        ? ["O alimento de referência já é baixo em sódio."]
        : []),
    ],
  },
  // 9. Sal
  {
    id: "salt.noAdded",
    nutrient: "sodium",
    attribute: "noAdded",
    check: (ctx) =>
      ctx.frontLabelNutrients.includes("sodium")
        ? ["O produto não pode ter rotulagem nutricional frontal de sódio."]
        : [],
    confirmationsPt: [
      "Não há sal (cloreto de sódio) adicionado.",
      "Não há outros sais de sódio adicionados.",
      "Nenhum ingrediente tem sais de sódio adicionados.",
      "O alimento de referência contém sal ou outro sal de sódio adicionado.",
    ],
    phrases: (_ctx, met) =>
      met("sodium.free") ? [] : ["contém sódio próprio dos ingredientes"],
  },
  // 13. Proteínas e 14. Fibras alimentares
  ...(["proteins", "dietaryFiber"] as const).flatMap((id): Rule[] => {
    const label = id === "proteins" ? "Proteínas" : "Fibras alimentares";
    const aminoAcids =
      id === "proteins"
        ? ["Os aminoácidos essenciais da proteína adicionada atendem ao Anexo XXI."]
        : [];
    return [
      {
        id: `${id}.source`,
        nutrient: id,
        attribute: "source",
        check: (ctx) =>
          percentOfVdr(ctx, id) >= 10 ? [] : [`${label}: mínimo de 10% do VDR por porção.`],
        confirmationsPt: aminoAcids,
      },
      {
        id: `${id}.high`,
        nutrient: id,
        attribute: "high",
        check: (ctx) =>
          percentOfVdr(ctx, id) >= 20 ? [] : [`${label}: mínimo de 20% do VDR por porção.`],
        confirmationsPt: aminoAcids,
      },
      {
        id: `${id}.increased`,
        nutrient: id,
        attribute: "increased",
        check: (ctx) => [
          ...minIncrease(ctx, id, label),
          ...(ctx.reference && (at(ctx.reference, id) / (dailyValues.values[id]?.amount ?? 1)) * 100 < 10
            ? [`O alimento de referência precisa ser fonte de ${label.toLowerCase()}.`]
            : []),
        ],
        confirmationsPt: aminoAcids,
      },
    ];
  }),
  // 15. Vitaminas e minerais
  ...nutrients.vitaminsAndMinerals.flatMap((nutrient): Rule[] => [
    {
      id: `${nutrient.id}.source`,
      nutrient: nutrient.id,
      attribute: "source",
      check: (ctx) =>
        percentOfVdr(ctx, nutrient.id) >= 15
          ? []
          : [`${nutrient.labelPt}: mínimo de 15% do VDR por porção.`],
    },
    {
      id: `${nutrient.id}.high`,
      nutrient: nutrient.id,
      attribute: "high",
      check: (ctx) =>
        percentOfVdr(ctx, nutrient.id) >= 30
          ? []
          : [`${nutrient.labelPt}: mínimo de 30% do VDR por porção.`],
    },
    {
      id: `${nutrient.id}.increased`,
      nutrient: nutrient.id,
      attribute: "increased",
      check: (ctx) => [
        ...minIncrease(ctx, nutrient.id, nutrient.labelPt),
        ...(ctx.reference &&
        (at(ctx.reference, nutrient.id) / (dailyValues.values[nutrient.id]?.amount ?? 1)) * 100 < 15
          ? [`O alimento de referência precisa ser fonte de ${nutrient.labelPt}.`]
          : []),
      ],
    },
  ]),
];

const RULES_BY_ID = new Map(RULES.map((rule) => [rule.id, rule]));

export const nutritionClaimIds: readonly string[] = RULES.map((rule) => rule.id);

export function isNutritionClaim(id: string): boolean {
  return RULES_BY_ID.has(id);
}

/**
 * Evaluates every nutritional claim of IN 75/2020 Annex XX that can be
 * computed from the nutrition data (RDC 429/2020 Arts. 24 to 28). Lactose,
 * cholesterol and omega 3/6/9 claims need data the table does not have and
 * are not listed. A claim may be used only when `eligible` is true and the
 * manufacturer confirms every item of `confirmationsPt`.
 */
export function evaluateNutritionClaims(ctx: ClaimContext): ClaimEvaluation[] {
  const cache = new Map<string, string[]>();
  const reasonsOf = (id: string): string[] => {
    const cached = cache.get(id);
    if (cached) return cached;
    const rule = RULES_BY_ID.get(id);
    if (!rule) return ["Alegação desconhecida."];
    cache.set(id, []);
    const reasons = rule.check(ctx, met);
    cache.set(id, reasons);
    return reasons;
  };
  const met = (id: string) => reasonsOf(id).length === 0;

  return RULES.map((rule) => {
    const reasonsPt = reasonsOf(rule.id);
    return {
      id: rule.id,
      nutrient: rule.nutrient,
      attribute: rule.attribute,
      termsPt: claimTerms[rule.attribute],
      eligible: reasonsPt.length === 0,
      reasonsPt,
      confirmationsPt: rule.confirmationsPt ?? [],
      requiredPhrasesPt: rule.phrases?.(ctx, met) ?? [],
    };
  });
}
