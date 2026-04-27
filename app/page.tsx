const services = [
  {
    title: "Presupuestos con IA",
    description:
      "Genera presupuestos profesionales con texto comercial, partidas, precio estimado, PDF y mensaje para WhatsApp.",
  },
  {
    title: "CRM de clientes",
    description:
      "Guarda clientes, consulta su historial, revisa presupuestos asociados y mantén el seguimiento comercial organizado.",
  },
  {
    title: "Automatizaciones comerciales",
    description:
      "Automatiza formularios, respuestas, seguimiento de presupuestos, captación de leads y tareas repetitivas.",
  },
  {
    title: "Auditoría web y operativa",
    description:
      "Analiza tu web, tus procesos y tus oportunidades de mejora para vender más y trabajar con menos fricción.",
  },
];

const audiences = [
  "Reformas",
  "Limpieza profesional",
  "Terminación de obra",
  "Mantenimiento",
  "Servicios locales",
  "Autónomos",
  "Pequeñas empresas",
  "Emprendedores",
];

const problems = [
  "Tardas demasiado en responder presupuestos.",
  "Calculas precios a ojo y pierdes margen.",
  "Tus clientes quedan repartidos entre WhatsApp, notas y Excel.",
  "Tu web no convierte visitas en oportunidades reales.",
  "Repites tareas que podrían automatizarse.",
];

