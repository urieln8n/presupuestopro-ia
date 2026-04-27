"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function login() {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      window.location.href = "/dashboard";
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error iniciando sesión"
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

        <h1 className="mt-2 text-3xl font-black">Iniciar sesión</h1>

        <p className="mt-2 text-zinc-500">
          Accede a tu panel para gestionar presupuestos.
        </p>

        <div className="mt-8 space-y-4">
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
            onClick={login}
            disabled={isLoading}
            className="w-full rounded-2xl bg-zinc-950 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <p className="text-center text-sm text-zinc-500">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="font-semibold text-zinc-950">
              Crear cuenta
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}