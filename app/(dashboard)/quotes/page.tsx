"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type QuoteRow = {
  id: string;
  title: string | null;
  description: string | null;
  estimated_price: number | null;
  status: string | null;
  quote_type: string;
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
  }).format(value || 0);
}

function formatStatus(status: string | null) {
  if (status === "accepted") return "Aceptado";
  if (status === "rejected") return "Rechazado";
  return "Pendiente";
}

function formatQuoteType(type: string) {
  if (type === "reform") return "Reforma";
  if (type === "cleaning") return "Limpieza";
  return "Combinado";
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadQuotes() {
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
          created_at,
          clients (
            name,
            phone,
            city
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setQuotes((data || []) as unknown as QuoteRow[]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error cargando presupuestos"
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

          <a
            href="/quotes/new"
            className="rounded-2xl bg-zinc-950 px-5 py-3 text-center font-semibold text-white"
          >
            Crear presupuesto
          </a>
        </div>

        {isLoading && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-zinc-500">Cargando presupuestos...</p>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && quotes.length === 0 && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-zinc-500">
              Todavía no hay presupuestos guardados.
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && quotes.length > 0 && (
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="hidden grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.7fr] gap-4 border-b bg-zinc-100 p-4 text-sm font-bold text-zinc-600 md:grid">
              <p>Presupuesto</p>
              <p>Cliente</p>
              <p>Tipo</p>
              <p>Estado</p>
              <p>Importe</p>
            </div>

            {quotes.map((quote) => (
              <a
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="grid gap-3 border-b p-4 transition last:border-b-0 hover:bg-zinc-50 md:grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.7fr] md:items-center"
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
                  <p className="text-sm text-zinc-500">
                    {quote.clients?.city || "Sin ciudad"}
                  </p>
                </div>

                <p className="text-sm font-semibold">
                  {formatQuoteType(quote.quote_type)}
                </p>

                <p className="text-sm font-semibold">
                  {formatStatus(quote.status)}
                </p>

                <p className="font-black">
                  {formatCurrency(quote.estimated_price)}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}