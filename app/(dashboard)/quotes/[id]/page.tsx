"use client";

import {use, useEffect, useState } from "react";
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
const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);

  async function loadQuote() {
    try {
      setIsLoading(true);
      setErrorMessage("");

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
            <h1 className="mt-2 text-4xl font-black">Detalle del presupuesto</h1>
          </div>

          <div className="flex flex-wrap gap-3">
  <button
    onClick={() => window.print()}
    className="rounded-2xl bg-zinc-950 px-5 py-3 font-semibold text-white"
  >
    Descargar PDF
  </button>

  <button
    onClick={() => updateStatus("pending")}
    className="rounded-2xl border px-5 py-3 font-semibold"
  >
    Pendiente
  </button>

  <button
    onClick={() => updateStatus("accepted")}
    className="rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white"
  >
    Aceptado
  </button>

  <button
    onClick={() => updateStatus("rejected")}
    className="rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white"
  >
    Rechazado
  </button>
</div>
        </div>

        <section className="print-area print-compact rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-6 border-b pb-6 md:flex-row">
            <div>
             <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
  {businessSettings?.company_name || "PresupuestoPro IA"}
</p>
<div className="mt-2 text-sm text-zinc-500">
  {businessSettings?.owner_name && <p>{businessSettings.owner_name}</p>}
  {businessSettings?.phone && <p>Tel: {businessSettings.phone}</p>}
  {businessSettings?.email && <p>Email: {businessSettings.email}</p>}
  {businessSettings?.city && <p>{businessSettings.city}</p>}
  {businessSettings?.address && <p>{businessSettings.address}</p>}
</div>

<p className="mt-2 text-sm text-zinc-500">
  Presupuesto generado para servicios de reformas, terminación de obra y limpieza profesional.
</p>

              <h2 className="mt-3 text-3xl font-black">
                {quote.title || "Presupuesto sin título"}
              </h2>

<div className="mt-4 grid gap-2 text-sm text-zinc-500 md:grid-cols-3">
  <p>
    <strong>Nº presupuesto:</strong>{" "}
    {formatQuoteNumber(quote.id, quote.created_at)}
  </p>

  <p>
    <strong>Fecha:</strong> {formatDate(quote.created_at)}
  </p>

  <p>
    <strong>Validez:</strong> 7 días
  </p>
</div>

              <p className="mt-4 max-w-3xl leading-7 text-zinc-600">
                {quote.description || "Sin descripción"}
              </p>
            </div>

            <div className="rounded-3xl bg-zinc-50 p-5 md:min-w-60">
              <p className="text-sm text-zinc-500">Total estimado</p>
              <p className="mt-2 text-4xl font-black">
                {formatCurrency(quote.estimated_price)}
              </p>

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
                  <strong>Email:</strong>{" "}
                  {quote.clients?.email || "Sin email"}
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
                  href={createWhatsAppLink(quote.clients?.phone, whatsappMessage)}
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

            <p className="mt-4 whitespace-pre-line leading-7 text-zinc-600">
              {whatsappMessage}
            </p>
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