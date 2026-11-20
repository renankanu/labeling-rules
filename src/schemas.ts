import { z } from "zod";

export const unitSchema = z.enum(["kcal", "g", "mg", "mcg"]);

export const dailyValuesSchema = z.object({
  source: z.string().min(1),
  values: z.record(
    z.string(),
    z.object({
      amount: z.number().positive(),
      unit: unitSchema,
    }),
  ),
});

export const nutrientsSchema = z.object({
  source: z.string().min(1),
  mandatory: z.array(
    z.object({
      id: z.string().min(1),
      labelPt: z.string().min(1),
      abbreviationPt: z.string().min(1).optional(),
      unit: unitSchema,
      indent: z.number().int().min(0).max(2),
    }),
  ),
  vitaminsAndMinerals: z.array(
    z.object({
      id: z.string().min(1),
      labelPt: z.string().min(1),
      alternativeNamesPt: z.array(z.string().min(1)).optional(),
      abbreviationPt: z.string().min(1).optional(),
      unit: unitSchema,
    }),
  ),
});
const portionUnitSchema = z.enum(["g", "ml"]);

export const referencePortionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("fixed"),
    options: z
      .array(
        z.object({
          amount: z.number().positive(),
          unit: portionUnitSchema.optional(),
        }),
      )
      .min(1),
  }),
  z.object({
    kind: z.literal("toPrepare"),
    preparedAmount: z.number().positive().optional(),
    unit: portionUnitSchema.optional(),
    preparedDescriptionPt: z.string().min(1).optional(),
  }),
  z.object({ kind: z.literal("manufacturerDefined") }),
  z.object({
    kind: z.literal("alcoholEquivalent"),
    ethanolGrams: z.number().positive(),
  }),
]);

export const portionsSchema = z.object({
  source: z.string().min(1),
  groups: z.array(
    z.object({
      id: z.string().min(1),
      labelPt: z.string().min(1),
      averageEnergyKcal: z.number().positive().optional(),
    }),
  ),
  products: z.array(
    z.object({
      id: z.string().min(1),
      group: z.string().min(1),
      labelPt: z.string().min(1),
      portion: referencePortionSchema,
      householdMeasuresPt: z.string().min(1),
    }),
  ),
});
