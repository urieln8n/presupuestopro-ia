"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type QuoteItem = {
  id: string;
  name: string;
  description: string | null;
  quantity: number | null;
  unit: string | null;
  unit_price: number | null;
  total: number | null;
};

type QuoteDetail = {
  id: string;
  title: string | null;
  description: string | null;
  estimated_price: number | null;
  status: string | null;
  quote_type: string;
  whatsapp_message: string | null;
  created_at: string;
  clients: {
    name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
  } | null;
  quote_items: QuoteItem[];
};

type BusinessSettings = {
  company_name: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  legal_note: string | null;
};

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function formatQuoteNumber(id: string, createdAt: string) {
  const year = new Date(createdAt).getFullYear();
  const shortId = id.slice(0, 8).toUpperCase();

  return `PPIA-${year}-${shortId}`;
}

function createWhatsAppLink(phone: string | null | undefined, message: string) {
  const cleanPhone = (phone || "").replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);

  if (!cleanPhone) return "#";

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

function formatStatus(status: string | null) {
  if (status === "accepted") return "Aceptado";
  if (status === "rejected") return "Rechazado";
  return "Pendiente";
}

export default function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [businessSettings, setBusinessSettings] =
    useState<BusinessSettings | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editMessage, setEditMessage] = useState("");

  async function loadQuote() {
    try {
      setIsLoading(true);
      setErrorMessage("");

const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
  window.location.href = "/login";
  return;
}

      const { data, error } = await supabase
        .from("quotes")
        .select(
          `
          id,
          title,
          description,
          estimated_price,
          status,
          quote_type,
          whatsapp_message,
          created_at,
          clients (
            name,
            phone,
            email,
            address,
            city
          ),
          quote_items (
            id,
            name,
            description,
            quantity,
            unit,
            unit_price,
            total
          )
        `
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw error;
      }

      setQuote(data as unknown as QuoteDetail);

      const { data: settingsData } = await supabase
        .from("business_settings")
        .select("*")
        .limit(1)
        .single();

      if (settingsData) {
        setBusinessSettings(settingsData as BusinessSettings);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error cargando el presupuesto"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(status: "pending" | "accepted" | "rejected") {
    if (!quote) return;

    const { error } = await supabase
      .from("quotes")
      .update({ status })
      .eq("id", quote.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setQuote({
      ...quote,
      status,
    });
  }

  function updateQuoteField(
    field: "title" | "description" | "estimated_price" | "whatsapp_message",
    value: string
  ) {
    if (!quote) return;

    setQuote({
      ...quote,
      [field]: field === "estimated_price" ? Number(value) : value,
    });
  }

  async function saveEditedQuote() {
    if (!quote) return;

    try {
      setIsSavingEdit(true);
      setEditMessage("");
      setErrorMessage("");

      const { error } = await supabase
        .from("quotes")
        .update({
          title: quote.title,
          description: quote.description,
          estimated_price: quote.estimated_price,
          whatsapp_message: quote.whatsapp_message,
        })
        .eq("id", quote.id);

      if (error) {
        throw error;
      }

      setEditMessage("Presupuesto actualizado correctamente.");
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error actualizando presupuesto"
      );
    } finally {
      setIsSavingEdit(false);
    }
  }

  useEffect(() => {
    loadQuote();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-zinc-500">Cargando presupuesto...</p>
        </div>
      </main>
    );
  }

  if (errorMessage || !quote) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
          {errorMessage || "No se encontró el presupuesto"}
        </div>
      </main>
    );
  }

  const whatsappMessage =
    quote.whatsapp_message ||
    `Hola, te envío el presupuesto: ${quote.title || "Presupuesto"}`;

  return (
    <main className="print-page min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="no-print mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <a href="/quotes" className="text-sm font-semibold text-zinc-500">
              ← Volver al historial
            </a>
            <h1 className="mt-2 text-4xl font-black">
              Detalle del presupuesto
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-2xl border px-5 py-3 font-semibold"
            >
              {isEditing ? "Cancelar edición" : "Editar presupuesto"}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-2xl bg-zinc-950 px-5 py-3 font-semibold text-white"
            >
              Descargar PDF
            </button>

            <button
              type="button"
              onClick={() => updateStatus("pending")}
              className="rounded-2xl border px-5 py-3 font-semibold"
            >
              Pendiente
            </button>

            <button
              type="button"
              onClick={() => updateStatus("accepted")}
              className="rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white"
            >
              Aceptado
            </button>

            <button
              type="button"
              onClick={() => updateStatus("rejected")}
              className="rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white"
            >
              Rechazado
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="no-print mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        )}

        {editMessage && (
          <div className="no-print mb-6 rounded-3xl border border-green-200 bg-green-50 p-6 text-green-700">
            {editMessage}
          </div>
        )}

        <section className="print-area print-compact rounded-3xl bg-white p-8 shadow-sm">
          <div className="print-avoid-break flex flex-col justify-between gap-6 border-b pb-6 md:flex-row">
            <div className="w-full">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                {businessSettings?.company_name || "PresupuestoPro IA"}
              </p>

              <div className="mt-2 text-sm text-zinc-500">
                {businessSettings?.owner_name && (
                  <p>{businessSettings.owner_name}</p>
                )}
                {businessSettings?.phone && <p>Tel: {businessSettings.phone}</p>}
                {businessSettings?.email && (
                  <p>Email: {businessSettings.email}</p>
                )}
                {businessSettings?.city && <p>{businessSettings.city}</p>}
                {businessSettings?.address && <p>{businessSettings.address}</p>}
              </div>

              <p className="mt-3 text-sm text-zinc-500">
                Presupuesto generado para servicios de reformas, terminación de
                obra y limpieza profesional.
              </p>

              {isEditing ? (
                <input
                  className="mt-3 w-full rounded-2xl border px-4 py-3 text-2xl font-black"
                  value={quote.title || ""}
                  onChange={(event) =>
                    updateQuoteField("title", event.target.value)
                  }
                />
              ) : (
                <h2 className="mt-3 text-3xl font-black">
                  {quote.title || "Presupuesto sin título"}
                </h2>
              )}

              <div className="mt-4 grid gap-3 text-sm text-zinc-500 md:grid-cols-3">
                <p className="break-words">
                  <strong>Nº presupuesto:</strong>{" "}
                  <span className="whitespace-nowrap">
                    {formatQuoteNumber(quote.id, quote.created_at)}
                  </span>
                </p>

                <p>
                  <strong>Fecha:</strong> {formatDate(quote.created_at)}
                </p>

                <p>
                  <strong>Validez:</strong> 7 días
                </p>
              </div>

              {isEditing ? (
                <textarea
                  className="mt-4 w-full rounded-2xl border px-4 py-3 leading-7"
                  rows={4}
                  value={quote.description || ""}
                  onChange={(event) =>
                    updateQuoteField("description", event.target.value)
                  }
                />
              ) : (
                <p className="mt-4 max-w-3xl leading-7 text-zinc-600">
                  {quote.description || "Sin descripción"}
                </p>
              )}
            </div>

            <div className="rounded-3xl bg-zinc-50 p-5 md:min-w-60">
              <p className="text-sm text-zinc-500">Total estimado</p>

              {isEditing ? (
                <input
                  type="number"
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-3xl font-black"
                  value={quote.estimated_price || 0}
                  onChange={(event) =>
                    updateQuoteField("estimated_price", event.target.value)
                  }
                />
              ) : (
                <p className="mt-2 text-4xl font-black">
                  {formatCurrency(quote.estimated_price)}
                </p>
              )}

              <p className="mt-3 text-sm font-semibold">
                Estado: {formatStatus(quote.status)}
              </p>
            </div>
          </div>

          <div className="print-avoid-break mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-zinc-50 p-5">
              <h3 className="text-xl font-bold">Cliente</h3>

              <div className="mt-4 space-y-2 text-sm text-zinc-600">
                <p>
                  <strong>Nombre:</strong>{" "}
                  {quote.clients?.name || "Cliente sin nombre"}
                </p>
                <p>
                  <strong>Teléfono:</strong>{" "}
                  {quote.clients?.phone || "Sin teléfono"}
                </p>
                <p>
                  <strong>Email:</strong> {quote.clients?.email || "Sin email"}
                </p>
                <p>
                  <strong>Ciudad:</strong>{" "}
                  {quote.clients?.city || "Sin ciudad"}
                </p>
                <p>
                  <strong>Dirección:</strong>{" "}
                  {quote.clients?.address || "Sin dirección"}
                </p>
              </div>
            </div>

            <div className="no-print rounded-3xl bg-zinc-50 p-5">
              <h3 className="text-xl font-bold">Acciones</h3>

              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(whatsappMessage)}
                  className="rounded-2xl border px-5 py-3 font-semibold"
                >
                  Copiar mensaje WhatsApp
                </button>

                <a
                  href={createWhatsAppLink(
                    quote.clients?.phone,
                    whatsappMessage
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl bg-green-600 px-5 py-3 text-center font-semibold text-white"
                >
                  Abrir WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="print-avoid-break mt-8">
            <h3 className="text-xl font-bold">Partidas</h3>

            <div className="mt-4 space-y-3">
              {quote.quote_items.length === 0 && (
                <p className="text-zinc-500">No hay partidas guardadas.</p>
              )}

              {quote.quote_items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {item.description || "Sin descripción"}
                    </p>
                  </div>

                  <p className="font-black">{formatCurrency(item.total)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="no-print mt-8 rounded-3xl bg-zinc-50 p-5">
            <h3 className="text-xl font-bold">Mensaje para WhatsApp</h3>

            {isEditing ? (
              <textarea
                className="mt-4 w-full rounded-2xl border px-4 py-3 leading-7"
                rows={5}
                value={quote.whatsapp_message || ""}
                onChange={(event) =>
                  updateQuoteField("whatsapp_message", event.target.value)
                }
              />
            ) : (
              <p className="mt-4 whitespace-pre-line leading-7 text-zinc-600">
                {whatsappMessage}
              </p>
            )}

            {isEditing && (
              <button
                type="button"
                onClick={saveEditedQuote}
                disabled={isSavingEdit}
                className="mt-4 rounded-2xl bg-zinc-950 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {isSavingEdit ? "Guardando cambios..." : "Guardar cambios"}
              </button>
            )}
          </div>

          <p className="mt-6 text-sm text-zinc-500">
            Nota:{" "}
            {businessSettings?.legal_note ||
              "El precio indicado es una estimación basada en la información facilitada. Puede ajustarse tras visita técnica o cambios en el alcance del trabajo."}
          </p>
        </section>
      </div>
    </main>
  );
}