const plans = [
  {
    name: "Free",
    price: "0 €",
    subtitle: "Para probar la herramienta",
    description:
      "Ideal para empezar, validar el flujo y crear tus primeros presupuestos profesionales.",
    features: [
      "Presupuestos limitados",
      "Plantillas básicas",
      "Historial de presupuestos",
      "Clientes guardados",
      "Mensaje para WhatsApp",
    ],
    cta: "Crear cuenta gratis",
    href: "/register",
    featured: false,
  },
  {
    name: "Pro",
    price: "19 €/mes",
    subtitle: "Para autónomos y negocios activos",
    description:
      "El plan recomendado para trabajar con clientes reales, ahorrar tiempo y enviar propuestas profesionales.",
    features: [
      "Presupuestos con IA",
      "Presupuestos ilimitados",
      "CRM de clientes",
      "PDF profesional",
      "WhatsApp integrado",
      "Edición de presupuesto, cliente y partidas",
      "Dashboard comercial",
    ],
    cta: "Empezar con Pro",
    href: "/register",
    featured: true,
  },
  {
    name: "Premium",
    price: "Desde 79 €/mes",
    subtitle: "Para negocios que quieren automatizar",
    description:
      "Para empresas que quieren acompañamiento, automatizaciones comerciales y mejora de su sistema digital.",
    features: [
      "Todo lo incluido en Pro",
      "Auditoría web y operativa",
      "Automatizaciones comerciales",
      "Configuración personalizada",
      "Flujos de captación y seguimiento",
      "Soporte prioritario",
    ],
    cta: "Solicitar Premium",
    href: "/register",
    featured: false,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-6 sm:py-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-lg font-black">PresupuestoPro IA</p>
            <p className="mt-1 max-w-xs text-sm leading-6 text-zinc-400 sm:max-w-none">
              Presupuestos, clientes y automatizaciones para negocios de
              servicios
            </p>
          </div>

          <div className="grid gap-3 sm:flex sm:flex-row">
            <a
              href="/login"
              className="rounded-2xl border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white hover:text-zinc-950"
            >
              Iniciar sesión
            </a>

            <a
              href="/register"
              className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
              Crear cuenta
            </a>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="min-w-0">
            <p className="mb-5 inline-flex max-w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold leading-6 text-zinc-300">
              Para autónomos, emprendedores y pequeños negocios
            </p>

            <h1 className="max-w-4xl text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Presupuestos, clientes y automatizaciones con IA para vender más
              rápido.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
              Crea presupuestos profesionales en minutos, organiza tus clientes,
              envía propuestas por WhatsApp y detecta oportunidades de mejora en
              tu web y procesos comerciales.
            </p>

            <div className="mt-8 grid gap-3 sm:flex sm:flex-row">
              <a
                href="/register"
                className="rounded-2xl bg-white px-6 py-4 text-center font-bold text-zinc-950 transition hover:bg-zinc-200"
              >
                Empezar ahora
              </a>

              <a
                href="#planes"
                className="rounded-2xl border border-white/20 px-6 py-4 text-center font-bold text-white transition hover:bg-white hover:text-zinc-950"
              >
                Ver planes
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-black">60s</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Presupuestos listos en menos tiempo.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-black">IA</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Textos comerciales y partidas inteligentes.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-black">CRM</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Clientes, historial y seguimiento.
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl sm:p-6">
            <div className="rounded-[1.5rem] bg-white p-5 text-zinc-950 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-zinc-500">
                    Presupuesto generado
                  </p>

                  <h2 className="mt-2 text-2xl font-black leading-tight">
                    Reforma de baño + limpieza final
                  </h2>
                </div>

                <div className="w-fit rounded-2xl bg-green-100 px-3 py-2 text-xs font-bold text-green-700">
                  IA
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-zinc-600 sm:text-base">
                Propuesta profesional para reforma de baño, incluyendo
                preparación, trabajos principales, acabados y limpieza final del
                espacio.
              </p>

              <div className="mt-6 rounded-3xl bg-zinc-100 p-5">
                <p className="text-sm text-zinc-500">Total estimado</p>
                <p className="mt-2 text-4xl font-black">3.349 €</p>
                <p className="mt-2 text-sm font-semibold text-zinc-500">
                  Validez: 7 días
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border p-4">
                  <p className="font-bold">Demolición y preparación</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Retirada de elementos existentes y preparación del espacio.
                  </p>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="font-bold">Trabajos de reforma</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Ejecución principal según alcance indicado.
                  </p>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="font-bold">Limpieza final</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Entrega del espacio limpio y preparado para uso.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-zinc-950 px-5 py-3 text-center text-sm font-bold text-white">
                  Enviar WhatsApp
                </div>

                <div className="rounded-2xl border px-5 py-3 text-center text-sm font-bold">
                  Descargar PDF
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-zinc-900 px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold text-zinc-400">
                El problema real
              </p>

              <h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-4xl">
                Muchos negocios pierden clientes por responder tarde o trabajar
                desordenados.
              </h2>

              <p className="mt-5 leading-8 text-zinc-300">
                No necesitas una herramienta complicada. Necesitas responder
                rápido, presupuestar mejor, guardar clientes y automatizar las
                tareas que te quitan tiempo.
              </p>
            </div>

            <div className="grid gap-3">
              {problems.map((problem) => (
                <div
                  key={problem}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="font-semibold leading-7 text-zinc-200">
                    {problem}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-zinc-950 px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-zinc-400">
              Una plataforma práctica
            </p>

            <h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-4xl">
              El centro operativo para vender y trabajar mejor.
            </h2>

            <p className="mt-5 leading-8 text-zinc-300">
              PresupuestoPro IA empieza con presupuestos inteligentes, pero está
              pensada para convertirse en un sistema completo para autónomos y
              pequeños negocios.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-2xl font-black leading-tight">
                  {service.title}
                </h3>
                <p className="mt-4 leading-7 text-zinc-400">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-zinc-900 px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-semibold text-zinc-400">
                Para quién es
              </p>

              <h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-4xl">
                Ideal para negocios que venden servicios y necesitan responder
                rápido.
              </h2>

              <p className="mt-5 leading-8 text-zinc-300">
                Especialmente útil para empresas que reciben solicitudes por
                WhatsApp, llamadas, formularios web o recomendaciones.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {audiences.map((audience) => (
                <div
                  key={audience}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-200"
                >
                  {audience}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 text-zinc-950">
              <p className="text-sm font-semibold text-zinc-500">
                Producto principal
              </p>
              <h3 className="mt-2 text-2xl font-black">Presupuestos IA</h3>
              <p className="mt-4 leading-7 text-zinc-600">
                Plantillas inteligentes, cálculo, PDF, WhatsApp, edición y
                seguimiento comercial.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-zinc-400">
                Servicio complementario
              </p>
              <h3 className="mt-2 text-2xl font-black">Automatizaciones</h3>
              <p className="mt-4 leading-7 text-zinc-400">
                Formularios, respuestas, captación, seguimiento y procesos
                repetitivos conectados a tu negocio.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold text-zinc-400">
                Diagnóstico
              </p>
              <h3 className="mt-2 text-2xl font-black">Auditoría web</h3>
              <p className="mt-4 leading-7 text-zinc-400">
                Revisión de web, embudo, comunicación, automatizaciones y puntos
                de mejora para convertir mejor.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="planes"
        className="border-t border-white/10 bg-zinc-950 px-5 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-zinc-400">
              Planes y precios
            </p>

            <h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-5xl">
              Empieza gratis y escala cuando tu negocio lo necesite.
            </h2>

            <p className="mt-5 leading-8 text-zinc-300">
              PresupuestoPro IA está pensado para crecer contigo: primero
              presupuestos, después clientes, automatizaciones y mejora de tu
              sistema comercial.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-[2rem] p-6 ${
                  plan.featured
                    ? "bg-white text-zinc-950 shadow-2xl"
                    : "border border-white/10 bg-white/5 text-white"
                }`}
              >
                {plan.featured && (
                  <div className="mb-5 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
                    Recomendado
                  </div>
                )}

                <p
                  className={`text-sm font-semibold ${
                    plan.featured ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  {plan.subtitle}
                </p>

                <h3 className="mt-2 text-3xl font-black">{plan.name}</h3>

                <p className="mt-4 text-4xl font-black">{plan.price}</p>

                <p
                  className={`mt-4 leading-7 ${
                    plan.featured ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  {plan.description}
                </p>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex gap-3">
                      <span
                        className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                          plan.featured
                            ? "bg-zinc-950 text-white"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        ✓
                      </span>

                      <p
                        className={`text-sm leading-6 ${
                          plan.featured ? "text-zinc-700" : "text-zinc-300"
                        }`}
                      >
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>

                <a
                  href={plan.href}
                  className={`mt-8 block rounded-2xl px-5 py-4 text-center font-bold ${
                    plan.featured
                      ? "bg-zinc-950 text-white"
                      : "border border-white/20 text-white transition hover:bg-white hover:text-zinc-950"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-7 text-zinc-500">
            Los precios pueden ajustarse según uso, país, volumen de
            presupuestos o configuración personalizada. El plan Premium puede
            incluir implementación, automatizaciones y auditoría según necesidad
            del negocio.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 bg-zinc-950 px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[2rem] bg-white p-6 text-zinc-950 sm:p-8 md:flex md:items-center md:justify-between md:p-10">
            <div>
              <p className="text-sm font-semibold text-zinc-500">
                Empieza por lo más importante
              </p>

              <h2 className="mt-2 text-balance text-3xl font-black leading-tight sm:text-4xl">
                Crea tu primer presupuesto profesional hoy.
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
                Después podrás organizar clientes, mejorar tu seguimiento y
                avanzar hacia automatizaciones comerciales y auditoría web.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:flex sm:flex-row md:mt-0">
              <a
                href="/register"
                className="rounded-2xl bg-zinc-950 px-6 py-4 text-center font-bold text-white"
              >
                Crear cuenta
              </a>

              <a
                href="#planes"
                className="rounded-2xl border px-6 py-4 text-center font-bold"
              >
                Ver planes
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}