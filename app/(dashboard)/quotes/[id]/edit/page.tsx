"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type QuoteItemEdit = {
  id?: string;
  name: string;
  description: string;
  total: string;
};

type QuoteEditData = {
  id: string;
  client_id: string | null;
  title: string | null;
  description: string | null;
  estimated_price: number | null;
  whatsapp_message: string | null;
  status: string | null;
  clients: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
    address: string | null;
  } | null;
  quote_items: {
    id: string;
    name: string | null;
    description: string | null;
    total: number | null;
  }[];
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

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  const [items, setItems] = useState<QuoteItemEdit[]>([]);

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
          client_id,
          title,
          description,
          estimated_price,
          whatsapp_message,
          status,
          clients (
            id,
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
            total
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

      setClientName(quoteData.clients?.name || "");
      setClientPhone(quoteData.clients?.phone || "");
      setClientEmail(quoteData.clients?.email || "");
      setClientCity(quoteData.clients?.city || "");
      setClientAddress(quoteData.clients?.address || "");

      setItems(
        (quoteData.quote_items || []).map((item) => ({
          id: item.id,
          name: item.name || "",
          description: item.description || "",
          total: String(item.total || ""),
        }))
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error cargando presupuesto"
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updateItem(
    index: number,
    field: keyof QuoteItemEdit,
    value: string
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        name: "",
        description: "",
        total: "",
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function calculateItemsTotal() {
    return items.reduce((sum, item) => {
      return sum + Number(item.total || 0);
    }, 0);
  }

  function syncPriceWithItems() {
    const total = calculateItemsTotal();
    setEstimatedPrice(String(Math.round(total)));
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

      if (!clientName.trim()) {
        throw new Error("El nombre del cliente no puede estar vacío.");
      }

      const priceNumber = Number(estimatedPrice);

      if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
        throw new Error("El precio debe ser un número mayor que 0.");
      }

      const validItems = items
        .map((item) => ({
          name: item.name.trim(),
          description: item.description.trim(),
          total: Number(item.total || 0),
        }))
        .filter((item) => item.name && item.total > 0);

      if (validItems.length === 0) {
        throw new Error("Añade al menos una partida con nombre e importe.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      const { error: quoteError } = await supabase
        .from("quotes")
        .update({
          title: title.trim(),
          description: description.trim(),
          estimated_price: Math.round(priceNumber),
          whatsapp_message: whatsappMessage.trim(),
        })
        .eq("id", quote.id)
        .eq("user_id", user.id);

      if (quoteError) {
        throw quoteError;
      }

      if (quote.client_id) {
        const { error: clientError } = await supabase
          .from("clients")
          .update({
            name: clientName.trim(),
            phone: clientPhone.trim(),
            email: clientEmail.trim(),
            city: clientCity.trim(),
            address: clientAddress.trim(),
          })
          .eq("id", quote.client_id)
          .eq("user_id", user.id);

        if (clientError) {
          throw clientError;
        }
      }

      const { error: deleteItemsError } = await supabase
        .from("quote_items")
        .delete()
        .eq("quote_id", quote.id);

      if (deleteItemsError) {
        throw deleteItemsError;
      }

      const itemsToInsert = validItems.map((item) => ({
        quote_id: quote.id,
        name: item.name,
        description: item.description,
        quantity: 1,
        unit: "servicio",
        unit_price: item.total,
        total: item.total,
      }));

      const { error: insertItemsError } = await supabase
        .from("quote_items")
        .insert(itemsToInsert);

      if (insertItemsError) {
        throw insertItemsError;
      }

      setSuccessMessage("Presupuesto, cliente y partidas actualizados.");

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
      <div className="mx-auto max-w-6xl">
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
              Edita presupuesto, cliente y partidas antes de enviar el PDF.
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

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-zinc-500">
                Datos del presupuesto
              </p>
              <h2 className="mt-1 text-2xl font-black">
                Información principal
              </h2>

              <div className="mt-6 space-y-5">
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

                  <div className="mt-3 flex flex-col gap-3 md:flex-row">
                    <button
                      type="button"
                      onClick={syncPriceWithItems}
                      className="rounded-2xl border px-4 py-2 text-sm font-semibold"
                    >
                      Usar suma de partidas: {calculateItemsTotal()} €
                    </button>
                  </div>
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
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-semibold text-zinc-500">
                    Partidas
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    Conceptos del presupuesto
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-2xl bg-zinc-950 px-5 py-3 font-semibold text-white"
                >
                  Añadir partida
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {items.length === 0 && (
                  <p className="text-zinc-500">No hay partidas todavía.</p>
                )}

                {items.map((item, index) => (
                  <div key={index} className="rounded-3xl border p-4">
                    <div className="grid gap-4 md:grid-cols-[1fr_160px]">
                      <div>
                        <label className="text-sm font-bold text-zinc-700">
                          Nombre
                        </label>

                        <input
                          className="mt-2 w-full rounded-2xl border px-4 py-3"
                          value={item.name}
                          onChange={(event) =>
                            updateItem(index, "name", event.target.value)
                          }
                          placeholder="Ej: Pintura, limpieza, materiales..."
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-zinc-700">
                          Importe
                        </label>

                        <input
                          type="number"
                          className="mt-2 w-full rounded-2xl border px-4 py-3"
                          value={item.total}
                          onChange={(event) =>
                            updateItem(index, "total", event.target.value)
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-bold text-zinc-700">
                        Descripción
                      </label>

                      <textarea
                        className="mt-2 min-h-24 w-full rounded-2xl border px-4 py-3"
                        value={item.description}
                        onChange={(event) =>
                          updateItem(index, "description", event.target.value)
                        }
                        placeholder="Descripción de la partida"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                    >
                      Eliminar partida
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-zinc-500">
              Datos del cliente
            </p>

            <h2 className="mt-1 text-2xl font-black">Cliente</h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-zinc-700">
                  Nombre
                </label>

                <input
                  className="mt-2 w-full rounded-2xl border px-4 py-3"
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-zinc-700">
                  Teléfono
                </label>

                <input
                  className="mt-2 w-full rounded-2xl border px-4 py-3"
                  value={clientPhone}
                  onChange={(event) => setClientPhone(event.target.value)}
                  placeholder="Teléfono"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-zinc-700">
                  Email
                </label>

                <input
                  type="email"
                  className="mt-2 w-full rounded-2xl border px-4 py-3"
                  value={clientEmail}
                  onChange={(event) => setClientEmail(event.target.value)}
                  placeholder="Email"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-zinc-700">
                  Ciudad
                </label>

                <input
                  className="mt-2 w-full rounded-2xl border px-4 py-3"
                  value={clientCity}
                  onChange={(event) => setClientCity(event.target.value)}
                  placeholder="Ciudad"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-zinc-700">
                  Dirección
                </label>

                <input
                  className="mt-2 w-full rounded-2xl border px-4 py-3"
                  value={clientAddress}
                  onChange={(event) => setClientAddress(event.target.value)}
                  placeholder="Dirección"
                />
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-zinc-50 p-5">
              <p className="text-sm text-zinc-500">Suma de partidas</p>
              <p className="mt-2 text-3xl font-black">
                {calculateItemsTotal()} €
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm md:flex-row">
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
    </main>
  );
}