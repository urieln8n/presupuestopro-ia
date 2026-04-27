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

type BusinessSettings = {
  plan: string | null;
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

function getPlanLabel(plan: string) {
  if (plan === "premium") return "Premium";
  if (plan === "pro") return "Pro";
  return "Free";
}

function getPlanDescription(plan: string) {
  if (plan === "premium") {
    return "Automatizaciones, auditoría web, soporte prioritario y configuración personalizada.";
  }

  if (plan === "pro") {
    return "Presupuestos ilimitados, CRM completo, PDF profesional, WhatsApp y edición avanzada.";
  }

  return "Plan inicial para probar presupuestos con IA, clientes e historial básico.";
}

function getPlanFeatures(plan: string) {
  if (plan === "premium") {
    return [
      "Todo lo incluido en Pro",
      "Automatizaciones comerciales",
      "Auditoría web y operativa",
      "Configuración personalizada",
      "Soporte prioritario",
    ];
  }

  if (plan === "pro") {
    return [
      "Presupuestos ilimitados",
      "CRM completo",
      "PDF profesional",
      "WhatsApp integrado",
      "Edición avanzada",
    ];
  }

  return [
    "Hasta 5 presupuestos recomendados",
    "Plantillas básicas",
    "Clientes guardados",
    "Historial simple",
    "WhatsApp manual",
  ];
}

export default function DashboardPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [businessSettings, setBusinessSettings] =
    useState<BusinessSettings | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard() {
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

      const { data: quotesData, error: quotesError } = await supabase
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

      if (quotesError) {
        throw quotesError;
      }

      const { data: settingsData, error: settingsError } = await supabase
        .from("business_settings")
        .select("plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settingsError) {
        throw settingsError;
      }

      setQuotes((quotesData || []) as unknown as QuoteRow[]);
      setBusinessSettings((settingsData || null) as BusinessSettings | null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error cargando dashboard"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const currentPlan = businessSettings?.plan || "free";
  const planLabel = getPlanLabel(currentPlan);
  const planDescription = getPlanDescription(currentPlan);
  const planFeatures = getPlanFeatures(currentPlan);

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

  const freePlanQuoteLimit = 5;
  const freePlanUsedPercent =
    currentPlan === "free"
      ? Math.min(100, Math.round((stats.total / freePlanQuoteLimit) * 100))
      : 100;

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
              href="/clients"
              className="rounded-2xl border px-5 py-3 text-center font-semibold"
            >
              Clientes
            </a>

<a
  href="/premium-requests"
  className="rounded-2xl border px-5 py-3 text-center font-semibold"
>
  Solicitudes
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

        <section className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-semibold text-zinc-400">
                  Plan actual
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-4xl font-black">{planLabel}</h2>

                  {currentPlan === "pro" && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-widest text-zinc-950">
                      Recomendado
                    </span>
                  )}

                  {currentPlan === "premium" && (
                    <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-black uppercase tracking-widest text-zinc-950">
                      Premium
                    </span>
                  )}
                </div>

                <p className="mt-4 max-w-2xl leading-7 text-zinc-300">
                  {planDescription}
                </p>
              </div>

              <a
                href="/#planes"
                className="rounded-2xl bg-white px-5 py-3 text-center font-bold text-zinc-950"
              >
                Ver planes
              </a>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {planFeatures.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-sm font-semibold text-zinc-200">
                    ✓ {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-zinc-500">
              Uso del plan
            </p>

            {currentPlan === "free" ? (
              <>
                <h2 className="mt-2 text-3xl font-black">
                  {stats.total}/{freePlanQuoteLimit}
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Presupuestos creados en el plan Free.
                </p>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-zinc-950"
                    style={{ width: `${freePlanUsedPercent}%` }}
                  />
                </div>

                <p className="mt-5 text-sm leading-6 text-zinc-500">
                  Cuando el negocio empiece a usar la herramienta con clientes
                  reales, el plan Pro desbloquea uso ilimitado y funciones
                  avanzadas.
                </p>

                <a
                  href="/#planes"
                  className="mt-5 block rounded-2xl border px-5 py-3 text-center font-bold"
                >
                  Mejorar a Pro
                </a>
              </>
            ) : (
              <>
                <h2 className="mt-2 text-3xl font-black">Activo</h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Tu plan permite trabajar con más volumen, clientes y funciones
                  comerciales.
                </p>

                <a
                  href="/#planes"
                  className="mt-5 block rounded-2xl border px-5 py-3 text-center font-bold"
                >
                  Ver opciones
                </a>
              </>
            )}
          </div>
        </section>

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