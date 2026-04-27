"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type ClientRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  created_at: string;
  quotes: {
    id: string;
    estimated_price: number | null;
    status: string | null;
  }[];
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

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadClients() {
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
            estimated_price,
            status
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setClients((data || []) as ClientRow[]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error cargando clientes"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    if (!normalizedSearch) {
      return clients;
    }

    return clients.filter((client) => {
      const text = [
        client.name,
        client.phone,
        client.email,
        client.city,
        client.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(normalizedSearch);
    });
  }, [clients, search]);

  const stats = useMemo(() => {
    const totalClients = clients.length;

    const totalQuotes = clients.reduce((sum, client) => {
      return sum + client.quotes.length;
    }, 0);

    const totalAmount = clients.reduce((sum, client) => {
      const clientAmount = client.quotes.reduce((quoteSum, quote) => {
        return quoteSum + Number(quote.estimated_price || 0);
      }, 0);

      return sum + clientAmount;
    }, 0);

    const acceptedQuotes = clients.reduce((sum, client) => {
      return (
        sum +
        client.quotes.filter((quote) => quote.status === "accepted").length
      );
    }, 0);

    return {
      totalClients,
      totalQuotes,
      totalAmount,
      acceptedQuotes,
    };
  }, [clients]);

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-zinc-500">
              Base de clientes
            </p>

            <h1 className="text-4xl font-black">Clientes</h1>

            <p className="mt-2 text-zinc-500">
              Consulta clientes creados automáticamente desde tus presupuestos.
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
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Clientes</p>
            <p className="mt-2 text-3xl font-black">
              {isLoading ? "..." : stats.totalClients}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Presupuestos</p>
            <p className="mt-2 text-3xl font-black">
              {isLoading ? "..." : stats.totalQuotes}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Aceptados</p>
            <p className="mt-2 text-3xl font-black">
              {isLoading ? "..." : stats.acceptedQuotes}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Importe total</p>
            <p className="mt-2 text-3xl font-black">
              {isLoading ? "..." : formatCurrency(stats.totalAmount)}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold">Listado de clientes</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Busca por nombre, teléfono, email, ciudad o dirección.
              </p>
            </div>

            <input
              className="w-full rounded-2xl border px-4 py-3 md:max-w-sm"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {isLoading && <p className="text-zinc-500">Cargando clientes...</p>}

          {!isLoading && filteredClients.length === 0 && (
            <p className="text-zinc-500">
              {search
                ? "No hay clientes que coincidan con la búsqueda."
                : "Todavía no hay clientes guardados."}
            </p>
          )}

          {!isLoading && filteredClients.length > 0 && (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr_0.8fr] border-b px-4 py-3 text-sm font-bold text-zinc-500">
                  <p>Cliente</p>
                  <p>Contacto</p>
                  <p>Ciudad</p>
                  <p>Dirección</p>
                  <p>Presupuestos</p>
                  <p>Importe</p>
                </div>

                <div className="divide-y">
                  {filteredClients.map((client) => {
                    const totalAmount = client.quotes.reduce((sum, quote) => {
                      return sum + Number(quote.estimated_price || 0);
                    }, 0);

                    const latestQuote = client.quotes[0];

                    return (
                      <div
                        key={client.id}
                        className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr_0.8fr] items-center px-4 py-5"
                      >
                        <div>
                          <p className="font-bold">
                            {client.name || "Cliente sin nombre"}
                          </p>

                          {latestQuote && (
                            <p className="mt-1 text-xs font-semibold text-zinc-400">
                              Último estado: {formatStatus(latestQuote.status)}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            {client.phone || "Sin teléfono"}
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            {client.email || "Sin email"}
                          </p>
                        </div>

                        <p className="text-sm font-semibold">
                          {client.city || "Sin ciudad"}
                        </p>

                        <p className="line-clamp-2 text-sm text-zinc-500">
                          {client.address || "Sin dirección"}
                        </p>

                        <p className="font-black">{client.quotes.length}</p>

                        <p className="font-black">
                          {formatCurrency(totalAmount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}