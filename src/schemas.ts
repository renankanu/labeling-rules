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