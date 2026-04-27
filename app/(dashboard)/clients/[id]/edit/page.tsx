"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type ClientEditData = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
};

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [client, setClient] = useState<ClientEditData | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadClient() {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

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
          address
        `
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw error;
      }

      const clientData = data as ClientEditData;

      setClient(clientData);
      setName(clientData.name || "");
      setPhone(clientData.phone || "");
      setEmail(clientData.email || "");
      setCity(clientData.city || "");
      setAddress(clientData.address || "");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error cargando cliente"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function saveClient() {
    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!client) {
        throw new Error("No se encontró el cliente.");
      }

      if (!name.trim()) {
        throw new Error("El nombre del cliente no puede estar vacío.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      const { error } = await supabase
        .from("clients")
        .update({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          city: city.trim(),
          address: address.trim(),
        })
        .eq("id", client.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setSuccessMessage("Cliente actualizado correctamente.");

      setTimeout(() => {
        window.location.href = `/clients/${client.id}`;
      }, 700);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error guardando cliente"
      );
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    loadClient();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-zinc-500">Cargando editor de cliente...</p>
        </div>
      </main>
    );
  }

  if (errorMessage && !client) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-4xl">
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
        <div className="mx-auto max-w-4xl">
          <p className="text-zinc-500">Cliente no encontrado.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <a
              href={`/clients/${client.id}`}
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-950"
            >
              ← Volver a la ficha
            </a>

            <p className="mt-4 text-sm font-semibold text-zinc-500">
              Editar cliente
            </p>

            <h1 className="text-4xl font-black">Actualizar datos</h1>

            <p className="mt-2 text-zinc-500">
              Corrige la información del cliente para futuros presupuestos.
            </p>
          </div>

          <a
            href="/clients"
            className="rounded-2xl border px-5 py-3 text-center font-semibold"
          >
            Ver clientes
          </a>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-3xl border border-green-200 bg-green-50 p-6 text-green-700">
            {successMessage}
          </div>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-zinc-500">
              Datos del cliente
            </p>

            <h2 className="mt-1 text-2xl font-black">Información principal</h2>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-zinc-700">
                Nombre del cliente
              </label>

              <input
                className="mt-2 w-full rounded-2xl border px-4 py-3"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-zinc-700">
                Teléfono
              </label>

              <input
                className="mt-2 w-full rounded-2xl border px-4 py-3"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Teléfono"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-zinc-700">Email</label>

              <input
                type="email"
                className="mt-2 w-full rounded-2xl border px-4 py-3"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-zinc-700">Ciudad</label>

              <input
                className="mt-2 w-full rounded-2xl border px-4 py-3"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Ciudad"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-zinc-700">
                Dirección
              </label>

              <input
                className="mt-2 w-full rounded-2xl border px-4 py-3"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Dirección"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={saveClient}
              disabled={isSaving}
              className="rounded-2xl bg-zinc-950 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>

            <a
              href={`/clients/${client.id}`}
              className="rounded-2xl border px-5 py-3 text-center font-semibold"
            >
              Cancelar
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}