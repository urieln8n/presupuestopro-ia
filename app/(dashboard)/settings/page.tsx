"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type BusinessSettings = {
  id: string;
  company_name: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  legal_note: string | null;
};

const emptySettings: BusinessSettings = {
  id: "",
  company_name: "",
  owner_name: "",
  phone: "",
  email: "",
  city: "",
  address: "",
  legal_note:
    "El precio indicado es una estimación basada en la información facilitada. Puede ajustarse tras visita técnica o cambios en el alcance del trabajo.",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings>(emptySettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadSettings() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        throw error;
      }

      setSettings(data as BusinessSettings);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error cargando ajustes"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSettings() {
    try {
      setIsSaving(true);
      setMessage("");
      setErrorMessage("");

      const { error } = await supabase
        .from("business_settings")
        .update({
          company_name: settings.company_name,
          owner_name: settings.owner_name,
          phone: settings.phone,
          email: settings.email,
          city: settings.city,
          address: settings.address,
          legal_note: settings.legal_note,
        })
        .eq("id", settings.id);

      if (error) {
        throw error;
      }

      setMessage("Ajustes guardados correctamente.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error guardando ajustes"
      );
    } finally {
      setIsSaving(false);
    }
  }

  function updateField(field: keyof BusinessSettings, value: string) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-zinc-500">
              Configuración
            </p>
            <h1 className="text-4xl font-black">Ajustes</h1>
          </div>

          <a
            href="/dashboard"
            className="rounded-2xl border px-5 py-3 text-center font-semibold"
          >
            Volver al dashboard
          </a>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Datos del negocio</h2>

          {isLoading && (
            <p className="mt-5 text-zinc-500">Cargando ajustes...</p>
          )}

          {!isLoading && (
            <>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Nombre del negocio"
                  value={settings.company_name || ""}
                  onChange={(event) =>
                    updateField("company_name", event.target.value)
                  }
                />

                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Responsable"
                  value={settings.owner_name || ""}
                  onChange={(event) =>
                    updateField("owner_name", event.target.value)
                  }
                />

                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Teléfono"
                  value={settings.phone || ""}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                />

                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Email"
                  value={settings.email || ""}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                />

                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Ciudad"
                  value={settings.city || ""}
                  onChange={(event) =>
                    updateField("city", event.target.value)
                  }
                />

                <input
                  className="rounded-2xl border px-4 py-3"
                  placeholder="Dirección"
                  value={settings.address || ""}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                />

                <textarea
                  className="rounded-2xl border px-4 py-3 md:col-span-2"
                  placeholder="Nota legal del presupuesto"
                  rows={4}
                  value={settings.legal_note || ""}
                  onChange={(event) =>
                    updateField("legal_note", event.target.value)
                  }
                />
              </div>

              <button
                type="button"
                onClick={saveSettings}
                disabled={isSaving}
                className="mt-6 rounded-2xl bg-zinc-950 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Guardando..." : "Guardar ajustes"}
              </button>
            </>
          )}

          {message && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}