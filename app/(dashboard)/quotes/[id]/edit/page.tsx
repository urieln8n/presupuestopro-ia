"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type QuoteEditData = {
  id: string;
  title: string | null;
  description: string | null;
  estimated_price: number | null;
  whatsapp_message: string | null;
  status: string | null;
  clients: {
    name: string | null;
  } | null;
};

export default function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [quote, setQuote] = useState<QuoteEditData | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadQuote() {
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
        .from("quotes")
        .select(
          `
          id,
          title,
          description,
          estimated_price,
          whatsapp_message,
          status,
          clients (
            name
          )
        `
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw error;
      }

      const quoteData = data as unknown as QuoteEditData;

      setQuote(quoteData);
      setTitle(quoteData.title || "");
      setDescription(quoteData.description || "");
      setEstimatedPrice(String(quoteData.estimated_price || ""));
      setWhatsappMessage(quoteData.whatsapp_message || "");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error cargando presupuesto"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function saveChanges() {
    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!quote) {
        throw new Error("No se encontró el presupuesto.");
      }

      if (!title.trim()) {
        throw new Error("El título no puede estar vacío.");
      }

      const priceNumber = Number(estimatedPrice);

      if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
        throw new Error("El precio debe ser un número mayor que 0.");
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
        .from("quotes")
        .update({
          title: title.trim(),
          description: description.trim(),
          estimated_price: Math.round(priceNumber),
          whatsapp_message: whatsappMessage.trim(),
        })
        .eq("id", quote.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setSuccessMessage("Presupuesto actualizado correctamente.");

      setTimeout(() => {
        window.location.href = `/quotes/${quote.id}`;
      }, 700);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error guardando cambios"
      );
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    loadQuote();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-zinc-500">Cargando editor...</p>
        </div>
      </main>
    );
  }

  if (errorMessage && !quote) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-4xl">
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
        <div className="mx-auto max-w-4xl">
          <p className="text-zinc-500">Presupuesto no encontrado.</p>
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
              href={`/quotes/${quote.id}`}
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-950"
            >
              ← Volver al presupuesto
            </a>

            <p className="mt-4 text-sm font-semibold text-zinc-500">
              Editar presupuesto
            </p>

            <h1 className="text-4xl font-black">
              Ajustar presupuesto guardado
            </h1>

            <p className="mt-2 text-zinc-500">
              Cliente: {quote.clients?.name || "Cliente sin nombre"}
            </p>
          </div>

          <a
            href="/quotes"
            className="rounded-2xl border px-5 py-3 text-center font-semibold"
          >
            Ver historial
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
          <div className="space-y-5">
            <div>
              <label className="text-sm font-bold text-zinc-700">
                Título del presupuesto
              </label>

              <input
                className="mt-2 w-full rounded-2xl border px-4 py-3"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Título del presupuesto"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-zinc-700">
                Descripción / resumen
              </label>

              <textarea
                className="mt-2 min-h-36 w-full rounded-2xl border px-4 py-3"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Descripción del presupuesto"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-zinc-700">
                Precio estimado
              </label>

              <input
                type="number"
                className="mt-2 w-full rounded-2xl border px-4 py-3"
                value={estimatedPrice}
                onChange={(event) => setEstimatedPrice(event.target.value)}
                placeholder="Precio estimado"
              />

              <p className="mt-2 text-xs text-zinc-500">
                Introduce el importe final sin símbolo de euro. Ejemplo: 3349
              </p>
            </div>

            <div>
              <label className="text-sm font-bold text-zinc-700">
                Mensaje para WhatsApp
              </label>

              <textarea
                className="mt-2 min-h-40 w-full rounded-2xl border px-4 py-3"
                value={whatsappMessage}
                onChange={(event) => setWhatsappMessage(event.target.value)}
                placeholder="Mensaje para WhatsApp"
              />
            </div>

            <div className="flex flex-col gap-3 pt-3 md:flex-row">
              <button
                type="button"
                onClick={saveChanges}
                disabled={isSaving}
                className="rounded-2xl bg-zinc-950 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>

              <a
                href={`/quotes/${quote.id}`}
                className="rounded-2xl border px-5 py-3 text-center font-semibold"
              >
                Cancelar
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}