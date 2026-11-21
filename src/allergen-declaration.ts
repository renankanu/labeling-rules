/**
 * Declaração de alérgenos, lactose e glúten em rótulo.
 *
 * Alérgenos: RDC 727/2022, Cap. III, Seção IV (Art. 16 e seguintes; Anexo III).
 * Lactose: RDC 727/2022, Seção V (Art. 18 — "CONTÉM LACTOSE"); RDC 715/2022, Art. 8º
 * VII/VIII ("ZERO LACTOSE", "BAIXO TEOR DE LACTOSE").
 * Glúten: RDC 40/2002, item 2.1 ("CONTÉM GLÚTEN"); Lei 10.674/2003, Art. 1º ("NÃO CONTÉM GLÚTEN").
 */

export type AllergenDeclarationForm = "DIRETO" | "DERIVADOS" | "MISTO";

export type AllergenPrefix = "CONTEM" | "PODE_CONTER";

export type LactoseDeclaration =
  | "CONTEM"
  | "ZERO"
  | "BAIXO"
  | "NAO_DECLARAR";

export type GlutenDeclaration = "CONTEM" | "NAO_CONTEM" | "NAO_INFORMADO";

export type AllergenDeclarationItem = {
  name: string;
  prefix: AllergenPrefix;
  declarationForm: AllergenDeclarationForm;
};

const DERIVADOS_PREFIX = /^DERIVADOS\s+DE\s+/i;

export function stripDerivadosPrefix(name: string): string {
  return name.trim().replace(DERIVADOS_PREFIX, "").trim();
}

export function inferDeclarationFormFromName(
  name: string,
): AllergenDeclarationForm {
  return DERIVADOS_PREFIX.test(name.trim()) ? "DERIVADOS" : "DIRETO";
}

export function normalizeAllergenBaseName(name: string): string {
  return stripDerivadosPrefix(name).trim();
}

function formatAnvisaList(items: string[]): string {
  if (items.length === 0) {
    return "";
  }
  if (items.length === 1) {
    return items[0]!;
  }
  return items.slice(0, -1).join(", ") + " E " + items[items.length - 1]!;
}

function sortedNames(names: Iterable<string>): string[] {
  return [...names]
    .map((name) => name.trim().toLocaleUpperCase("pt-BR"))
    .filter(Boolean)
    .sort();
}

type AllergenGroupKey = `${AllergenPrefix}:${AllergenDeclarationForm}`;

function collectAllergenGroups(allergens: AllergenDeclarationItem[]) {
  const groups = new Map<
    AllergenGroupKey,
    {
      prefix: AllergenPrefix;
      form: AllergenDeclarationForm;
      names: Set<string>;
    }
  >();

  for (const allergen of allergens) {
    const baseName = normalizeAllergenBaseName(allergen.name);
    if (!baseName) {
      continue;
    }

    const key =
      `${allergen.prefix}:${allergen.declarationForm}` as AllergenGroupKey;
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        prefix: allergen.prefix,
        form: allergen.declarationForm,
        names: new Set([baseName.toLocaleUpperCase("pt-BR")]),
      });
      continue;
    }

    existing.names.add(baseName.toLocaleUpperCase("pt-BR"));
  }

  return groups;
}

function buildContemClause(
  groups: ReturnType<typeof collectAllergenGroups>,
): string {
  const direto = groups.get("CONTEM:DIRETO")?.names;
  const derivados = groups.get("CONTEM:DERIVADOS")?.names;
  const misto = groups.get("CONTEM:MISTO")?.names;

  const clauses: string[] = [];

  if (direto?.size && derivados?.size) {
    clauses.push(
      `CONTÉM ${formatAnvisaList(sortedNames(direto))} E DERIVADOS DE ${formatAnvisaList(sortedNames(derivados))}.`,
    );
  } else {
    if (direto?.size) {
      clauses.push(`CONTÉM ${formatAnvisaList(sortedNames(direto))}.`);
    }

    if (derivados?.size) {
      clauses.push(
        `CONTÉM DERIVADOS DE ${formatAnvisaList(sortedNames(derivados))}.`,
      );
    }
  }

  if (misto?.size) {
    clauses.push(`CONTÉM ${formatAnvisaList(sortedNames(misto))} E DERIVADOS.`);
  }

  return clauses.join(" ");
}

function buildPodeConterClause(
  groups: ReturnType<typeof collectAllergenGroups>,
): string {
  const podeConter = groups.get("PODE_CONTER:DIRETO")?.names;
  if (!podeConter?.size) {
    return "";
  }

  return `PODE CONTER ${formatAnvisaList(sortedNames(podeConter))}.`;
}

export function formatAllergenPhrase(input: {
  prefix: AllergenPrefix;
  form: AllergenDeclarationForm;
  names: string[];
}): string {
  const groups = collectAllergenGroups(
    input.names.map((name) => ({
      name,
      prefix: input.prefix,
      declarationForm: input.form,
    })),
  );

  const body =
    input.prefix === "PODE_CONTER"
      ? buildPodeConterClause(groups)
      : buildContemClause(groups);

  if (!body) {
    return "";
  }

  return `ALÉRGICOS: ${body}`;
}

const FORM_PRIORITY: Record<AllergenDeclarationForm, number> = {
  MISTO: 3,
  DERIVADOS: 2,
  DIRETO: 1,
};

export function mergeDeclarationForms(
  current: AllergenDeclarationForm,
  incoming: AllergenDeclarationForm,
): AllergenDeclarationForm {
  if (current === incoming) {
    return current;
  }

  if (
    (current === "DIRETO" && incoming === "DERIVADOS") ||
    (current === "DERIVADOS" && incoming === "DIRETO")
  ) {
    return "MISTO";
  }

  return FORM_PRIORITY[incoming] > FORM_PRIORITY[current] ? incoming : current;
}

export function buildAllergenDeclarations(
  allergens: AllergenDeclarationItem[],
): string[] {
  const groups = collectAllergenGroups(allergens);
  const contemClause = buildContemClause(groups);
  const podeConterClause = buildPodeConterClause(groups);
  const body = [contemClause, podeConterClause].filter(Boolean).join(" ");

  if (!body) {
    return [];
  }

  return [`ALÉRGICOS: ${body}`];
}

export function buildLactoseDeclaration(lactose: LactoseDeclaration): string[] {
  if (lactose === "CONTEM") {
    return ["CONTÉM LACTOSE."];
  }
  if (lactose === "ZERO") {
    return ["ZERO LACTOSE."];
  }
  if (lactose === "BAIXO") {
    return ["BAIXO TEOR DE LACTOSE."];
  }
  return [];
}

export function buildGlutenDeclaration(gluten: GlutenDeclaration): string[] {
  if (gluten === "CONTEM") {
    return ["CONTÉM GLÚTEN."];
  }
  if (gluten === "NAO_CONTEM") {
    return ["NÃO CONTÉM GLÚTEN."];
  }
  return [];
}

export function buildRecipeAllergenDeclarations(input: {
  allergens: AllergenDeclarationItem[];
  lactose: LactoseDeclaration;
  gluten: GlutenDeclaration;
}): string[] {
  return [
    ...buildAllergenDeclarations(input.allergens),
    ...buildLactoseDeclaration(input.lactose),
    ...buildGlutenDeclaration(input.gluten),
  ];
}