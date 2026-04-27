"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type PremiumRequest = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  website: string | null;
  service_interest: string;
  message: string | null;
  status: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatInterest(value: string) {
  if (value === "premium") return "Plan Premium";
  if (value === "setup_pro") return "Setup Pro";
  if (value === "automation") return "Automatizaciones";
  if (value === "audit") return "Auditoría web/operativa";
  if (value === "custom") return "Proyecto personalizado";
  return "Solicitud";
}

function formatStatus(value: string) {
  if (value === "contacted") return "Contactado";
  if (value === "closed") return "Cerrado";
  return "Nuevo";
}

export default function PremiumRequestsPage() {
  const [requests, setRequests] = useState<PremiumRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadRequests() {
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
        .from("premium_requests")
        .select(
          `
          id,
          created_at,
          name,
          email,
          phone,
          business_name,
          website,
          service_interest,
          message,
          status
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setRequests((data || []) as PremiumRequest[]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error cargando solicitudes Premium"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function updateRequestStatus(id: string, status: string) {
    try {
      setIsUpdatingId(id);
      setErrorMessage("");

      const { error } = await supabase
        .from("premium_requests")
        .update({ status })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setRequests((current) =>
        current.map((request) =>
          request.id === id
            ? {
                ...request,
                status,
              }
            : request
        )
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error actualizando solicitud"
      );
    } finally {
      setIsUpdatingId(null);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const newRequests = requests.filter((request) => request.status === "new");
  const contactedRequests = requests.filter(
    (request) => request.status === "contacted"
  );
  const closedRequests = requests.filter(
    (request) => request.status === "closed"
  );

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-zinc-500">
              Solicitudes comerciales
            </p>

            <h1 className="text-4xl font-black">Premium Requests</h1>

            <p className="mt-2 text-zinc-500">
              Consulta solicitudes de diagnóstico, setup, automatizaciones y
              proyectos Premium.
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
              href="/diagnostico"
              className="rounded-2xl bg-zinc-950 px-5 py-3 text-center font-semibold text-white"
            >
              Ver formulario
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
            <p className="text-sm text-zinc-500">Solicitudes</p>
            <p className="mt-2 text-3xl font-black">
              {isLoading ? "..." : requests.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Nuevas</p>
            <p className="mt-2 text-3xl font-black">
              {isLoading ? "..." : newRequests.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Contactadas</p>
            <p className="mt-2 text-3xl font-black">
              {isLoading ? "..." : contactedRequests.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Cerradas</p>
            <p className="mt-2 text-3xl font-black">
              {isLoading ? "..." : closedRequests.length}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Listado de solicitudes</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Gestiona oportunidades Premium y marca el seguimiento comercial.
            </p>
          </div>

          {isLoading && (
            <p className="text-zinc-500">Cargando solicitudes...</p>
          )}

          {!isLoading && requests.length === 0 && (
            <p className="text-zinc-500">
              Todavía no hay solicitudes Premium.
            </p>
          )}

          {!isLoading && requests.length > 0 && (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="rounded-3xl border p-5">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-black">{request.name}</h3>

                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-zinc-600">
                          {formatStatus(request.status)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-zinc-500">
                        {formatDate(request.created_at)}
                      </p>

                      <p className="mt-4 font-semibold">
                        {formatInterest(request.service_interest)}
                      </p>

                      {request.business_name && (
                        <p className="mt-1 text-sm text-zinc-600">
                          Negocio: {request.business_name}
                        </p>
                      )}

                      {request.website && (
                        <p className="mt-1 text-sm text-zinc-600">
                          Web / Instagram: {request.website}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <a
                        href={`mailto:${request.email}`}
                        className="rounded-2xl border px-4 py-3 text-center text-sm font-semibold"
                      >
                        Email
                      </a>

                      {request.phone && (
                        <a
                          href={`https://wa.me/${request.phone.replace(
                            /\D/g,
                            ""
                          )}?text=${encodeURIComponent(
                            "Hola, te escribo por tu solicitud de diagnóstico en PresupuestoPro IA."
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_260px]">
                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <p className="text-sm font-bold text-zinc-500">
                        Mensaje
                      </p>

                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-zinc-700">
                        {request.message || "Sin mensaje adicional."}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-zinc-50 p-4">
                      <p className="text-sm font-bold text-zinc-500">
                        Contacto
                      </p>

                      <p className="mt-2 text-sm font-semibold">
                        {request.email}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {request.phone || "Sin teléfono"}
                      </p>

                      <div className="mt-4 grid gap-2">
                        <button
                          type="button"
                          disabled={isUpdatingId === request.id}
                          onClick={() =>
                            updateRequestStatus(request.id, "new")
                          }
                          className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-60"
                        >
                          Nuevo
                        </button>

                        <button
                          type="button"
                          disabled={isUpdatingId === request.id}
                          onClick={() =>
                            updateRequestStatus(request.id, "contacted")
                          }
                          className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-60"
                        >
                          Contactado
                        </button>

                        <button
                          type="button"
                          disabled={isUpdatingId === request.id}
                          onClick={() =>
                            updateRequestStatus(request.id, "closed")
                          }
                          className="rounded-xl bg-zinc-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          Cerrado
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}