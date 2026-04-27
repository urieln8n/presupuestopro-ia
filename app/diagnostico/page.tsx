"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function DiagnosticoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [serviceInterest, setServiceInterest] = useState("premium");
  const [message, setMessage] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function submitRequest() {
    try {
      setIsSending(true);
      setSuccessMessage("");
      setErrorMessage("");

      if (!name.trim()) {
        throw new Error("Introduce tu nombre.");
      }

      if (!email.trim()) {
        throw new Error("Introduce tu email.");
      }

      const { error } = await supabase.from("premium_requests").insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        business_name: businessName.trim(),
        website: website.trim(),
        service_interest: serviceInterest,
        message: message.trim(),
        status: "new",
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "Solicitud enviada correctamente. Te contactaremos para revisar tu caso."
      );

      setName("");
      setEmail("");
      setPhone("");
      setBusinessName("");
      setWebsite("");
      setServiceInterest("premium");
      setMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error enviando solicitud"
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <a href="/" className="min-w-0">
            <p className="text-lg font-black">PresupuestoPro IA</p>
            <p className="mt-1 text-sm text-zinc-400">
              Diagnóstico, automatizaciones y setup premium
            </p>
          </a>

          <div className="flex gap-3">
            <a
              href="/"
              className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold"
            >
              Volver
            </a>

            <a
              href="/register"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-zinc-950"
            >
              Crear cuenta
            </a>
          </div>
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-300">
              Solicitud Premium
            </p>

            <h1 className="mt-6 text-balance text-4xl font-black leading-tight sm:text-6xl">
              Solicita un diagnóstico para mejorar tu sistema comercial.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Revisamos tu negocio, tu web, tus servicios y tus procesos para
              detectar cómo PresupuestoPro IA, automatizaciones y una mejor
              estructura digital pueden ayudarte a vender con más orden y menos
              trabajo manual.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xl font-black">Auditoría web</p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Revisamos claridad, propuesta de valor, captación y puntos de
                  fuga.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xl font-black">Automatizaciones</p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Detectamos tareas repetitivas que pueden automatizarse.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xl font-black">Setup Premium</p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Configuramos datos, servicios, plantillas y flujo comercial.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xl font-black">Sistema comercial</p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Ordenamos presupuestos, clientes, seguimiento y contacto.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 text-zinc-950 shadow-2xl">
            <p className="text-sm font-semibold text-zinc-500">
              Cuéntanos tu caso
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Solicitar diagnóstico
            </h2>

            <p className="mt-3 leading-7 text-zinc-600">
              Completa el formulario y revisaremos qué plan o setup encaja
              mejor con tu negocio.
            </p>

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
                {successMessage}
              </div>
            )}

            <div className="mt-6 grid gap-4">
              <input
                className="rounded-2xl border px-4 py-3"
                placeholder="Nombre"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <input
                type="email"
                className="rounded-2xl border px-4 py-3"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <input
                className="rounded-2xl border px-4 py-3"
                placeholder="Teléfono / WhatsApp"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />

              <input
                className="rounded-2xl border px-4 py-3"
                placeholder="Nombre del negocio"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
              />

              <input
                className="rounded-2xl border px-4 py-3"
                placeholder="Web o Instagram del negocio"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />

              <select
                className="rounded-2xl border px-4 py-3"
                value={serviceInterest}
                onChange={(event) => setServiceInterest(event.target.value)}
              >
                <option value="premium">Plan Premium</option>
                <option value="setup_pro">Setup Pro</option>
                <option value="automation">Automatizaciones comerciales</option>
                <option value="audit">Auditoría web/operativa</option>
                <option value="custom">Proyecto personalizado</option>
              </select>

              <textarea
                className="min-h-32 rounded-2xl border px-4 py-3"
                placeholder="Cuéntanos qué necesitas mejorar..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />

              <button
                type="button"
                onClick={submitRequest}
                disabled={isSending}
                className="rounded-2xl bg-zinc-950 px-5 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>

            <p className="mt-5 text-sm leading-6 text-zinc-500">
              No es una compra automática. Primero revisamos tu caso y te
              recomendamos el plan, setup o automatización más adecuada.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}