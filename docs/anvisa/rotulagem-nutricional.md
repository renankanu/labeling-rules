# Rotulagem Nutricional — ANVISA

## Legislação aplicável

- **RDC 429/2020** — regras gerais de rotulagem nutricional
  - PDF: https://bvsms.saude.gov.br/bvs/saudelegis/anvisa/2020/RDC_429_2020_.pdf
- **IN 75/2020** — anexos com valores de referência, porções, formatos e critérios
  - PDF: https://bvsms.saude.gov.br/bvs/saudelegis/anvisa/2020/IN%2075_2020_.pdf

## Cobertura do `labeling-rules`

Cada regra fica em `src/` com testes que travam os valores da norma.

| Regra | Norma | Módulo |
| --- | --- | --- |
| Nutrientes obrigatórios: nomes, ordem, recuo, unidades, abreviações | RDC Art. 5º; IN Anexo XI | `nutrients` |
| Vitaminas e minerais: nomes e nomes alternativos | IN Anexo XI | `nutrients.vitaminsAndMinerals` |
| VDR gerais | IN Anexo II | `dailyValues` |
| VDR por grupo populacional (suplementos, fins especiais) | IN Anexo VIII; RDC Art. 12 § 4º | `dailyValueFor` |
| Quantidades não significativas (declarar 0) | IN Anexo IV | `nonSignificantNutrients` |
| Valor energético pelos fatores de conversão | IN Anexo XXII; RDC Art. 32 § 1º | `calculateEnergyKcal` |
| Porções de referência (138 produtos, 8 grupos) | IN Anexo V; RDC Arts. 8º e 9º | `portions`, `validatePortion` |
| Alimento que exige preparo (porção e nota "**") | RDC Art. 8º §§ 4º e 5º | `validatePortion`, `PREPARED_FOOD_FOOTNOTE` |
| Medidas caseiras e fração irredutível | IN Anexo VII; RDC Art. 11 | `householdUtensils`, `formatHouseholdMeasure` |
| Tipografia da tabela (padrão e reduzida) e do linear | IN Anexos XII e XIV; RDC Art. 16 | `tableTypography`, `linearTypography` |
| Declaração simplificada | IN Anexo X; RDC Arts. 15 § 3º e 16 § 3º | `nonSignificantStatement`, `simplifiedVitaminsAndMinerals` |
| Limites da lupa "ALTO EM" | IN Anexo XV; RDC Art. 18 | `frontLabelWarnings` |
| Alimentos com lupa vedada | IN Anexo XVI; RDC Art. 18 § 1º | `frontLabelProhibitedCategories` |
| Tamanho mínimo da lupa | IN Anexo XVIII; RDC Art. 22 | `frontLabelSize` |
| Embalagem múltipla | RDC Arts. 13 e 20 | `multipackDeclaration` |
| Alegações nutricionais (absolutas e comparativas) | IN Anexos XIX e XX; RDC Arts. 24 a 28 | `evaluateNutritionClaims` |
| Declaração de alérgenos (`ALÉRGICOS: …`, derivados, PODE CONTER) | RDC 727/2022, Cap. III, Seção IV; Anexo III | `allergen-declaration` |
| Lactose (`CONTÉM LACTOSE`, `ZERO LACTOSE`, `BAIXO TEOR DE LACTOSE`) | RDC 727/2022 Art. 18; RDC 715/2022 Art. 8º VII/VIII | `allergen-declaration` |
| Glúten (`CONTÉM GLÚTEN`, `NÃO CONTÉM GLÚTEN`) | RDC 40/2002; Lei 10.674/2003 (remissão RDC 727) | `allergen-declaration` |

PDFs: `RDC_727_2022.pdf`, `RDC_715_2022.pdf`, `RDC_040_2002.pdf` (ver `links.md`). Testes: `tests/allergen-declaration.test.ts`, `tests/normative-assets.test.ts`. Matriz AL1/AL2 na `axiom-api`: `generate-recipe-nutrition-label-allergens.int.test.ts`.

## Limites conhecidos

- **Arredondamento (Anexo III) e número de porções (Anexo VI):** implementados na `axiom-api`, não neste pacote.
- **Alegações:** lactose, colesterol e ômega 3/6/9 dependem de dados que a tabela não tem e não são avaliadas. Condições de ingrediente e processo (ex.: "sem adição de açúcares", perfil de aminoácidos do Anexo XXI) voltam como confirmações para o fabricante.
- **Lupa nos itens 1 a 6 do Anexo XVI com ingredientes adicionados (Art. 18 § 2º):** fica a cargo de quem escolhe a categoria.
- **Anexo VIII, molibdênio para gestantes:** o texto publicado traz 5 µg, mantido como está.
- **Modelo agregado:** a `axiom-api` gera HTML e JSON; PNG/PDF ainda não.
