"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { calculateCleaningPrice } from "@/lib/pricing/calculate-cleaning-price";
import { calculateReformPrice } from "@/lib/pricing/calculate-reform-price";
import { calculateCombinedPrice } from "@/lib/pricing/calculate-combined-price";

type QuoteType = "reform" | "cleaning" | "combined";

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
  windowsIncluded: boolean;
  terraceIncluded: boolean;
  description: string;
};

type GeneratedQuote = {
  title: string;
  summary: string;
  price: number;
  whatsappMessage: string;
  items: {
    name: string;
    description: string;
    total: number;
  }[];
};

const initialClientData: ClientData = {
  name: "",
  phone: "",
  email: "",
  city: "",
  address: "",
};

const initialJobData: JobData = {
  workType: "painting",
  cleaningType: "post_construction",
  squareMeters: "80",
  urgencyLevel: "normal",
  difficulty: "normal",
  materialsIncluded: false,
  hasConstructionResidue: true,
  windowsIncluded: true,
  terraceIncluded: false,
  description: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function createWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);

  if (!cleanPhone) return "#";

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export default function NewQuotePage() {
  const [quoteType, setQuoteType] = useState<QuoteType>("combined");
  const [client, setClient] = useState<ClientData>(initialClientData);
  const [job, setJob] = useState<JobData>(initialJobData);
  const [generatedQuote, setGeneratedQuote] = useState<GeneratedQuote | null>(
    null
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
const [savedQuoteId, setSavedQuoteId] = useState("");
const [isGenerating, setIsGenerating] = useState(false);


  const squareMeters = Number(job.squareMeters) || 0;

  const estimatedPrice = useMemo(() => {
    if (quoteType === "reform") {
      return calculateReformPrice({
        workType: job.workType,
        squareMeters,
        materialsIncluded: job.materialsIncluded,
        urgencyLevel: job.urgencyLevel,
        difficulty: job.difficulty,
      });
    }

    if (quoteType === "cleaning") {
      return calculateCleaningPrice({
        cleaningType: job.cleaningType,
        squareMeters,
        hasConstructionResidue: job.hasConstructionResidue,
        windowsIncluded: job.windowsIncluded,
        terraceIncluded: job.terraceIncluded,
        urgencyLevel: job.urgencyLevel,
      });
    }

    const combined = calculateCombinedPrice({
      reform: {
        workType: job.workType,
        squareMeters,
        materialsIncluded: job.materialsIncluded,
        urgencyLevel: job.urgencyLevel,
        difficulty: job.difficulty,
      },
      cleaning: {
        cleaningType: job.cleaningType,
        squareMeters,
        hasConstructionResidue: job.hasConstructionResidue,
        windowsIncluded: job.windowsIncluded,
        terraceIncluded: job.terraceIncluded,
        urgencyLevel: job.urgencyLevel,
      },
    });

    return combined.total;
  }, [quoteType, job, squareMeters]);

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

  async function generateQuote() {
  try {
    setIsGenerating(true);
    setSaveMessage("");
    setErrorMessage("");
    setSavedQuoteId("");

    if (!client.name.trim()) {
      throw new Error("Añade el nombre del cliente antes de generar el presupuesto.");
    }

    const fallbackTitle = `Presupuesto de ${
      quoteType === "reform"
        ? "reforma / terminación de obra"
        : quoteType === "cleaning"
        ? "limpieza profesional"
        : "reforma y limpieza post obra"
    } para ${client.name}`;

    const response = await fetch("/api/generate-quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteType,
        client,
        job,
        estimatedPrice,
        squareMeters,
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
        `Hola ${client.name}, te envío el presupuesto. Importe estimado: ${formatCurrency(
          estimatedPrice
        )}.`,
      items:
        items.length > 0
          ? items
          : [
              {
                name: "Servicio presupuestado",
                description:
                  "Trabajo calculado según los datos facilitados.",
                total: estimatedPrice,
              },
            ],
    });
  } catch (error) {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : "Error generando presupuesto con IA"
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
  quote_type: quoteType,
  title: generatedQuote.title,
          description: generatedQuote.summary,
          estimated_price: generatedQuote.price,
          status: "pending",
          whatsapp_message: generatedQuote.whatsappMessage,
          raw_input: {
            client,
            job,
            quoteType,
            estimatedPrice,
          },
          generated_quote: generatedQuote,
        })
        .select()
        .single();

      if (quoteError) {
        throw quoteError;
      }

      const itemsToInsert = generatedQuote.items.map((item) => ({
        quote_id: quoteData.id,
        name: item.name,
        description: item.description,
        quantity: 1,
        unit: "servicio",
        unit_price: item.total,
        total: item.total,
      }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from("quote_items")
          .insert(itemsToInsert);

        if (itemsError) {
          throw itemsError;
        }
      }

     setSavedQuoteId(quoteData.id);
setSaveMessage("Presupuesto guardado correctamente.");
    } catch (error) {
  console.error("ERROR REAL GUARDANDO:", error);

  if (error && typeof error === "object" && "message" in error) {
    setErrorMessage(String(error.message));
  } else {
    setErrorMessage(JSON.stringify(error));
  }
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

          <a
            href="/dashboard"
            className="rounded-2xl border px-5 py-3 text-center font-semibold"
          >
            Volver al dashboard
          </a>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">1. Tipo de presupuesto</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={() => setQuoteType("reform")}
              className={`rounded-3xl border p-5 text-left ${
                quoteType === "reform"
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "hover:border-zinc-950"
              }`}
            >
              <h3 className="font-bold">Reforma / terminación</h3>
              <p
                className={`mt-2 text-sm ${
                  quoteType === "reform" ? "text-zinc-300" : "text-zinc-500"
                }`}
              >
                Pintura, suelos, baños, cocinas, acabados y reparaciones.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setQuoteType("cleaning")}
              className={`rounded-3xl border p-5 text-left ${
                quoteType === "cleaning"
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "hover:border-zinc-950"
              }`}
            >
              <h3 className="font-bold">Limpieza profesional</h3>
              <p
                className={`mt-2 text-sm ${
                  quoteType === "cleaning" ? "text-zinc-300" : "text-zinc-500"
                }`}
              >
                Limpieza fin de obra, viviendas, oficinas, cristales y Airbnb.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setQuoteType("combined")}
              className={`rounded-3xl border p-5 text-left ${
                quoteType === "combined"
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "hover:border-zinc-950"
              }`}
            >
              <h3 className="font-bold">Reforma + limpieza</h3>
              <p
                className={`mt-2 text-sm ${
                  quoteType === "combined" ? "text-zinc-300" : "text-zinc-500"
                }`}
              >
                Presupuesto combinado con bloques separados.
              </p>
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">2. Datos del cliente</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              className="rounded-2xl border px-4 py-3"
              placeholder="Nombre del cliente"
              value={client.name}
              onChange={(event) => updateClient("name", event.target.value)}
            />

            <input
              className="rounded-2xl border px-4 py-3"
              placeholder="Teléfono"
              value={client.phone}
              onChange={(event) => updateClient("phone", event.target.value)}
            />

            <input
              className="rounded-2xl border px-4 py-3"
              placeholder="Email"
              value={client.email}
              onChange={(event) => updateClient("email", event.target.value)}
            />

            <input
              className="rounded-2xl border px-4 py-3"
              placeholder="Ciudad"
              value={client.city}
              onChange={(event) => updateClient("city", event.target.value)}
            />

            <input
              className="rounded-2xl border px-4 py-3 md:col-span-2"
              placeholder="Dirección"
              value={client.address}
              onChange={(event) => updateClient("address", event.target.value)}
            />
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">3. Datos del trabajo</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {(quoteType === "reform" || quoteType === "combined") && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Tipo de reforma
                  </label>
                  <select
                    className="w-full rounded-2xl border px-4 py-3"
                    value={job.workType}
                    onChange={(event) =>
                      updateJob("workType", event.target.value)
                    }
                  >
                    <option value="painting">Pintura</option>
                    <option value="flooring">Suelos</option>
                    <option value="plasterboard">Pladur</option>
                    <option value="bathroom">Baño</option>
                    <option value="kitchen">Cocina</option>
                    <option value="masonry">Albañilería</option>
                    <option value="finishes">Acabados</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Dificultad
                  </label>
                  <select
                    className="w-full rounded-2xl border px-4 py-3"
                    value={job.difficulty}
                    onChange={(event) =>
                      updateJob("difficulty", event.target.value)
                    }
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </>
            )}

            {(quoteType === "cleaning" || quoteType === "combined") && (
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tipo de limpieza
                </label>
                <select
                  className="w-full rounded-2xl border px-4 py-3"
                  value={job.cleaningType}
                  onChange={(event) =>
                    updateJob("cleaningType", event.target.value)
                  }
                >
                  <option value="basic">Limpieza básica</option>
                  <option value="deep">Limpieza profunda</option>
                  <option value="post_construction">
                    Limpieza fin de obra
                  </option>
                  <option value="airbnb">Limpieza Airbnb</option>
                  <option value="office">Limpieza oficina</option>
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Metros cuadrados
              </label>
              <input
                type="number"
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="80"
                value={job.squareMeters}
                onChange={(event) =>
                  updateJob("squareMeters", event.target.value)
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Urgencia
              </label>
              <select
                className="w-full rounded-2xl border px-4 py-3"
                value={job.urgencyLevel}
                onChange={(event) =>
                  updateJob("urgencyLevel", event.target.value)
                }
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgente</option>
                <option value="very_urgent">Muy urgente</option>
              </select>
            </div>

            {(quoteType === "reform" || quoteType === "combined") && (
              <label className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                <input
                  type="checkbox"
                  checked={job.materialsIncluded}
                  onChange={(event) =>
                    updateJob("materialsIncluded", event.target.checked)
                  }
                />
                <span className="font-semibold">Materiales incluidos</span>
              </label>
            )}

            {(quoteType === "cleaning" || quoteType === "combined") && (
              <>
                <label className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                  <input
                    type="checkbox"
                    checked={job.hasConstructionResidue}
                    onChange={(event) =>
                      updateJob("hasConstructionResidue", event.target.checked)
                    }
                  />
                  <span className="font-semibold">Hay restos de obra</span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                  <input
                    type="checkbox"
                    checked={job.windowsIncluded}
                    onChange={(event) =>
                      updateJob("windowsIncluded", event.target.checked)
                    }
                  />
                  <span className="font-semibold">Cristales incluidos</span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                  <input
                    type="checkbox"
                    checked={job.terraceIncluded}
                    onChange={(event) =>
                      updateJob("terraceIncluded", event.target.checked)
                    }
                  />
                  <span className="font-semibold">Terraza incluida</span>
                </label>
              </>
            )}

            <textarea
              className="rounded-2xl border px-4 py-3 md:col-span-2"
              placeholder="Describe el trabajo, estado del inmueble, detalles importantes..."
              rows={5}
              value={job.description}
              onChange={(event) => updateJob("description", event.target.value)}
            />
          </div>

          <div className="mt-6 rounded-3xl bg-zinc-50 p-5">
            <p className="text-sm font-semibold text-zinc-500">
              Precio estimado automático
            </p>
            <p className="mt-2 text-4xl font-black">
              {formatCurrency(estimatedPrice)}
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Este precio es orientativo y editable más adelante.
            </p>
          </div>

          <button
  type="button"
  onClick={generateQuote}
  disabled={isGenerating}
  className="mt-6 w-full rounded-2xl bg-zinc-950 px-5 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
>
  {isGenerating ? "Generando con IA..." : "Generar presupuesto con IA"}
</button>

{errorMessage && (
  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
    {errorMessage}
  </div>
)}
        </section>

        {generatedQuote && (
          <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-start">
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

              <div className="rounded-3xl bg-zinc-50 p-5 md:min-w-56">
                <p className="text-sm text-zinc-500">Total estimado</p>
                <p className="mt-2 text-4xl font-black">
                  {formatCurrency(generatedQuote.price)}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  Validez sugerida: 7 días
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold">Partidas</h3>

              <div className="mt-4 space-y-3">
                {generatedQuote.items.map((item) => (
                  <div
                    key={item.name}
                    className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {item.description}
                      </p>
                    </div>

                    <p className="font-black">{formatCurrency(item.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-zinc-50 p-5">
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

              {errorMessage && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {errorMessage}
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