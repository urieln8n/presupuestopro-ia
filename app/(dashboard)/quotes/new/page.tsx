"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { serviceTemplates } from "@/lib/templates/service-templates";

type ClientData = {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
};

type JobData = {
  workType: string;
  cleaningType: string;
  squareMeters: string;
  urgencyLevel: string;
  difficulty: string;
  materialsIncluded: boolean;
  hasConstructionResidue: boolean;
};

type GeneratedQuoteItem = {
  name: string;
  description: string;
  total: number;
};

type GeneratedQuote = {
  title: string;
  summary: string;
  price: number;
  items: GeneratedQuoteItem[];
  whatsappMessage: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function normalizeQuoteType(type: string | undefined | null) {
  if (type === "reform") return "reform";
  if (type === "cleaning") return "cleaning";
  return "combined";
}

export default function NewQuotePage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    serviceTemplates[0]?.id || ""
  );

  const selectedTemplate =
    serviceTemplates.find((template) => template.id === selectedTemplateId) ||
    serviceTemplates[0];

  const [client, setClient] = useState<ClientData>({
    name: "",
    phone: "",
    email: "",
    city: "",
    address: "",
  });

  const [existingClientId, setExistingClientId] = useState<string | null>(null);

  const [job, setJob] = useState<JobData>({
    workType: selectedTemplate?.defaultWorkType || "",
    cleaningType: selectedTemplate?.defaultCleaningType || "",
    squareMeters: selectedTemplate?.id === "bathroom_reform" ? "5" : "80",
    urgencyLevel: "normal",
    difficulty: "normal",
    materialsIncluded: false,
    hasConstructionResidue: true,
  });

  const [generatedQuote, setGeneratedQuote] =
    useState<GeneratedQuote | null>(null);

  const [savedQuoteId, setSavedQuoteId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const squareMeters = Number(job.squareMeters || 0);

  const squareMetersLabel =
    selectedTemplateId === "bathroom_reform"
      ? "m² del baño"
      : selectedTemplateId === "rental_cleaning"
        ? "m² de la vivienda"
        : "m² del espacio";

  const squareMetersHelp =
    selectedTemplateId === "bathroom_reform"
      ? "Para reforma de baño, introduce solo los metros del baño, no de toda la vivienda."
      : selectedTemplateId === "rental_cleaning"
        ? "Para limpieza fin de alquiler, introduce los metros aproximados de la vivienda."
        : "Para pintura y limpieza, introduce los metros aproximados del espacio a trabajar.";

  const templateEstimatedPrice = useMemo(() => {
    if (!selectedTemplate) {
      return 0;
    }

    const basePrice = Math.max(
      Number(selectedTemplate.minimumPrice || 0),
      squareMeters * Number(selectedTemplate.pricePerSquareMeter || 0)
    );

    let multiplier = 1;

    if (job.urgencyLevel === "high") {
      multiplier += 0.15;
    }

    if (job.difficulty === "high") {
      multiplier += 0.2;
    }

    if (job.materialsIncluded) {
      multiplier += 0.15;
    }

    if (job.hasConstructionResidue) {
      multiplier += 0.08;
    }

    return Math.round(basePrice * multiplier);
  }, [
    selectedTemplate,
    squareMeters,
    job.urgencyLevel,
    job.difficulty,
    job.materialsIncluded,
    job.hasConstructionResidue,
  ]);

  async function loadClientFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const clientId = params.get("clientId");

      if (!clientId) {
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("clients")
        .select(
          `
          id,
          name,
          phone,
          email,
          city,
          address
        `
        )
        .eq("id", clientId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw error;
      }

      setExistingClientId(data.id);

      setClient({
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || "",
        city: data.city || "",
        address: data.address || "",
      });
    } catch (error) {
      console.error("Error cargando cliente desde URL:", error);
    }
  }

  function updateClient(field: keyof ClientData, value: string) {
    setClient((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateJob(field: keyof JobData, value: string | boolean) {
    setJob((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function selectTemplate(templateId: string) {
    const template =
      serviceTemplates.find((item) => item.id === templateId) ||
      serviceTemplates[0];

    if (!template) {
      return;
    }

    setSelectedTemplateId(template.id);
    setGeneratedQuote(null);
    setSavedQuoteId(null);
    setSaveMessage("");
    setErrorMessage("");

    setJob((current) => ({
      ...current,
      workType: template.defaultWorkType,
      cleaningType: template.defaultCleaningType,
      squareMeters:
        template.id === "bathroom_reform"
          ? "5"
          : template.id === "rental_cleaning"
            ? "80"
            : "80",
    }));
  }

  function createFallbackItems(price: number): GeneratedQuoteItem[] {
    if (!selectedTemplate) {
      return [
        {
          name: "Servicio principal",
          description: "Trabajos incluidos en el presupuesto.",
          total: price,
        },
      ];
    }

    const suggestedItems = selectedTemplate.suggestedItems || [];

    if (suggestedItems.length === 0) {
      return [
        {
          name: selectedTemplate.name,
          description: selectedTemplate.shortDescription || "Servicio incluido.",
          total: price,
        },
      ];
    }

    return suggestedItems.map((item, index) => {
      const percentage =
        Number(item.percentage || 0) > 0
          ? Number(item.percentage || 0)
          : index === 0
            ? 0.7
            : 0.3;

      return {
        name: item.name || `Partida ${index + 1}`,
        description: item.description || "Servicio incluido.",
        total: Math.round(price * percentage),
      };
    });
  }

  function createFallbackQuote(): GeneratedQuote {
    const price = templateEstimatedPrice || 1;

    const title = `Presupuesto para ${selectedTemplate?.name || "servicio"}`;

    const summary =
      selectedTemplate?.shortDescription ||
      `Presupuesto generado para ${job.workType || "trabajo solicitado"} en un espacio de ${job.squareMeters} m².`;

    const items = createFallbackItems(price);

    const whatsappMessage = `Hola ${
      client.name || "cliente"
    }, aquí tienes el presupuesto para ${
      selectedTemplate?.name || "el servicio solicitado"
    }. Importe estimado: ${formatCurrency(
      price
    )}. Cualquier duda, estoy a tu disposición.`;

    return {
      title,
      summary,
      price,
      items,
      whatsappMessage,
    };
  }

  async function generateQuote() {
    try {
      setIsGenerating(true);
      setErrorMessage("");
      setSaveMessage("");
      setSavedQuoteId(null);

      if (!selectedTemplate) {
        throw new Error("Selecciona una plantilla de servicio.");
      }

      if (!client.name.trim()) {
        throw new Error("Añade el nombre del cliente.");
      }

      if (!Number.isFinite(squareMeters) || squareMeters <= 0) {
        throw new Error("Introduce metros válidos.");
      }

      const response = await fetch("/api/generate-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteType: normalizeQuoteType(selectedTemplate.quoteType),
          selectedTemplateId: selectedTemplate.id,
          selectedTemplate,
          client,
          job,
          squareMeters,
          templateEstimatedPrice,
        }),
      });

      if (!response.ok) {
        const fallbackQuote = createFallbackQuote();
        setGeneratedQuote(fallbackQuote);
        return;
      }

      const data = await response.json();

      const quote: GeneratedQuote = {
        title: data.title || `Presupuesto para ${selectedTemplate.name}`,
        summary:
          data.summary ||
          selectedTemplate.shortDescription ||
          "Presupuesto generado correctamente.",
        price: Math.round(Number(data.price || templateEstimatedPrice || 1)),
        items:
          Array.isArray(data.items) && data.items.length > 0
            ? data.items.map((item: GeneratedQuoteItem) => ({
                name: item.name || "Partida",
                description: item.description || "Servicio incluido.",
                total: Math.round(Number(item.total || 0)),
              }))
            : createFallbackItems(templateEstimatedPrice),
        whatsappMessage:
          data.whatsappMessage ||
          `Hola ${
            client.name || "cliente"
          }, aquí tienes el presupuesto solicitado. Importe estimado: ${formatCurrency(
            templateEstimatedPrice
          )}.`,
      };

      setGeneratedQuote(quote);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error generando presupuesto"
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveQuote() {
    try {
      setIsSaving(true);
      setErrorMessage("");
      setSaveMessage("");

      if (!selectedTemplate) {
        throw new Error("Selecciona una plantilla de servicio.");
      }

      if (!generatedQuote) {
        throw new Error("Primero genera el presupuesto.");
      }

      if (!client.name.trim()) {
        throw new Error("Añade el nombre del cliente.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      let clientId = existingClientId;

      if (!clientId) {
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .insert({
            user_id: user.id,
            name: client.name.trim() || "Cliente sin nombre",
            phone: client.phone.trim(),
            email: client.email.trim(),
            city: client.city.trim(),
            address: client.address.trim(),
          })
          .select("id")
          .single();

        if (clientError) {
          throw clientError;
        }

        clientId = clientData.id;
      }

      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          user_id: user.id,
          client_id: clientId,
          quote_type: normalizeQuoteType(selectedTemplate.quoteType),
          template_id: selectedTemplate.id,
          template_name: selectedTemplate.name,
          title: generatedQuote.title,
          description: generatedQuote.summary,
          estimated_price: Math.round(Number(generatedQuote.price || 0)),
          status: "pending",
          whatsapp_message: generatedQuote.whatsappMessage,
        })
        .select("id")
        .single();

      if (quoteError) {
        throw quoteError;
      }

      const quoteId = quoteData.id;

      const quoteItems = generatedQuote.items.map((item) => ({
        quote_id: quoteId,
        name: item.name,
        description: item.description,
        quantity: 1,
        unit: "servicio",
        unit_price: Math.round(Number(item.total || 0)),
        total: Math.round(Number(item.total || 0)),
      }));

      if (quoteItems.length > 0) {
        const { error: itemsError } = await supabase
          .from("quote_items")
          .insert(quoteItems);

        if (itemsError) {
          throw itemsError;
        }
      }

      setSavedQuoteId(quoteId);
      setSaveMessage("Presupuesto guardado correctamente.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error guardando presupuesto"
      );
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    loadClientFromUrl();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-zinc-500">
              Nuevo presupuesto
            </p>

            <h1 className="text-4xl font-black">Crear presupuesto</h1>

            <p className="mt-2 text-zinc-500">
              Genera una propuesta profesional con IA y guárdala para enviarla.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/dashboard"
              className="rounded-2xl border px-5 py-3 text-center font-semibold"
            >
              Dashboard
            </a>

            <a
              href="/quotes"
              className="rounded-2xl border px-5 py-3 text-center font-semibold"
            >
              Historial
            </a>

            <a
              href="/clients"
              className="rounded-2xl border px-5 py-3 text-center font-semibold"
            >
              Clientes
            </a>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-zinc-500">
              Tipo de servicio
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Selecciona una plantilla
            </h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {serviceTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => selectTemplate(template.id)}
                className={`rounded-3xl border p-5 text-left transition ${
                  selectedTemplateId === template.id
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "bg-white hover:bg-zinc-50"
                }`}
              >
                <p className="font-bold">{template.name}</p>

                <p
                  className={`mt-2 text-sm ${
                    selectedTemplateId === template.id
                      ? "text-zinc-200"
                      : "text-zinc-500"
                  }`}
                >
                  {template.shortDescription}
                </p>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-zinc-500">
                  Datos del cliente
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Información del cliente
                </h2>
              </div>

              {existingClientId && (
                <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
                  Cliente existente cargado automáticamente.
                </div>
              )}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Nombre del cliente"
                  value={client.name}
                  onChange={(event) =>
                    updateClient("name", event.target.value)
                  }
                />

                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Teléfono"
                  value={client.phone}
                  onChange={(event) =>
                    updateClient("phone", event.target.value)
                  }
                />

                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Email"
                  value={client.email}
                  onChange={(event) =>
                    updateClient("email", event.target.value)
                  }
                />

                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Ciudad"
                  value={client.city}
                  onChange={(event) =>
                    updateClient("city", event.target.value)
                  }
                />

                <input
                  className="rounded-2xl border px-4 py-3 md:col-span-2"
                  placeholder="Dirección"
                  value={client.address}
                  onChange={(event) =>
                    updateClient("address", event.target.value)
                  }
                />
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-zinc-500">
                  Datos del trabajo
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Información del servicio
                </h2>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Tipo de trabajo"
                  value={job.workType}
                  onChange={(event) =>
                    updateJob("workType", event.target.value)
                  }
                />

                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Tipo de limpieza"
                  value={job.cleaningType}
                  onChange={(event) =>
                    updateJob("cleaningType", event.target.value)
                  }
                />

                <div>
                  <input
                    type="number"
                    className="w-full rounded-2xl border px-4 py-3"
                    placeholder={squareMetersLabel}
                    value={job.squareMeters}
                    onChange={(event) =>
                      updateJob("squareMeters", event.target.value)
                    }
                  />

                  <p className="mt-2 text-xs text-zinc-500">
                    {squareMetersHelp}
                  </p>
                </div>

                <select
                  className="rounded-2xl border px-4 py-3"
                  value={job.urgencyLevel}
                  onChange={(event) =>
                    updateJob("urgencyLevel", event.target.value)
                  }
                >
                  <option value="normal">Urgencia normal</option>
                  <option value="high">Urgente</option>
                </select>

                <select
                  className="rounded-2xl border px-4 py-3"
                  value={job.difficulty}
                  onChange={(event) =>
                    updateJob("difficulty", event.target.value)
                  }
                >
                  <option value="normal">Dificultad normal</option>
                  <option value="high">Dificultad alta</option>
                </select>

                <label className="flex items-center gap-3 rounded-2xl border px-4 py-3 font-semibold">
                  <input
                    type="checkbox"
                    checked={job.materialsIncluded}
                    onChange={(event) =>
                      updateJob("materialsIncluded", event.target.checked)
                    }
                  />
                  Materiales incluidos
                </label>

                <label className="flex items-center gap-3 rounded-2xl border px-4 py-3 font-semibold">
                  <input
                    type="checkbox"
                    checked={job.hasConstructionResidue}
                    onChange={(event) =>
                      updateJob("hasConstructionResidue", event.target.checked)
                    }
                  />
                  Hay residuos de obra
                </label>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">
              Precio estimado automático
            </p>

            <p className="mt-3 text-5xl font-black">
              {formatCurrency(templateEstimatedPrice)}
            </p>

            <p className="mt-3 text-zinc-500">
              Este precio es orientativo y editable más adelante.
            </p>

            <button
              type="button"
              onClick={generateQuote}
              disabled={isGenerating}
              className="mt-6 w-full rounded-2xl bg-zinc-950 px-5 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generando..." : "Generar presupuesto con IA"}
            </button>
          </aside>
        </div>

        {generatedQuote && (
          <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            <div className="grid gap-8 md:grid-cols-[1.5fr_260px]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                  Presupuesto generado
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  {generatedQuote.title}
                </h2>

                <p className="mt-4 leading-7 text-zinc-600">
                  {generatedQuote.summary}
                </p>
              </div>

              <div className="rounded-3xl bg-zinc-50 p-6">
                <p className="text-sm text-zinc-500">Total estimado</p>

                <p className="mt-2 text-4xl font-black">
                  {formatCurrency(generatedQuote.price)}
                </p>

                <p className="mt-2 text-xs text-zinc-500">
                  Validez sugerida: 7 días
                </p>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-bold">Partidas</h3>

              <div className="mt-4 space-y-3">
                {generatedQuote.items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="font-bold">{item.name}</p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {item.description}
                      </p>
                    </div>

                    <p className="font-black">
                      {formatCurrency(Number(item.total || 0))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-bold">Mensaje para WhatsApp</h3>

              <p className="mt-4 whitespace-pre-line leading-7 text-zinc-600">
                {generatedQuote.whatsappMessage}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={saveQuote}
                disabled={isSaving}
                className="rounded-2xl bg-zinc-950 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Guardando..." : "Guardar presupuesto"}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(generatedQuote.whatsappMessage)
                }
                className="rounded-2xl border px-5 py-3 font-semibold"
              >
                Copiar mensaje
              </button>

              <a
                href={`https://wa.me/${client.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  generatedQuote.whatsappMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-2xl px-5 py-3 text-center font-semibold text-white ${
                  client.phone
                    ? "bg-green-600"
                    : "pointer-events-none bg-zinc-300"
                }`}
              >
                Abrir WhatsApp
              </a>
            </div>

            {saveMessage && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700">
                <p>{saveMessage}</p>

                {savedQuoteId && (
                  <a
                    href={`/quotes/${savedQuoteId}`}
                    className="mt-3 inline-block rounded-2xl bg-green-700 px-5 py-3 font-semibold text-white"
                  >
                    Ver presupuesto guardado
                  </a>
                )}
              </div>
            )}

            <p className="mt-8 text-sm text-zinc-500">
              Nota: el precio indicado es una estimación basada en la
              información facilitada. Puede ajustarse tras visita técnica o
              cambios en el alcance del trabajo.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}