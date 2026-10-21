// Where badges and flags link into the Learn section.
import type { CriterionKey } from '../nearby/types';
import type { AvoidKey } from '../profile/options';

export const CRITERION_ARTICLE: Record<CriterionKey, string> = {
  seedOilFree: 'seed-oils',
  freshIngredients: 'ultra-processed',
  sugarFree: 'added-sugar',
  noAddedSugar: 'added-sugar',
};

// Product flags: a matched ingredient can point to a more specific article.
export function articleForFlag(key: AvoidKey, matched: string[] = []): string | null {
  if (key === 'addedSugar') {
    if (matched.some((m) => m.includes('maltodextrin'))) return 'maltodextrin';
    if (matched.some((m) => m.includes('corn syrup') || m.includes('glucose-fructose'))) return 'hfcs';
    return 'added-sugar';
  }
  if (key === 'seedOils') return 'seed-oils';
  if (key === 'ultraProcessed') return 'ultra-processed';
  if (key === 'transFats') return 'trans-fats';
  if (key === 'artificialSweeteners') return 'artificial-sweeteners';
  if (key === 'alcohol') return 'alcohol';
  return null;
}
