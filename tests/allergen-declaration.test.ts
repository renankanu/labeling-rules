import { describe, expect, test } from "bun:test";
import {
  buildAllergenDeclarations,
  buildGlutenDeclaration,
  buildLactoseDeclaration,
  buildRecipeAllergenDeclarations,
  formatAllergenPhrase,
  inferDeclarationFormFromName,
  mergeDeclarationForms,
  normalizeAllergenBaseName,
  stripDerivadosPrefix,
} from "../src/allergen-declaration";

describe("RDC 727/2022 Art. 16 — advertências ALÉRGICOS", () => {
  test("lista direta Leite e Trigo em uma linha ALÉRGICOS (Anexo III)", () => {
    expect(
      buildAllergenDeclarations([
        { name: "Leite", prefix: "CONTEM", declarationForm: "DIRETO" },
        { name: "Trigo", prefix: "CONTEM", declarationForm: "DIRETO" },
      ]),
    ).toEqual(["ALÉRGICOS: CONTÉM LEITE E TRIGO."]);
  });

  test("derivados e PODE CONTER na mesma declaração ALÉRGICOS", () => {
    expect(
      buildAllergenDeclarations([
        { name: "Soja", prefix: "CONTEM", declarationForm: "DIRETO" },
        { name: "Trigo", prefix: "CONTEM", declarationForm: "DERIVADOS" },
        { name: "Triticale", prefix: "PODE_CONTER", declarationForm: "DIRETO" },
      ]),
    ).toEqual([
      "ALÉRGICOS: CONTÉM SOJA E DERIVADOS DE TRIGO. PODE CONTER TRITICALE.",
    ]);
  });

  test("formatAllergenPhrase agrupa só derivados CONTÉM", () => {
    expect(
      formatAllergenPhrase({
        prefix: "CONTEM",
        form: "DERIVADOS",
        names: ["Trigo", "Triticale", "Soja"],
      }),
    ).toBe("ALÉRGICOS: CONTÉM DERIVADOS DE SOJA, TRIGO E TRITICALE.");
  });
});

describe("helpers de forma de declaração (RDC 727/2022)", () => {
  test("stripDerivadosPrefix e inferDeclarationFormFromName", () => {
    expect(stripDerivadosPrefix("DERIVADOS DE LEITE")).toBe("LEITE");
    expect(inferDeclarationFormFromName("DERIVADOS DE SOJA")).toBe("DERIVADOS");
    expect(inferDeclarationFormFromName("Trigo")).toBe("DIRETO");
    expect(normalizeAllergenBaseName("DERIVADOS DE TRITICALE")).toBe(
      "TRITICALE",
    );
  });

  test("mergeDeclarationForms une DIRETO e DERIVADOS em MISTO", () => {
    expect(mergeDeclarationForms("DIRETO", "DERIVADOS")).toBe("MISTO");
    expect(mergeDeclarationForms("DERIVADOS", "DIRETO")).toBe("MISTO");
  });
});

describe("RDC 727/2022 Art. 18 e RDC 715/2022 Art. 8º — lactose", () => {
  test("CONTÉM LACTOSE quando marcado CONTEM (Art. 18)", () => {
    expect(buildLactoseDeclaration("CONTEM")).toEqual(["CONTÉM LACTOSE."]);
  });

  test("ZERO LACTOSE (RDC 715/2022 Art. 8º VII)", () => {
    expect(buildLactoseDeclaration("ZERO")).toEqual(["ZERO LACTOSE."]);
  });

  test("BAIXO TEOR DE LACTOSE (RDC 715/2022 Art. 8º VIII)", () => {
    expect(buildLactoseDeclaration("BAIXO")).toEqual([
      "BAIXO TEOR DE LACTOSE.",
    ]);
  });

  test("NAO_DECLARAR não gera linha", () => {
    expect(buildLactoseDeclaration("NAO_DECLARAR")).toEqual([]);
  });
});

describe("RDC 40/2002 e Lei 10.674/2003 — glúten", () => {
  test("CONTÉM GLÚTEN (RDC 40/2002 item 2.1)", () => {
    expect(buildGlutenDeclaration("CONTEM")).toEqual(["CONTÉM GLÚTEN."]);
  });

  test("NÃO CONTÉM GLÚTEN (Lei 10.674/2003 Art. 1º)", () => {
    expect(buildGlutenDeclaration("NAO_CONTEM")).toEqual(["NÃO CONTÉM GLÚTEN."]);
  });

  test("NAO_INFORMADO não gera linha", () => {
    expect(buildGlutenDeclaration("NAO_INFORMADO")).toEqual([]);
  });
});

describe("buildRecipeAllergenDeclarations — composição de rótulo", () => {
  test("G2 brigadeiro: Leite + lactose CONTEM", () => {
    expect(
      buildRecipeAllergenDeclarations({
        allergens: [
          { name: "Leite", prefix: "CONTEM", declarationForm: "DIRETO" },
        ],
        lactose: "CONTEM",
        gluten: "NAO_INFORMADO",
      }),
    ).toEqual(["ALÉRGICOS: CONTÉM LEITE.", "CONTÉM LACTOSE."]);
  });

  test("lactose ZERO e glúten ausente na mesma lista", () => {
    expect(
      buildRecipeAllergenDeclarations({
        allergens: [],
        lactose: "ZERO",
        gluten: "NAO_CONTEM",
      }),
    ).toEqual(["ZERO LACTOSE.", "NÃO CONTÉM GLÚTEN."]);
  });
});