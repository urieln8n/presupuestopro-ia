"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { serviceTemplates } from "@/lib/templates/service-templates";
import { LogoutButton } from "@/components/auth/logout-button";

type QuoteRow = {
  id: string;
  title: string | null;
  estimated_price: number | null;
  status: string | null;
  quote_type: string | null;
  template_id: string | null;
  template_name: string | null;
  created_at: string;
  clients: {
    name: string | null;
  } | null;
};

function formatCurrency(value: number) {
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

export default function DashboardPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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
          estimated_price,
          status,
          quote_type,
          template_id,
          template_name,
          created_at,
          clients (
            name
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
        error instanceof Error ? error.message : "Error cargando dashboard"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadQuotes();
  }, []);

  const stats = useMemo(() => {
    const total = quotes.length;

    const pending = quotes.filter(
      (quote) => quote.status === "pending" || !quote.status
    ).length;

    const accepted = quotes.filter(
      (quote) => quote.status === "accepted"
    ).length;

    const rejected = quotes.filter(
      (quote) => quote.status === "rejected"
    ).length;

    const totalAmount = quotes.reduce((sum, quote) => {
      return sum + Number(quote.estimated_price || 0);
    }, 0);

    return {
      total,
      pending,
      accepted,
      rejected,
      totalAmount,
    };
  }, [quotes]);

  const templateStats = useMemo(() => {
    return serviceTemplates.map((template) => {
      const templateQuotes = quotes.filter(
        (quote) => quote.template_id === template.id
      );

      const totalAmount = templateQuotes.reduce((sum, quote) => {
        return sum + Number(quote.estimated_price || 0);
      }, 0);

      const accepted = templateQuotes.filter(
        (quote) => quote.status === "accepted"
      ).length;

      const pending = templateQuotes.filter(
        (quote) => quote.status === "pending" || !quote.status
      ).length;

      const rejected = templateQuotes.filter(
        (quote) => quote.status === "rejected"
      ).length;

      return {
        id: template.id,
        name: template.name,
        count: templateQuotes.length,
        totalAmount,
        accepted,
        pending,
        rejected,
      };
    });
  }, [quotes]);

  const latestQuotes = quotes.slice(0, 5);

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-zinc-500">
              Panel principal
            </p>
            <h1 className="text-4xl font-black">Dashboard</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="/quotes"
              className="rounded-2xl border px-5 py-3 text-center font-semibold"
            >
              Ver historial
            </a>

            <a
              href="/quotes/new"
              className="rounded-2xl bg-zinc-950 px-5 py-3 text-center font-semibold text-white"
            >
              Crear presupuesto
            </a>

            <a
              href="/settings"
              className="rounded-2xl border px-5 py-3 text-center font-semibold"
            >
              Ajustes
            </a>

            <LogoutButton />
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Presupuestos</p>
            <p className="mt-2 text-3xl font-black">
              {isLoading ? "..." : stats.total}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Pendientes</p>
            <p className="mt-2 text-3xl font-black">
              {isLoading ? "..." : stats.pending}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Aceptados</p>
            <p className="mt-2 text-3xl font-black">
              {isLoading ? "..." : stats.accepted}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Rechazados</p>
            <p className="mt-2 text-3xl font-black">
              {isLoading ? "..." : stats.rejected}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Importe total</p>
            <p className="mt-2 text-3xl font-black">
              {isLoading ? "..." : formatCurrency(stats.totalAmount)}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold text-zinc-500">
              Análisis por servicio
            </p>
            <h2 className="text-xl font-bold">Rendimiento por plantilla</h2>
          </div>

          {isLoading && <p className="text-zinc-500">Cargando estadísticas...</p>}

          {!isLoading && (
            <div className="grid gap-4 md:grid-cols-3">
              {templateStats.map((template) => (
                <div key={template.id} className="rounded-3xl border p-5">
                  <p className="font-bold">{template.name}</p>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-zinc-500">Presupuestos</p>
                      <p className="text-xl font-black">{template.count}</p>
                    </div>

                    <div>
                      <p className="text-zinc-500">Importe</p>
                      <p className="text-xl font-black">
                        {formatCurrency(template.totalAmount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-zinc-500">Aceptados</p>
                      <p className="text-xl font-black">{template.accepted}</p>
                    </div>

                    <div>
                      <p className="text-zinc-500">Pendientes</p>
                      <p className="text-xl font-black">{template.pending}</p>
                    </div>

                    <div>
                      <p className="text-zinc-500">Rechazados</p>
                      <p className="text-xl font-black">{template.rejected}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">Últimos presupuestos</h2>

            <a href="/quotes" className="text-sm font-semibold text-zinc-500">
              Ver todos →
            </a>
          </div>

          {isLoading && <p className="text-zinc-500">Cargando...</p>}

          {!isLoading && latestQuotes.length === 0 && (
            <p className="text-zinc-500">
              Todavía no has creado ningún presupuesto.
            </p>
          )}

          {!isLoading && latestQuotes.length > 0 && (
            <div className="space-y-3">
              {latestQuotes.map((quote) => (
                <a
                  key={quote.id}
                  href={`/quotes/${quote.id}`}
                  className="grid gap-3 rounded-2xl border p-4 transition hover:bg-zinc-50 md:grid-cols-[1.5fr_1fr_0.7fr_0.7fr]"
                >
                  <div>
                    <p className="font-bold">
                      {quote.title || "Presupuesto sin título"}
                    </p>

                    <p className="text-sm text-zinc-500">
                      {quote.clients?.name || "Cliente sin nombre"}
                    </p>

                    {quote.template_name && (
                      <p className="mt-1 text-xs font-semibold text-zinc-400">
                        {quote.template_name}
                      </p>
                    )}
                  </div>

                  <p className="font-semibold">{formatStatus(quote.status)}</p>

                  <p className="font-bold">
                    {formatCurrency(Number(quote.estimated_price || 0))}
                  </p>

                  <p className="text-sm font-semibold text-zinc-500">
                    Abrir →
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}