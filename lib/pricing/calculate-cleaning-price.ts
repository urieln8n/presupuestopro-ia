export function calculateCleaningPrice(input: {
  cleaningType: string;
  squareMeters: number;
  hasConstructionResidue?: boolean;
  windowsIncluded?: boolean;
  terraceIncluded?: boolean;
  urgencyLevel?: string;
}) {
  const basePrices: Record<string, number> = {
    basic: 2,
    deep: 4,
    post_construction: 6,
    airbnb: 3.5,
    office: 2.5,
  };

  const pricePerMeter = basePrices[input.cleaningType] ?? 3;

  let total = input.squareMeters * pricePerMeter;

  if (input.hasConstructionResidue) total *= 1.25;
  if (input.windowsIncluded) total += 60;
  if (input.terraceIncluded) total += 40;
  if (input.urgencyLevel === "urgent") total *= 1.15;
  if (input.urgencyLevel === "very_urgent") total *= 1.3;

  return Math.round(total);
}