"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type QuoteItem = {
  id: string;
  name: string | null;
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
  quote_type: string | null;
  template_id: string | null;
  template_name: string | null;
  whatsapp_message: string | null;
  created_at: string;
  clients: {
    name: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
    address: string | null;
  } | null;
  quote_items: QuoteItem[];
};

type BusinessSettings = {
  company_name: string | null;
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
  }).format(Number(value || 0));
}

function formatStatus(status: string | null) {
  if (status === "accepted") return "Aceptado";
  if (status === "rejected") return "Rechazado";
  return "Pendiente";
}

function formatQuoteType(type: string | null) {
  if (type === "reform") return "Reforma";
  if (type === "cleaning") return "Limpieza";
  if (type === "combined") return "Combinado";
  return "Servicio";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function createBudgetNumber(quoteId: string, createdAt: string) {
  const year = new Date(createdAt).getFullYear();
  return `PPIA-${year}-${quoteId.slice(0, 8).toUpperCase()}`;
}

function createWhatsAppLink(phone: string | null | undefined, message: string) {
  const cleanPhone = String(phone || "").replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message || "");

  if (!cleanPhone) {
    return "#";
  }

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export default function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [businessSettings, setBusinessSettings] =
    useState<BusinessSettings | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .select(
          `
          id,
          title,
          description,
          estimated_price,
          status,
          quote_type,
          template_id,
          template_name,
          whatsapp_message,
          created_at,
          clients (
            name,
            phone,
            email,
            city,
            address
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

      if (quoteError) {
        throw quoteError;
      }

      const { data: settingsData } = await supabase
        .from("business_settings")
        .select(
          `
          company_name,
          owner_name,
          phone,
          email,
          city,
          address,
          legal_note
        `
        )
        .eq("user_id", user.id)
        .maybeSingle();

      setQuote(quoteData as unknown as QuoteDetail);
      setBusinessSettings((settingsData || null) as BusinessSettings | null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error cargando presupuesto"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(status: "accepted" | "rejected" | "pending") {
    try {
      if (!quote) return;

      setIsUpdatingStatus(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      const { error } = await supabase
        .from("quotes")
        .update({ status })
        .eq("id", quote.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setQuote((current) =>
        current
          ? {
              ...current,
              status,
            }
          : current
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error actualizando estado"
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function deleteQuote() {
    try {
      if (!quote) return;

      const confirmDelete = window.confirm(
        "¿Seguro que quieres eliminar este presupuesto? Esta acción no se puede deshacer."
      );

      if (!confirmDelete) return;

      setIsDeleting(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      const { error: itemsError } = await supabase
        .from("quote_items")
        .delete()
        .eq("quote_id", quote.id);

      if (itemsError) {
        throw itemsError;
      }

      const { error: quoteError } = await supabase
        .from("quotes")
        .delete()
        .eq("id", quote.id)
        .eq("user_id", user.id);

      if (quoteError) {
        throw quoteError;
      }

      window.location.href = "/quotes";
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error eliminando presupuesto"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  useEffect(() => {
    loadQuote();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-zinc-500">Cargando presupuesto...</p>
        </div>
      </main>
    );
  }

  if (errorMessage && !quote) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-5xl">
          <a
            href="/quotes"
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-950"
          >
            ← Volver al historial
          </a>

          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        </div>
      </main>
    );
  }

  if (!quote) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-zinc-500">Presupuesto no encontrado.</p>
        </div>
      </main>
    );
  }

  const budgetNumber = createBudgetNumber(quote.id, quote.created_at);
  const legalNote =
    businessSettings?.legal_note ||
    "El precio indicado es una estimación basada en la información facilitada. Puede ajustarse tras visita técnica o cambios en el alcance del trabajo.";

  const whatsappMessage =
    quote.whatsapp_message ||
    `Hola ${
      quote.clients?.name || "cliente"
    }, te envío el presupuesto. Importe estimado: ${formatCurrency(
      quote.estimated_price
    )}.`;

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="no-print mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <a
              href="/quotes"
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-950"
            >
              ← Volver al historial
            </a>

            <h1 className="mt-3 text-4xl font-black">
              Detalle del presupuesto
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
  href={`/quotes/${quote.id}/edit`}
  className="rounded-2xl border px-5 py-3 font-semibold"
>
  Editar
</a>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-2xl border px-5 py-3 font-semibold"
            >
              Imprimir / PDF
            </button>

            <button
              type="button"
              onClick={() => updateStatus("pending")}
              disabled={isUpdatingStatus}
              className="rounded-2xl border px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              Pendiente
            </button>

            <button
              type="button"
              onClick={() => updateStatus("accepted")}
              disabled={isUpdatingStatus}
              className="rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Aceptado
            </button>

            <button
              type="button"
              onClick={() => updateStatus("rejected")}
              disabled={isUpdatingStatus}
              className="rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Rechazado
            </button>

            <button
              type="button"
              onClick={deleteQuote}
              disabled={isDeleting}
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="no-print mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="print-area rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-8 border-b pb-8 md:flex-row">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
                {businessSettings?.company_name || "PresupuestoPro IA"}
              </p>

              {businessSettings?.owner_name && (
                <p className="mt-3 text-sm text-zinc-600">
                  {businessSettings.owner_name}
                </p>
              )}

              {businessSettings?.phone && (
                <p className="text-sm text-zinc-600">
                  Tel: {businessSettings.phone}
                </p>
              )}

              {businessSettings?.email && (
                <p className="text-sm text-zinc-600">
                  Email: {businessSettings.email}
                </p>
              )}

              {businessSettings?.city && (
                <p className="text-sm font-semibold text-zinc-600">
                  {businessSettings.city}
                </p>
              )}

              {businessSettings?.address && (
                <p className="text-sm text-zinc-600">
                  {businessSettings.address}
                </p>
              )}

              <p className="mt-5 text-sm text-zinc-500">
                Presupuesto generado para servicios de reformas, terminación de
                obra y limpieza profesional.
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-sm text-zinc-500">Nº presupuesto</p>
              <p className="font-bold">{budgetNumber}</p>

              <p className="mt-4 text-sm text-zinc-500">Fecha</p>
              <p className="font-bold">{formatDate(quote.created_at)}</p>

              <p className="mt-4 text-sm text-zinc-500">Validez</p>
              <p className="font-bold">7 días</p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[1.5fr_320px]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                {quote.template_name || formatQuoteType(quote.quote_type)}
              </p>

              <h2 className="mt-3 text-3xl font-black">
                {quote.title || "Presupuesto sin título"}
              </h2>

              <p className="mt-4 leading-7 text-zinc-600">
                {quote.description || "Sin descripción"}
              </p>
            </div>

            <div className="rounded-3xl bg-zinc-50 p-6">
              <p className="text-sm text-zinc-500">Total estimado</p>

              <p className="mt-2 text-5xl font-black">
                {formatCurrency(quote.estimated_price)}
              </p>

              <p className="mt-3 text-sm font-bold">
                Estado: {formatStatus(quote.status)}
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div>
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

            <div className="no-print">
              <h3 className="text-xl font-bold">Acciones</h3>

              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(whatsappMessage)
                  }
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

          <div className="mt-10">
            <h3 className="text-xl font-bold">Partidas</h3>

            <div className="mt-4 space-y-3">
              {quote.quote_items.length === 0 && (
                <p className="text-zinc-500">Sin partidas registradas.</p>
              )}

              {quote.quote_items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-2xl border p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-bold">{item.name || "Partida"}</p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {item.description || "Sin descripción"}
                    </p>
                  </div>

                  <p className="font-black">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-bold">Mensaje para WhatsApp</h3>

            <p className="mt-4 whitespace-pre-line leading-7 text-zinc-600">
              {whatsappMessage}
            </p>
          </div>

          <p className="mt-8 text-sm text-zinc-500">{legalNote}</p>
        </section>
      </div>
    </main>
  );
}