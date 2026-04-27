"use client";

import { use, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type ClientDetail = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  created_at: string;
  quotes: {
    id: string;
    title: string | null;
    description: string | null;
    estimated_price: number | null;
    status: string | null;
    quote_type: string | null;
    template_name: string | null;
    created_at: string;
  }[];
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

function createWhatsAppLink(phone: string | null | undefined) {
  const cleanPhone = String(phone || "").replace(/\D/g, "");

  if (!cleanPhone) {
    return "#";
  }

  const message = encodeURIComponent(
    "Hola, te escribo sobre tu presupuesto. ¿Podemos revisar los detalles?"
  );

  return `https://wa.me/${cleanPhone}?text=${message}`;
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadClient() {
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
        .from("clients")
        .select(
          `
          id,
          name,
          phone,
          email,
          city,
          address,
          created_at,
          quotes (
            id,
            title,
            description,
            estimated_price,
            status,
            quote_type,
            template_name,
            created_at
          )
        `
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw error;
      }

      setClient(data as ClientDetail);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error cargando cliente"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadClient();
  }, []);

  const stats = useMemo(() => {
    const quotes = client?.quotes || [];

    const totalQuotes = quotes.length;

    const totalAmount = quotes.reduce((sum, quote) => {
      return sum + Number(quote.estimated_price || 0);
    }, 0);

    const accepted = quotes.filter(
      (quote) => quote.status === "accepted"
    ).length;

    const pending = quotes.filter(
      (quote) => quote.status === "pending" || !quote.status
    ).length;

    const rejected = quotes.filter(
      (quote) => quote.status === "rejected"
    ).length;

    return {
      totalQuotes,
      totalAmount,
      accepted,
      pending,
      rejected,
    };
  }, [client]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-zinc-500">Cargando cliente...</p>
        </div>
      </main>
    );
  }

  if (errorMessage && !client) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-6xl">
          <a
            href="/clients"
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-950"
          >
            ← Volver a clientes
          </a>

          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        </div>
      </main>
    );
  }

  if (!client) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-zinc-500">Cliente no encontrado.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <a
              href="/clients"
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-950"
            >
              ← Volver a clientes
            </a>

            <p className="mt-4 text-sm font-semibold text-zinc-500">
              Ficha de cliente
            </p>

            <h1 className="text-4xl font-black">
              {client.name || "Cliente sin nombre"}
            </h1>

            <p className="mt-2 text-zinc-500">
              Cliente creado el {formatDate(client.created_at)}
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
              href="/quotes/new"
              className="rounded-2xl bg-zinc-950 px-5 py-3 text-center font-semibold text-white"
            >
              Crear presupuesto
            </a>

<a
  href={`/clients/${client.id}/edit`}
  className="rounded-2xl border px-5 py-3 text-center font-semibold"
>
  Editar cliente
</a>

            <a
              href={createWhatsAppLink(client.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-2xl px-5 py-3 text-center font-semibold text-white ${
                client.phone
                  ? "bg-green-600"
                  : "pointer-events-none bg-zinc-300"
              }`}
            >
              WhatsApp
            </a>
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
            <p className="mt-2 text-3xl font-black">{stats.totalQuotes}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Importe total</p>
            <p className="mt-2 text-3xl font-black">
              {formatCurrency(stats.totalAmount)}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Aceptados</p>
            <p className="mt-2 text-3xl font-black">{stats.accepted}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Pendientes</p>
            <p className="mt-2 text-3xl font-black">{stats.pending}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Rechazados</p>
            <p className="mt-2 text-3xl font-black">{stats.rejected}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="h-fit rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-zinc-500">
              Datos de contacto
            </p>

            <h2 className="mt-1 text-2xl font-black">Información</h2>

            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="font-bold text-zinc-700">Nombre</p>
                <p className="mt-1 text-zinc-500">
                  {client.name || "Sin nombre"}
                </p>
              </div>

              <div>
                <p className="font-bold text-zinc-700">Teléfono</p>
                <p className="mt-1 text-zinc-500">
                  {client.phone || "Sin teléfono"}
                </p>
              </div>

              <div>
                <p className="font-bold text-zinc-700">Email</p>
                <p className="mt-1 text-zinc-500">
                  {client.email || "Sin email"}
                </p>
              </div>

              <div>
                <p className="font-bold text-zinc-700">Ciudad</p>
                <p className="mt-1 text-zinc-500">
                  {client.city || "Sin ciudad"}
                </p>
              </div>

              <div>
                <p className="font-bold text-zinc-700">Dirección</p>
                <p className="mt-1 text-zinc-500">
                  {client.address || "Sin dirección"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold text-zinc-500">
                  Historial comercial
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Presupuestos del cliente
                </h2>
              </div>
            </div>

            {client.quotes.length === 0 && (
              <p className="text-zinc-500">
                Este cliente todavía no tiene presupuestos asociados.
              </p>
            )}

            {client.quotes.length > 0 && (
              <div className="space-y-3">
                {client.quotes.map((quote) => (
                  <a
                    key={quote.id}
                    href={`/quotes/${quote.id}`}
                    className="grid gap-3 rounded-2xl border p-4 transition hover:bg-zinc-50 md:grid-cols-[1.5fr_0.8fr_0.8fr_0.6fr]"
                  >
                    <div>
                      <p className="font-bold">
                        {quote.title || "Presupuesto sin título"}
                      </p>

                      <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
                        {quote.description || "Sin descripción"}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-zinc-400">
                        {quote.template_name ||
                          formatQuoteType(quote.quote_type)}
                      </p>
                    </div>

                    <p className="font-semibold">
                      {formatStatus(quote.status)}
                    </p>

                    <p className="font-black">
                      {formatCurrency(quote.estimated_price)}
                    </p>

                    <p className="text-sm font-semibold text-zinc-500">
                      Abrir →
                    </p>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}