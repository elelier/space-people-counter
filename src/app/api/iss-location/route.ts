import { NextResponse } from "next/server";
import { getISSLocation, ISSLocationData } from "@/services/issLocationApi";

// Variables de caché
let cachedData: ISSLocationData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 60 segundos

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentTime = Date.now();

    // Si los datos están en caché y no han expirado, los devolvemos
    if (cachedData && (currentTime - lastFetchTime) < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Si no, hacemos una nueva solicitud
    const data = await getISSLocation();

    if (data.message === "error") {
      // Si hay error pero tenemos datos en caché, devolvemos los datos en caché
      if (cachedData) {
        return NextResponse.json(cachedData);
      }
      throw new Error("Error al obtener datos de la API externa");
    }

    // Actualizamos la caché
    cachedData = data;
    lastFetchTime = currentTime;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en el endpoint de la API para la ubicación de la ISS:", error);
    
    // Si hay error pero tenemos datos en caché, devolvemos los datos en caché
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    return NextResponse.json(
      {
        error: "Error al obtener la ubicación de la ISS",
        message: "error",
        timestamp: Date.now(),
        iss_position: {
          latitude: "0",
          longitude: "0"
        }
      },
      { status: 500 }
    );
  }
}