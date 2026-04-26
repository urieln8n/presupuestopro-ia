export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <p className="mb-4 text-sm font-semibold text-zinc-400">
          PresupuestoPro IA
        </p>

        <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
          Presupuestos profesionales para reformas y limpiezas en 60 segundos
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
          Automatiza la creación de presupuestos, envíalos por WhatsApp o PDF
          y haz seguimiento de cada cliente desde un solo panel.
        </p>

        <div className="mt-8 flex gap-4">
          <a
            href="/register"
            className="rounded-2xl bg-white px-6 py-3 font-semibold text-zinc-950"
          >
            Crear cuenta
          </a>

          <a
            href="/login"
            className="rounded-2xl border border-white/20 px-6 py-3 font-semibold text-white"
          >
            Iniciar sesión
          </a>
        </div>
      </section>
    </main>
  );
}