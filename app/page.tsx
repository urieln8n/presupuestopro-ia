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

const steps = [
  {
    number: "01",
    title: "Elige el servicio",
    description:
      "Selecciona una plantilla para reforma, limpieza, pintura, mantenimiento u otro servicio profesional.",
  },
  {
    number: "02",
    title: "Completa los datos",
    description:
      "Añade cliente, metros, dificultad, urgencia y detalles del trabajo. La IA usa esa información para generar la propuesta.",
  },
  {
    number: "03",
    title: "Genera y envía",
    description:
      "Obtén un presupuesto profesional con partidas, precio, mensaje para WhatsApp y PDF listo para compartir.",
  },
];

const plans = [
  {
    name: "Free",
    price: "0 €",
    setup: "Sin setup inicial",
    subtitle: "Para probar la herramienta",
    description:
      "Ideal para validar el flujo, crear los primeros presupuestos y entender cómo puede ayudarte la plataforma.",
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
    setup: "Setup opcional desde 49 €",
    subtitle: "Para autónomos y negocios activos",
    description:
      "Para negocios que quieren trabajar con clientes reales, ahorrar tiempo y presentar presupuestos profesionales.",
    features: [
      "Presupuestos con IA",
      "Presupuestos ilimitados",
      "CRM de clientes",
      "PDF profesional",
      "WhatsApp integrado",
      "Edición de presupuesto, cliente y partidas",
      "Dashboard comercial",
      "Configuración inicial opcional",
    ],
    cta: "Empezar con Pro",
    href: "/register",
    featured: true,
  },
  {
    name: "Premium",
    price: "Desde 79 €/mes",
    setup: "Setup personalizado desde 199 €",
    subtitle: "Para negocios que quieren automatizar",
    description:
      "Para empresas que quieren una puesta en marcha profesional, automatizaciones, auditoría y acompañamiento inicial.",
    features: [
      "Todo lo incluido en Pro",
      "Auditoría web y operativa",
      "Automatizaciones comerciales",
      "Configuración personalizada",
      "Plantillas adaptadas al negocio",
      "Flujos de captación y seguimiento",
      "Soporte prioritario",
    ],
    cta: "Solicitar diagnóstico",
    href: "/diagnostico",
    featured: false,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/85 px-5 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5">
          <a href="/" className="min-w-0">
            <p className="text-base font-black sm:text-lg">PresupuestoPro IA</p>
            <p className="hidden text-xs text-zinc-400 sm:block">
              Presupuestos, CRM y automatizaciones
            </p>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-zinc-300 lg:flex">
            <a href="#servicios" className="transition hover:text-white">
              Servicios
            </a>
            <a href="#como-funciona" className="transition hover:text-white">
              Cómo funciona
            </a>
            <a href="#planes" className="transition hover:text-white">
              Planes
            </a>
            <a href="#premium" className="transition hover:text-white">
              Premium
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <a
              href="/login"
              className="hidden rounded-2xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-zinc-950 sm:inline-block"
            >
              Iniciar sesión
            </a>

            <a
              href="/register"
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-zinc-200"
            >
              Crear cuenta
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-10 sm:px-6 lg:py-14">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
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

            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-zinc-400">
              Diseñado para negocios de reformas, limpieza, mantenimiento y
              servicios locales que necesitan responder mejor y cerrar más
              oportunidades.
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

      {/* PROBLEMA */}
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

      {/* SERVICIOS */}
      <section
        id="servicios"
        className="border-t border-white/10 bg-zinc-950 px-5 py-20 sm:px-6"
      >
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

      {/* COMO FUNCIONA */}
      <section
        id="como-funciona"
        className="border-t border-white/10 bg-zinc-900 px-5 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-zinc-400">
              Cómo funciona
            </p>

            <h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-5xl">
              De solicitud a presupuesto profesional en pocos pasos.
            </h2>

            <p className="mt-5 leading-8 text-zinc-300">
              La plataforma está pensada para que cualquier negocio pueda
              responder rápido sin perder calidad comercial.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6"
              >
                <p className="text-sm font-black text-zinc-500">
                  {step.number}
                </p>

                <h3 className="mt-4 text-2xl font-black">{step.title}</h3>

                <p className="mt-4 leading-7 text-zinc-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCIA */}
      <section className="border-t border-white/10 bg-zinc-950 px-5 py-20 sm:px-6">
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

      {/* PLANES */}
      <section
        id="planes"
        className="border-t border-white/10 bg-zinc-900 px-5 py-20 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-zinc-400">
              Planes y precios
            </p>

            <h2 className="mt-3 text-balance text-3xl font-black leading-tight sm:text-5xl">
              Una plataforma profesional con puesta en marcha adaptada a tu
              negocio.
            </h2>

            <p className="mt-5 leading-8 text-zinc-300">
              La mensualidad cubre el uso continuo de la plataforma. El setup
              inicial cubre configuración, ajustes, plantillas, textos y puesta
              en marcha para que el negocio empiece correctamente.
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

                <div
                  className={`mt-4 rounded-2xl p-4 ${
                    plan.featured
                      ? "bg-zinc-100 text-zinc-700"
                      : "border border-white/10 bg-white/5 text-zinc-300"
                  }`}
                >
                  <p className="text-sm font-black">Setup inicial</p>
                  <p className="mt-1 text-sm font-semibold">{plan.setup}</p>
                </div>

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

          <div
            id="premium"
            className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center"
          >
            <p className="text-sm font-black uppercase tracking-widest text-zinc-400">
              Cómo funciona el setup
            </p>

            <p className="mt-4 leading-8 text-zinc-300">
              El setup es un pago único para dejar la plataforma preparada según
              el negocio: datos de empresa, servicios, plantillas, textos, flujo
              de presupuestos, automatizaciones iniciales y revisión de
              oportunidades. En Free no es necesario. En Pro puede contratarse
              si el cliente quiere ayuda. En Premium forma parte de una puesta
              en marcha más personalizada.
            </p>
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-7 text-zinc-500">
            Los precios pueden ajustarse según uso, país, volumen de
            presupuestos o configuración personalizada. El plan Premium puede
            incluir implementación, automatizaciones y auditoría según necesidad
            del negocio.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
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