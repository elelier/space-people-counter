import { SpacePeopleExperience } from "@/components/SpacePeopleExperience";
import { ISSMap } from "@/components/ISSMap";
import { SimpleNavbar } from "@/components/SimpleNavbar";
import { SimpleHistoricalData } from "@/components/SimpleHistoricalData";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { StructuredData } from "@/components/StructuredData";
import { Card } from "@/components/ui/card";
import { Database, RefreshCcw, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main>
      <GoogleAnalytics />
      <StructuredData />
      <SimpleNavbar />

      <div className="container mx-auto flex flex-col gap-12 px-4 pb-20 pt-24 sm:px-6 sm:gap-16 lg:px-8">
        <div id="top" className="scroll-mt-24" />

        <SpacePeopleExperience />

        <section id="estaciones" className="scroll-mt-24" aria-labelledby="iss-title">
          <div className="mx-auto mb-5 w-full max-w-5xl text-center sm:text-left">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">En órbita</p>
            <h2 id="iss-title" className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              ¿Dónde está la ISS ahora?
            </h2>
          </div>
          <ISSMap />
        </section>

        <section id="info" className="scroll-mt-24" aria-labelledby="how-we-know-title">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-6 text-center sm:text-left">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">Transparencia</p>
              <h2 id="how-we-know-title" className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Cómo sabemos este número
              </h2>
              <p className="mt-2 max-w-3xl text-slate-300">
                La página consulta fuentes públicas de datos espaciales y deja visible cuando tiene que usar información de respaldo.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-blue-900/70 bg-slate-950/70 p-5">
                <Database className="h-5 w-5 text-blue-400" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-white">Fuentes públicas</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Consultamos fuentes abiertas de datos espaciales para conocer las personas en misiones orbitales activas.
                </p>
              </Card>
              <Card className="border-blue-900/70 bg-slate-950/70 p-5">
                <ShieldCheck className="h-5 w-5 text-blue-400" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-white">Normalización y verificación</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Los registros se normalizan, validan y deduplican antes de construir el conteo que ves arriba.
                </p>
              </Card>
              <Card className="border-blue-900/70 bg-slate-950/70 p-5">
                <RefreshCcw className="h-5 w-5 text-blue-400" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-white">Fallback visible</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Si las fuentes en vivo fallan, mostramos un respaldo y lo marcamos explícitamente para no hacerlo pasar por dato live.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24" aria-labelledby="faq-title">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-6 text-center sm:text-left">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">Preguntas frecuentes</p>
              <h2 id="faq-title" className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Lo esencial sobre el conteo
              </h2>
            </div>

            <div className="divide-y divide-blue-900/60 rounded-2xl border border-blue-900/70 bg-slate-950/60 px-5 sm:px-7">
              <article className="py-5">
                <h3 className="font-semibold text-white">¿Qué cuenta como una persona “en el espacio”?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Actualmente contamos personas en órbita terrestre en estaciones o misiones orbitales activas. Los vuelos suborbitales quedan fuera del conteo.
                </p>
              </article>
              <article className="py-5">
                <h3 className="font-semibold text-white">¿Cada cuánto se actualiza?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  La app consulta periódicamente sus fuentes y actualiza el conteo cuando hay datos nuevos. También puedes pedir una actualización manual desde el contador.
                </p>
              </article>
              <article className="py-5">
                <h3 className="font-semibold text-white">¿Por qué puede cambiar el número?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Principalmente por lanzamientos, retornos de tripulaciones y cambios de misión.
                </p>
              </article>
            </div>
          </div>
        </section>

        <div id="historial" className="scroll-mt-24">
          <SimpleHistoricalData />
        </div>
      </div>

      <footer className="border-t border-blue-900/40 bg-black/30 py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-300">
            © 2026 Space People Counter · Desarrollado por{" "}
            <a
              href="https://www.elelier.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline transition-colors hover:text-blue-300"
            >
              elelier
            </a>
          </p>
          <a
            href="https://ko-fi.com/spacepeoplecounter"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center rounded-md border border-blue-500/40 px-4 py-2 text-sm font-medium text-blue-100 transition-colors hover:bg-blue-900/40"
          >
            Apoya Space People
          </a>
        </div>
      </footer>
    </main>
  );
}
