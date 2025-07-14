interface AstronautData {
  name: string;
  craft: string;
}

export interface SpaceData {
  number: number;
  people: AstronautData[];
  message: string;
}

// Datos de respaldo en caso de que la API falle
const fallbackData: SpaceData = {
  number: 12,
  message: "success",
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
};

export async function getPeopleInSpace(): Promise<SpaceData> {
  try {
    // Primero intentar la API real
    const response = await fetch('http://api.open-notify.org/astros.json', {
      next: { revalidate: 300 }, // Cache por 5 minutos
    });

    if (response.ok) {
      const data = await response.json();
      if (data.message === "success") {
        console.log('Successfully fetched people in space from API');
        return data;
      }
    }
    
    throw new Error('API response not successful');
  } catch (error) {
    console.error('Failed to fetch people in space:', error);
    // Usar datos de respaldo en caso de error
    return fallbackData;
  }
}
