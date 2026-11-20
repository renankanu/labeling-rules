import mappingData from "./data/portion-to-front-label-category.json";
import {
  frontLabelProhibitedCategories,
  type FrontLabelProhibitedCategoryId,
} from "./front-label";

const portionToCategory = mappingData as Record<
  string,
  FrontLabelProhibitedCategoryId
>;

const categoryLabelById = new Map(
  frontLabelProhibitedCategories.map((category) => [
    category.id,
    category.labelPt,
  ]),
);

export type SuggestedFrontLabelCategory = {
  id: FrontLabelProhibitedCategoryId;
  labelPt: string;
};

/**
 * Suggests an Anexo XVI prohibited category when the Anexo V product has an
 * unequivocal regulatory match. Returns null when unmapped or unknown id.
 */
export function suggestedFrontLabelCategory(
  portionReferenceProductId: string | null | undefined,
): SuggestedFrontLabelCategory | null {
  if (!portionReferenceProductId?.trim()) {
    return null;
  }

  const categoryId = portionToCategory[portionReferenceProductId];
  if (!categoryId) {
    return null;
  }

  const labelPt = categoryLabelById.get(categoryId);
  if (!labelPt) {
    return null;
  }

  return { id: categoryId, labelPt };
}