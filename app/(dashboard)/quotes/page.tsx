"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { serviceTemplates } from "@/lib/templates/service-templates";

type QuoteRow = {
  id: string;
  title: string | null;
  description: string | null;
  estimated_price: number | null;
  status: string | null;
  quote_type: string | null;
  template_id: string | null;
  template_name: string | null;
  created_at: string;
  clients: {
    name: string | null;
    phone: string | null;
    city: string | null;
  } | null;
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

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState("all");

  const filteredQuotes =
    selectedTemplateFilter === "all"
      ? quotes
      : quotes.filter((quote) => quote.template_id === selectedTemplateFilter);

  async function loadQuotes() {
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
          template_id,
          template_name,
          created_at,
          clients (
            name,
            phone,
            city
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setQuotes((data || []) as unknown as QuoteRow[]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error cargando presupuestos"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadQuotes();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-zinc-500">
              Presupuestos guardados
            </p>

            <h1 className="text-4xl font-black">Historial</h1>
          </div>

          <div className="flex gap-3">
            <a
              href="/dashboard"
              className="rounded-2xl border px-5 py-3 text-center font-semibold"
            >
              Volver al dashboard
            </a>

            <a
              href="/quotes/new"
              className="rounded-2xl bg-zinc-950 px-5 py-3 text-center font-semibold text-white"
            >
              Crear presupuesto
            </a>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSelectedTemplateFilter("all")}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              selectedTemplateFilter === "all"
                ? "bg-zinc-950 text-white"
                : "border bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Todos
          </button>

          {serviceTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedTemplateFilter(template.id)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                selectedTemplateFilter === template.id
                  ? "bg-zinc-950 text-white"
                  : "border bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {template.name}
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          {isLoading && <p className="text-zinc-500">Cargando...</p>}

          {!isLoading && filteredQuotes.length === 0 && (
            <p className="text-zinc-500">
              {selectedTemplateFilter === "all"
                ? "Todavía no has creado ningún presupuesto."
                : "No hay presupuestos para este filtro."}
            </p>
          )}

          {!isLoading && filteredQuotes.length > 0 && (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[2fr_1.3fr_1.2fr_1fr_1fr] border-b px-4 py-3 text-sm font-bold text-zinc-500">
                  <p>Presupuesto</p>
                  <p>Cliente</p>
                  <p>Servicio</p>
                  <p>Estado</p>
                  <p>Importe</p>
                </div>

                <div className="divide-y">
                  {filteredQuotes.map((quote) => (
                    <a
                      key={quote.id}
                      href={`/quotes/${quote.id}`}
                      className="grid grid-cols-[2fr_1.3fr_1.2fr_1fr_1fr] items-center px-4 py-5 transition hover:bg-zinc-50"
                    >
                      <div>
                        <p className="font-bold">
                          {quote.title || "Presupuesto sin título"}
                        </p>

                        <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
                          {quote.description || "Sin descripción"}
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold">
                          {quote.clients?.name || "Cliente sin nombre"}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          {quote.clients?.city || "Sin ciudad"}
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold">
                          {quote.template_name ||
                            formatQuoteType(quote.quote_type)}
                        </p>

                        {quote.template_name && (
                          <p className="mt-1 text-xs text-zinc-400">
                            {formatQuoteType(quote.quote_type)}
                          </p>
                        )}
                      </div>

                      <p className="font-semibold">
                        {formatStatus(quote.status)}
                      </p>

                      <p className="font-black">
                        {formatCurrency(quote.estimated_price)}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}