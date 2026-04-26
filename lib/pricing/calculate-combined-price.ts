import { calculateCleaningPrice } from "./calculate-cleaning-price";
import { calculateReformPrice } from "./calculate-reform-price";

export function calculateCombinedPrice(input: {
  reform: Parameters<typeof calculateReformPrice>[0];
  cleaning: Parameters<typeof calculateCleaningPrice>[0];
}) {
  const reformPrice = calculateReformPrice(input.reform);
  const cleaningPrice = calculateCleaningPrice(input.cleaning);

  return {
    reformPrice,
    cleaningPrice,
    total: reformPrice + cleaningPrice,
  };
}