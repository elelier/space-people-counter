import { PersonasEnEspacio } from "@/components/PersonasEnEspacio";
import { MisionesActivas } from "@/components/MisionesActivas";
import { ISSMap } from "@/components/ISSMap";
import { SpaceStationsInfo } from "@/components/SpaceStationsInfo";
import { SimpleNavbar } from "@/components/SimpleNavbar";
import { SimpleHistoricalData } from "@/components/SimpleHistoricalData";
import { SpaceData } from "@/services/spaceApi";
// Removed KofiButton import

// Forzar dynamic rendering para la página principal
export const dynamic = 'force-dynamic';

// Datos iniciales para hidratar el componente
const initialData: SpaceData = {
  message: "success",
  number: 12,
  people: [
    { craft: "ISS", name: "Oleg Kononenko" },
    { craft: "ISS", name: "Nikolai Chub" },
    { craft: "ISS", name: "Tracy Caldwell Dyson" },
    { craft: "ISS", name: "Matthew Dominick" },
    { craft: "ISS", name: "Michael Barratt" },
    { craft: "ISS", name: "Jeanette Epps" },
    { craft: "ISS", name: "Alexander Grebenkin" },
    { craft: "ISS", name: "Butch Wilmore" },
    { craft: "ISS", name: "Sunita Williams" },
    { craft: "Tiangong", name: "Li Guangsu" },
    { craft: "Tiangong", name: "Li Cong" },
    { craft: "Tiangong", name: "Ye Guangfu" }
  ]
};

export default function Home() {
  return (
    <main>
      <SimpleNavbar />
      <div className="pt-24 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 sm:gap-12">
        {/* Elemento invisible para el enlace "Inicio" con el id "top" */}
        <div id="top" className="scroll-mt-20"></div>

        {/* Contador de personas en el espacio */}
        <PersonasEnEspacio initialData={initialData} />

        {/* Sección de Misiones Activas con el ID para navegación */}
        <div id="misiones" className="scroll-mt-20">
          <MisionesActivas astronautas={initialData} />
        </div>

        {/* Mapa de la ISS */}
        <div id="estaciones" className="scroll-mt-20">
          <ISSMap />
        </div>

        {/* Información adicional */}
        <div id="info" className="scroll-mt-20">
          <SpaceStationsInfo />
        </div>

        {/* Historial de astronautas en el espacio */}
        <div id="historial" className="scroll-mt-20">
          <SimpleHistoricalData />
        </div>
      </div>

      {/* Footer con atribución actualizada */}
      <div className="py-8 border-t border-opacity-20 border-blue-400 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p key="footer-credit" className="text-gray-300 text-sm">
            © 2025 Space People Counter | Desarrollado por <a href="https://www.elelier.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline transition-colors">elelier</a> con ❤️ para explorar el espacio
          </p>
          <div className="flex justify-center mt-4">
            {/* Direct Ko-fi button without component */}
            <a
              href="https://ko-fi.com/spacepeoplecounter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#2F2C7D] text-white py-3 px-6 rounded-md transition-all duration-300 hover:bg-[#413B9F] hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative w-5 h-5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
              </div>
              <span className="font-medium">Combustible para la Misión</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
