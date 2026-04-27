"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  buildTemplateItems,
  calculateTemplatePrice,
  getServiceTemplate,
  serviceTemplates,
} from "@/lib/templates/service-templates";

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
  whatsappMessage: string;
  items: GeneratedQuoteItem[];
};

const initialClient: ClientData = {
  name: "",
  phone: "",
  email: "",
  city: "",
  address: "",
};

const initialJob: JobData = {
  workType: "Pintura interior y limpieza posterior",
  cleaningType: "Limpieza post obra",
  squareMeters: "80",
  urgencyLevel: "normal",
  difficulty: "normal",
  materialsIncluded: false,
  hasConstructionResidue: true,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function createWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);

  if (!cleanPhone) return "#";

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export default function NewQuotePage() {
  const [selectedTemplateId, setSelectedTemplateId] =
    useState("painting_cleaning");

  const [client, setClient] = useState<ClientData>(initialClient);
  const [job, setJob] = useState<JobData>(initialJob);

  const [generatedQuote, setGeneratedQuote] =
    useState<GeneratedQuote | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [savedQuoteId, setSavedQuoteId] = useState("");

  const squareMeters = Number(job.squareMeters || 0);

  const selectedTemplate = getServiceTemplate(selectedTemplateId);

  const estimatedPrice = calculateTemplatePrice({
    templateId: selectedTemplateId,
    squareMeters,
    urgencyLevel: job.urgencyLevel,
    difficulty: job.difficulty,
    materialsIncluded: job.materialsIncluded,
    hasConstructionResidue: job.hasConstructionResidue,
  });

  function updateClient(field: keyof ClientData, value: string) {
    setClient((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateJob(
    field: keyof JobData,
    value: string | boolean
  ) {
    setJob((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function generateQuote() {
    try {
      setIsGenerating(true);
      setSaveMessage("");
      setErrorMessage("");
      setSavedQuoteId("");

      if (!client.name.trim()) {
        throw new Error("Añade el nombre del cliente antes de generar el presupuesto.");
      }

      if (!job.squareMeters || Number(job.squareMeters) <= 0) {
        throw new Error("Añade los metros cuadrados del trabajo.");
      }

      const fallbackTitle = `Presupuesto para ${selectedTemplate.name} para ${client.name}`;

      const suggestedItems = buildTemplateItems(
        selectedTemplateId,
        estimatedPrice
      );

      const response = await fetch("/api/generate-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteType: selectedTemplate.quoteType,
          selectedTemplateId,
          selectedTemplate,
          client,
          job,
          estimatedPrice,
          squareMeters,
          suggestedItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo generar el presupuesto con IA.");
      }

      const items = Array.isArray(data.items)
        ? data.items.map(
            (item: {
              name?: string;
              description?: string;
              total?: number;
            }) => ({
              name: item.name || "Partida",
              description: item.description || "",
              total: Number(item.total || 0),
            })
          )
        : [];

      setGeneratedQuote({
        title: data.title || fallbackTitle,
        summary:
          data.summary ||
          "Propuesta profesional generada a partir de los datos facilitados.",
        price: Number(data.final_price || estimatedPrice),
        whatsappMessage:
          data.whatsapp_message ||
          `Hola ${client.name}, te envío el presupuesto para ${selectedTemplate.name}. Importe estimado: ${formatCurrency(
            estimatedPrice
          )}.`,
        items: items.length > 0 ? items : suggestedItems,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error generando presupuesto"
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveQuote() {
    try {
      setIsSaving(true);
      setSaveMessage("");
      setErrorMessage("");
      setSavedQuoteId("");

      if (!generatedQuote) {
        throw new Error("Primero genera un presupuesto antes de guardarlo.");
      }

      if (!client.name.trim()) {
        throw new Error("Añade el nombre del cliente antes de guardar.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Debes iniciar sesión para guardar presupuestos.");
      }

      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .insert({
          user_id: user.id,
          name: client.name || "Cliente sin nombre",
          phone: client.phone,
          email: client.email,
          address: client.address,
          city: client.city,
        })
        .select()
        .single();

      if (clientError) {
        throw clientError;
      }

      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          user_id: user.id,
          client_id: clientData.id,
          quote_type: selectedTemplate.quoteType,
          template_id: selectedTemplate.id,
template_name: selectedTemplate.name,
          title: generatedQuote.title,
          description: generatedQuote.summary,
          estimated_price: generatedQuote.price,
          status: "pending",
          whatsapp_message: generatedQuote.whatsappMessage,
        })
        .select()
        .single();

      if (quoteError) {
        throw quoteError;
      }

      const quoteItems = generatedQuote.items.map((item) => ({
        quote_id: quoteData.id,
        name: item.name,
        description: item.description,
        quantity: 1,
        unit: "servicio",
        unit_price: item.total,
        total: item.total,
      }));

      const { error: itemsError } = await supabase
        .from("quote_items")
        .insert(quoteItems);

      if (itemsError) {
        throw itemsError;
      }

      setSavedQuoteId(quoteData.id);
      setSaveMessage("Presupuesto guardado correctamente.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error guardando el presupuesto"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-zinc-500">
              Nuevo presupuesto
            </p>
            <h1 className="text-4xl font-black">Crear presupuesto</h1>
          </div>

          <div className="flex gap-3">
            <a
              href="/dashboard"
              className="rounded-2xl border px-5 py-3 text-center font-semibold"
            >
              Volver al dashboard
            </a>

            <a
              href="/quotes"
              className="rounded-2xl border px-5 py-3 text-center font-semibold"
            >
              Ver historial
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-zinc-500">
                  Tipo de servicio
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  Elige una plantilla inteligente
                </h2>
                <p className="mt-2 text-zinc-500">
                  La plantilla ajusta el cálculo, las partidas y el texto generado por IA.
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {serviceTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(template.id);
                      setJob((current) => ({
                        ...current,
                        workType: template.defaultWorkType,
                        cleaningType: template.defaultCleaningType,
                      }));
                      setGeneratedQuote(null);
                      setSaveMessage("");
                      setErrorMessage("");
                    }}
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

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">Datos del cliente</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
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
              <h2 className="text-2xl font-black">Datos del trabajo</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
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

                <input
                  type="number"
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Metros cuadrados"
                  value={job.squareMeters}
                  onChange={(event) =>
                    updateJob("squareMeters", event.target.value)
                  }
                />

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

                <div className="rounded-2xl border px-4 py-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={job.materialsIncluded}
                      onChange={(event) =>
                        updateJob("materialsIncluded", event.target.checked)
                      }
                    />
                    <span>Materiales incluidos</span>
                  </label>
                </div>

                <div className="rounded-2xl border px-4 py-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={job.hasConstructionResidue}
                      onChange={(event) =>
                        updateJob(
                          "hasConstructionResidue",
                          event.target.checked
                        )
                      }
                    />
                    <span>Hay residuos de obra</span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-zinc-500">
              Precio estimado automático
            </p>

            <p className="mt-3 text-5xl font-black">
              {formatCurrency(estimatedPrice)}
            </p>

            <p className="mt-4 text-zinc-500">
              Este precio es orientativo y editable más adelante.
            </p>

            <button
              type="button"
              onClick={generateQuote}
              disabled={isGenerating}
              className="mt-6 w-full rounded-2xl bg-zinc-950 px-5 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating
                ? "Generando con IA..."
                : "Generar presupuesto con IA"}
            </button>

            {errorMessage && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}
          </aside>
        </div>

        {generatedQuote && (
          <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex flex-col justify-between gap-6 border-b pb-6 md:flex-row">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                  Presupuesto generado
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  {generatedQuote.title}
                </h2>

                <p className="mt-4 max-w-3xl leading-7 text-zinc-600">
                  {generatedQuote.summary}
                </p>
              </div>

              <div className="rounded-3xl bg-zinc-50 p-5 md:min-w-60">
                <p className="text-sm text-zinc-500">Total estimado</p>
                <p className="mt-2 text-4xl font-black">
                  {formatCurrency(generatedQuote.price)}
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Validez sugerida: 7 días
                </p>
              </div>
            </div>

            <div className="mt-8">
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
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold">Mensaje para WhatsApp</h3>

              <p className="mt-4 whitespace-pre-line leading-7 text-zinc-600">
                {generatedQuote.whatsappMessage}
              </p>

              <div className="mt-6 flex flex-col gap-3 md:flex-row">
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
                    navigator.clipboard.writeText(
                      generatedQuote.whatsappMessage
                    )
                  }
                  className="rounded-2xl border px-5 py-3 font-semibold"
                >
                  Copiar mensaje
                </button>

                <a
                  href={createWhatsAppLink(
                    client.phone,
                    generatedQuote.whatsappMessage
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl bg-green-600 px-5 py-3 text-center font-semibold text-white"
                >
                  Abrir WhatsApp
                </a>
              </div>

              {saveMessage && (
                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                  <p>{saveMessage}</p>

                  {savedQuoteId && (
                    <a
                      href={`/quotes/${savedQuoteId}`}
                      className="mt-3 inline-block rounded-2xl bg-green-700 px-4 py-2 font-semibold text-white"
                    >
                      Ver presupuesto guardado
                    </a>
                  )}
                </div>
              )}
            </div>

            <p className="mt-6 text-sm text-zinc-500">
              Nota: el precio indicado es una estimación basada en la información
              facilitada. Puede ajustarse tras visita técnica o cambios en el
              alcance del trabajo.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}