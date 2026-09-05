import Image from "next/image";
import { Info, MapPin, Users } from "lucide-react";

const links = [
  { href: "#misiones", label: "Personas" },
  { href: "#estaciones", label: "ISS" },
  { href: "#info", label: "Cómo sabemos" },
];

export function SimpleNavbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-blue-900/50 bg-slate-950/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2 text-lg font-bold text-white" aria-label="Ir al inicio">
          <Image
            src="/images/icons/icons8-space-shuttle-100.png"
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
          />
          <span>Space People</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-blue-900/40 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <a href="#misiones" className="rounded-md p-2 text-slate-200 hover:bg-blue-900/40" aria-label="Ver quiénes están arriba">
            <Users className="h-5 w-5" aria-hidden="true" />
          </a>
          <a href="#estaciones" className="rounded-md p-2 text-slate-200 hover:bg-blue-900/40" aria-label="Ver ubicación de la ISS">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </a>
          <a href="#info" className="rounded-md p-2 text-slate-200 hover:bg-blue-900/40" aria-label="Ver cómo calculamos el dato">
            <Info className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </nav>
  );
}
