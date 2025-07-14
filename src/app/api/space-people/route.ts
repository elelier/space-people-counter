import { NextResponse } from "next/server";
import { getPeopleInSpace } from "@/services/spaceApi";

export const dynamic = 'force-dynamic'; // No cachear

export async function GET() {
  try {
    const data = await getPeopleInSpace();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en el endpoint de la API:", error);
    
    // Enviar datos de respaldo en caso de error con un estado HTTP 503
    return NextResponse.json({
      number: 12,
      message: "error - using fallback data",
      people: [
        { name: "Oleg Kononenko", craft: "ISS" },
        { name: "Nikolai Chub", craft: "ISS" },
        { name: "Tracy Caldwell Dyson", craft: "ISS" },
        { name: "Matthew Dominick", craft: "ISS" },
        { name: "Michael Barratt", craft: "ISS" },
        { name: "Jeanette Epps", craft: "ISS" },
        { name: "Alexander Grebenkin", craft: "ISS" },
        { name: "Butch Wilmore", craft: "ISS" },
        { name: "Sunita Williams", craft: "ISS" },
        { name: "Li Guangsu", craft: "Tiangong" },
        { name: "Li Cong", craft: "Tiangong" },
        { name: "Ye Guangfu", craft: "Tiangong" }
      ]
    }, { status: 503 });
  }
}
