// Datos detallados sobre misiones espaciales

export interface MissionDetailedData {
  id: string;
  name: string;
  craft: string;
  role: string;
  nationality: string;
  mission_start: string;
  mission_end?: string;
  mission_duration: string;
  mission_name: string;
  mission_patch?: string;
  mission_description: string;
  mission_objectives: string[];
  agency: string;
  agency_logo?: string;
  progress: number;
}

// Mapa de información detallada por nombre de astronauta
export const missionDetailsMap: Record<string, MissionDetailedData> = {
  "Oleg Kononenko": {
    id: "ok1",
    name: "Oleg Kononenko",
    craft: "ISS",
    role: "Comandante",
    nationality: "Rusia",
    mission_start: "2023-09-15",
    mission_duration: "12 meses",
    mission_name: "Expedición 70/71",
    mission_description: "Misión de larga duración a bordo de la Estación Espacial Internacional",
    mission_objectives: [
      "Experimentos científicos en microgravedad",
      "Mantenimiento de sistemas de la estación",
      "Supervisión de operaciones de la tripulación rusa"
    ],
    agency: "Roscosmos",
    agency_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Roscosmos_logo_ru.svg/320px-Roscosmos_logo_ru.svg.png",
    progress: 65
  },
  "Nikolai Chub": {
    id: "nc1",
    name: "Nikolai Chub",
    craft: "ISS",
    role: "Ingeniero de Vuelo",
    nationality: "Rusia",
    mission_start: "2023-09-15",
    mission_duration: "12 meses",
    mission_name: "Expedición 70/71",
    mission_description: "Primera misión espacial, centrada en experimentos científicos y mantenimiento",
    mission_objectives: [
      "Experimentos biológicos",
      "Apoyo en caminatas espaciales",
      "Mantenimiento del segmento ruso"
    ],
    agency: "Roscosmos",
    agency_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Roscosmos_logo_ru.svg/320px-Roscosmos_logo_ru.svg.png",
    progress: 65
  },
  "Tracy Caldwell Dyson": {
    id: "tcd1",
    name: "Tracy Caldwell Dyson",
    craft: "ISS",
    role: "Ingeniera de Vuelo",
    nationality: "Estados Unidos",
    mission_start: "2024-03-03",
    mission_duration: "6 meses",
    mission_name: "Expedición 70/71",
    mission_description: "Tercera misión espacial, enfocada en investigación científica avanzada",
    mission_objectives: [
      "Experimentos de física de fluidos",
      "Estudios médicos en microgravedad",
      "Mantenimiento del segmento estadounidense"
    ],
    agency: "NASA",
    agency_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/220px-NASA_logo.svg.png",
    progress: 20
  },
  "Matthew Dominick": {
    id: "md1",
    name: "Matthew Dominick",
    craft: "ISS",
    role: "Piloto",
    nationality: "Estados Unidos",
    mission_start: "2024-03-03",
    mission_duration: "6 meses",
    mission_name: "Crew-8",
    mission_description: "Primera misión espacial a bordo de la nave Crew Dragon",
    mission_objectives: [
      "Operaciones con el brazo robótico",
      "Experimentos de ciencia de materiales",
      "Actividades extravehiculares programadas"
    ],
    agency: "NASA",
    agency_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/220px-NASA_logo.svg.png",
    progress: 20
  },
  "Michael Barratt": {
    id: "mb1",
    name: "Michael Barratt",
    craft: "ISS",
    role: "Médico de la Misión",
    nationality: "Estados Unidos",
    mission_start: "2024-03-03",
    mission_duration: "6 meses",
    mission_name: "Crew-8",
    mission_description: "Cuarta misión espacial, especializada en medicina espacial",
    mission_objectives: [
      "Estudios médicos avanzados",
      "Evaluación de efectos de radiación cósmica",
      "Supervisión de salud de la tripulación"
    ],
    agency: "NASA",
    agency_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/220px-NASA_logo.svg.png",
    progress: 20
  },
  "Jeanette Epps": {
    id: "je1",
    name: "Jeanette Epps",
    craft: "ISS",
    role: "Especialista de Misión",
    nationality: "Estados Unidos",
    mission_start: "2024-03-03",
    mission_duration: "6 meses",
    mission_name: "Crew-8",
    mission_description: "Primera misión espacial, enfocada en experimentos científicos",
    mission_objectives: [
      "Investigación en biotecnología",
      "Experimentos educativos",
      "Pruebas de nuevos sistemas de comunicación"
    ],
    agency: "NASA",
    agency_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/220px-NASA_logo.svg.png",
    progress: 20
  },
  "Alexander Grebenkin": {
    id: "ag1",
    name: "Alexander Grebenkin",
    craft: "ISS",
    role: "Ingeniero de Vuelo",
    nationality: "Rusia",
    mission_start: "2024-03-23",
    mission_duration: "6 meses",
    mission_name: "MS-25",
    mission_description: "Primera misión espacial, encargado de experimentos en el segmento ruso",
    mission_objectives: [
      "Pruebas de nuevos sensores",
      "Mantenimiento de sistemas de soporte vital",
      "Experimentos de cristalografía"
    ],
    agency: "Roscosmos",
    agency_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Roscosmos_logo_ru.svg/320px-Roscosmos_logo_ru.svg.png",
    progress: 10
  },
  "Butch Wilmore": {
    id: "bw1",
    name: "Butch Wilmore",
    craft: "ISS",
    role: "Comandante de Starliner",
    nationality: "Estados Unidos",
    mission_start: "2024-06-01",
    mission_duration: "8 días",
    mission_name: "Starliner-1",
    mission_description: "Misión de prueba del nuevo vehículo Boeing Starliner",
    mission_objectives: [
      "Certificación del sistema Starliner",
      "Pruebas de acoplamiento",
      "Validación de procedimientos de emergencia"
    ],
    agency: "NASA",
    agency_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/220px-NASA_logo.svg.png",
    progress: 95
  },
  "Sunita Williams": {
    id: "sw1",
    name: "Sunita Williams",
    craft: "ISS",
    role: "Piloto de Starliner",
    nationality: "Estados Unidos",
    mission_start: "2024-06-01",
    mission_duration: "8 días",
    mission_name: "Starliner-1",
    mission_description: "Misión de prueba del vehículo Boeing Starliner, evaluación de sistemas",
    mission_objectives: [
      "Pruebas de navegación",
      "Evaluación de interfaz de usuario",
      "Documentación de rendimiento del vehículo"
    ],
    agency: "NASA",
    agency_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/220px-NASA_logo.svg.png",
    progress: 95
  },
  "Li Guangsu": {
    id: "lg1",
    name: "Li Guangsu",
    craft: "Tiangong",
    role: "Comandante",
    nationality: "China",
    mission_start: "2024-04-25",
    mission_duration: "6 meses",
    mission_name: "Shenzhou-18",
    mission_description: "Misión de larga duración en la estación espacial china",
    mission_objectives: [
      "Experimentos de ciencia de materiales",
      "Desarrollo de tecnologías de cultivo espacial",
      "Pruebas de fabricación en microgravedad"
    ],
    agency: "CNSA",
    agency_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/China_National_Space_Administration_logo.svg/200px-China_National_Space_Administration_logo.svg.png",
    progress: 15
  },
  "Li Cong": {
    id: "lc1",
    name: "Li Cong",
    craft: "Tiangong",
    role: "Ingeniero de Vuelo",
    nationality: "China",
    mission_start: "2024-04-25",
    mission_duration: "6 meses",
    mission_name: "Shenzhou-18",
    mission_description: "Primera misión espacial, asistencia en experimentos y mantenimiento",
    mission_objectives: [
      "Mantenimiento de sistemas",
      "Experimentos biológicos",
      "Evaluación de efectos de radiación"
    ],
    agency: "CNSA",
    agency_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/China_National_Space_Administration_logo.svg/200px-China_National_Space_Administration_logo.svg.png",
    progress: 15
  },
  "Ye Guangfu": {
    id: "yg1",
    name: "Ye Guangfu",
    craft: "Tiangong",
    role: "Especialista de Experimentos",
    nationality: "China",
    mission_start: "2024-04-25",
    mission_duration: "6 meses",
    mission_name: "Shenzhou-18",
    mission_description: "Segunda misión espacial, especializado en investigación científica",
    mission_objectives: [
      "Experimentos de astronomía",
      "Observaciones de la Tierra",
      "Pruebas de nuevos instrumentos científicos"
    ],
    agency: "CNSA",
    agency_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/China_National_Space_Administration_logo.svg/200px-China_National_Space_Administration_logo.svg.png",
    progress: 15
  }
};

// Función para obtener detalles de una misión por nombre de astronauta
export function getMissionDetails(astronautName: string): MissionDetailedData | null {
  return missionDetailsMap[astronautName] || null;
}

// Función para obtener todos los detalles de misión
export function getAllMissionDetails(): MissionDetailedData[] {
  return Object.values(missionDetailsMap);
}
