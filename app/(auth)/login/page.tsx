export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black">Iniciar sesión</h1>
        <p className="mt-2 text-zinc-500">
          Accede a tu panel de PresupuestoPro IA.
        </p>

        <form className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Email</label>
            <input
              type="email"
              className="w-full rounded-2xl border px-4 py-3"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-2xl border px-4 py-3"
              placeholder="********"
            />
          </div>

          <button className="w-full rounded-2xl bg-zinc-950 px-4 py-3 font-semibold text-white">
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}