"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function register() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      if (!companyName.trim()) {
        throw new Error("Añade el nombre del negocio.");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const userId = data.user?.id;

      if (!userId) {
        throw new Error("No se pudo crear el usuario.");
      }

      const { error: settingsError } = await supabase
  .from("business_settings")
  .insert({
    id_usuario: userId,
    company_name: companyName,
    owner_name: ownerName,
    email,
  });

if (settingsError) {
  console.error("Error creando business_settings:", settingsError);
  throw new Error(settingsError.message);
}

window.location.href = "/dashboard";
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error creando cuenta"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-zinc-500">
          PresupuestoPro IA
        </p>

        <h1 className="mt-2 text-3xl font-black">Crear cuenta</h1>

        <p className="mt-2 text-zinc-500">
          Crea tu cuenta para empezar a generar presupuestos.
        </p>

        <div className="mt-8 space-y-4">
          <input
            className="w-full rounded-2xl border px-4 py-3"
            placeholder="Nombre del negocio"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
          />

          <input
            className="w-full rounded-2xl border px-4 py-3"
            placeholder="Responsable"
            value={ownerName}
            onChange={(event) => setOwnerName(event.target.value)}
          />

          <input
            type="email"
            className="w-full rounded-2xl border px-4 py-3"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <input
            type="password"
            className="w-full rounded-2xl border px-4 py-3"
            placeholder="Contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button
            type="button"
            onClick={register}
            disabled={isLoading}
            className="w-full rounded-2xl bg-zinc-950 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <p className="text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="font-semibold text-zinc-950">
              Iniciar sesión
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}