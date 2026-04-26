export function calculateReformPrice(input: {
  workType: string;
  squareMeters: number;
  materialsIncluded?: boolean;
  urgencyLevel?: string;
  difficulty?: string;
}) {
  const basePrices: Record<string, number> = {
    painting: 13,
    flooring: 32,
    plasterboard: 40,
    bathroom: 450,
    kitchen: 650,
    masonry: 35,
    finishes: 25,
  };

  const pricePerUnit = basePrices[input.workType] ?? 30;

  let total = input.squareMeters * pricePerUnit;

  if (input.materialsIncluded) total *= 1.35;
  if (input.difficulty === "high") total *= 1.25;
  if (input.urgencyLevel === "urgent") total *= 1.15;
  if (input.urgencyLevel === "very_urgent") total *= 1.3;

  return Math.round(total);
}