export type ServiceTemplateId =
  | "painting_cleaning"
  | "bathroom_reform"
  | "rental_cleaning";

export type QuoteType = "reform" | "cleaning" | "combined";

export type ServiceTemplate = {
  id: ServiceTemplateId;
  name: string;
  shortDescription: string;
  defaultWorkType: string;
  defaultCleaningType: string;
  quoteType: QuoteType;
  pricePerSquareMeter: number;
  minimumPrice: number;
  suggestedItems: {
    name: string;
    description: string;
    percentage: number;
  }[];
  aiContext: string;
};

export const serviceTemplates: ServiceTemplate[] = [
  {
    id: "painting_cleaning",
    name: "Pintura + limpieza post obra",
    shortDescription:
      "Ideal para pintar una vivienda/local y entregar el espacio limpio al finalizar.",
    defaultWorkType: "Pintura interior y limpieza posterior",
    defaultCleaningType: "Limpieza post obra",
    quoteType: "combined",
    pricePerSquareMeter: 26,
    minimumPrice: 450,
    suggestedItems: [
      {
        name: "Pintura",
        description:
          "Preparación básica de superficies, protección de zonas sensibles y aplicación de pintura interior.",
        percentage: 0.75,
      },
      {
        name: "Limpieza post obra",
        description:
          "Limpieza final del espacio, retirada de polvo superficial y preparación para entrega.",
        percentage: 0.25,
      },
    ],
    aiContext:
      "El presupuesto debe estar orientado a pintura interior combinada con limpieza posterior. Debe transmitir acabado limpio, entrega cuidada y rapidez de respuesta.",
  },
  {
    id: "bathroom_reform",
    name: "Reforma de baño",
    shortDescription:
      "Presupuesto para reforma parcial o completa de baño con acabados básicos.",
    defaultWorkType: "Reforma de baño",
    defaultCleaningType: "Limpieza final de obra",
    quoteType: "reform",
    pricePerSquareMeter: 520,
    minimumPrice: 2500,
    suggestedItems: [
      {
        name: "Demolición y preparación",
        description:
          "Retirada de elementos existentes, preparación del espacio y gestión básica del área de trabajo.",
        percentage: 0.2,
      },
      {
        name: "Trabajos de reforma",
        description:
          "Ejecución de trabajos principales de reforma, instalación y acabados según alcance indicado.",
        percentage: 0.65,
      },
      {
        name: "Limpieza final",
        description:
          "Limpieza posterior a los trabajos para entregar el baño en condiciones de uso.",
        percentage: 0.15,
      },
    ],
    aiContext:
      "El presupuesto debe enfocarse en una reforma de baño. Debe ser claro, serio y dejar constancia de que el precio puede ajustarse tras visita técnica.",
  },
  {
    id: "rental_cleaning",
    name: "Limpieza fin de alquiler",
    shortDescription:
      "Limpieza profunda para entregar o recuperar una vivienda tras alquiler.",
    defaultWorkType: "Limpieza fin de alquiler",
    defaultCleaningType: "Limpieza profunda",
    quoteType: "cleaning",
    pricePerSquareMeter: 8,
    minimumPrice: 180,
    suggestedItems: [
      {
        name: "Limpieza general profunda",
        description:
          "Limpieza de superficies, suelos, polvo, zonas de uso frecuente y preparación general de la vivienda.",
        percentage: 0.55,
      },
      {
        name: "Cocina y baños",
        description:
          "Limpieza intensiva de cocina, baños, sanitarios, grifería y zonas con mayor acumulación de suciedad.",
        percentage: 0.3,
      },
      {
        name: "Repaso final",
        description:
          "Revisión final del espacio para entrega o entrada de nuevo inquilino.",
        percentage: 0.15,
      },
    ],
    aiContext:
      "El presupuesto debe orientarse a limpieza final de alquiler. Debe transmitir rapidez, orden, confianza y preparación para entrega de vivienda.",
  },
];

export function getServiceTemplate(templateId: string): ServiceTemplate {
  return (
    serviceTemplates.find((template) => template.id === templateId) ||
    serviceTemplates[0]
  );
}

export function calculateTemplatePrice({
  templateId,
  squareMeters,
  urgencyLevel,
  difficulty,
  materialsIncluded,
  hasConstructionResidue,
}: {
  templateId: string;
  squareMeters: number;
  urgencyLevel: string;
  difficulty: string;
  materialsIncluded: boolean;
  hasConstructionResidue: boolean;
}) {
  const template = getServiceTemplate(templateId);

  const safeSquareMeters = Number.isFinite(squareMeters) && squareMeters > 0
    ? squareMeters
    : 0;

  let price = safeSquareMeters * template.pricePerSquareMeter;

  if (price < template.minimumPrice) {
    price = template.minimumPrice;
  }

  if (urgencyLevel === "high") {
    price *= 1.25;
  }

  if (difficulty === "high") {
    price *= 1.2;
  }

  if (materialsIncluded) {
    price *= 1.15;
  }

  if (hasConstructionResidue) {
    price *= 1.12;
  }

  return Math.round(price);
}

export function buildTemplateItems(templateId: string, totalPrice: number) {
  const template = getServiceTemplate(templateId);

  return template.suggestedItems.map((item) => ({
    name: item.name,
    description: item.description,
    total: Math.round(totalPrice * item.percentage),
  }));
}