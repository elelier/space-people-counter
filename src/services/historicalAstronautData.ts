/**
 * Historical data about the number of people in space over time
 * Data is approximate and compiled from various sources including NASA, Roscosmos, and ESA
 */

export interface YearlyAstronautData {
  year: number;
  total: number;
  iss: number;
  mir?: number;
  tiangong?: number;
  skylab?: number;
  other?: number;
}

export interface HistoricalMilestone {
  date: string; // YYYY-MM-DD format
  event: string;
  description: string;
  astronauts?: string[];
  image?: string;
  imageCredit?: string;
}

// Yearly data showing the average number of people in space each year
export const yearlyAstronautCounts: YearlyAstronautData[] = [
  { year: 1961, total: 0, iss: 0, other: 0 }, // First human in space (Yuri Gagarin) but only for 108 minutes
  { year: 1965, total: 0, iss: 0, other: 0 }, // First spacewalk (Alexei Leonov)
  { year: 1969, total: 0, iss: 0, other: 0 }, // First moon landing
  { year: 1971, total: 3, iss: 0, skylab: 0, other: 3 }, // Salyut 1 - first space station
  { year: 1973, total: 3, iss: 0, skylab: 3, other: 0 }, // Skylab
  { year: 1975, total: 3, iss: 0, skylab: 0, other: 3 }, // Apollo-Soyuz Test Project
  { year: 1980, total: 0, iss: 0, other: 0 },
  { year: 1982, total: 2, iss: 0, other: 2 }, // Salyut 7
  { year: 1984, total: 3, iss: 0, other: 3 },
  { year: 1986, total: 2, iss: 0, mir: 2, other: 0 }, // Mir space station begins operations
  { year: 1988, total: 3, iss: 0, mir: 3 },
  { year: 1990, total: 4, iss: 0, mir: 4 },
  { year: 1992, total: 4, iss: 0, mir: 4 },
  { year: 1994, total: 6, iss: 0, mir: 6 },
  { year: 1995, total: 6, iss: 0, mir: 6 },
  { year: 1996, total: 6, iss: 0, mir: 6 },
  { year: 1997, total: 6, iss: 0, mir: 6 },
  { year: 1998, total: 3, iss: 0, mir: 3 }, // ISS construction begins
  { year: 1999, total: 3, iss: 0, mir: 3 },
  { year: 2000, total: 5, iss: 3, mir: 2 }, // First ISS crew arrives
  { year: 2001, total: 5, iss: 3, mir: 2 }, // Mir deorbited in March
  { year: 2002, total: 3, iss: 3 },
  { year: 2003, total: 3, iss: 3 },
  { year: 2004, total: 3, iss: 3 },
  { year: 2005, total: 3, iss: 3 },
  { year: 2006, total: 3, iss: 3 },
  { year: 2007, total: 3, iss: 3 },
  { year: 2008, total: 3, iss: 3 },
  { year: 2009, total: 6, iss: 6 }, // ISS crew size increases to 6
  { year: 2010, total: 6, iss: 6 },
  { year: 2011, total: 6, iss: 6 },
  { year: 2012, total: 6, iss: 6 },
  { year: 2013, total: 6, iss: 6 },
  { year: 2014, total: 6, iss: 6 },
  { year: 2015, total: 6, iss: 6 },
  { year: 2016, total: 6, iss: 6 },
  { year: 2017, total: 6, iss: 6 },
  { year: 2018, total: 6, iss: 6 },
  { year: 2019, total: 6, iss: 6 },
  { year: 2020, total: 6, iss: 6 },
  { year: 2021, total: 7, iss: 7 }, // Commercial crew missions increase numbers
  { year: 2022, total: 10, iss: 7, tiangong: 3 }, // Tiangong space station completed
  { year: 2023, total: 11, iss: 7, tiangong: 4 },
  { year: 2024, total: 12, iss: 9, tiangong: 3 },
  { year: 2025, total: 12, iss: 9, tiangong: 3 }
];

// Key milestones in human spaceflight history
export const spaceMilestones: HistoricalMilestone[] = [
  {
    date: "1961-04-12",
    event: "Primer ser humano en el espacio",
    description: "Yuri Gagarin fue el primer ser humano en viajar al espacio. A bordo de Vostok 1, completó una órbita alrededor de la Tierra.",
    astronauts: ["Yuri Gagarin"],
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Yuri_Gagarin_%281961%29_-_Restoration.jpg",
    imageCredit: "Arto Jousi / Museo Finlandés de Fotografía; restauración: Adam Cuerden · Dominio público"
  },
  {
    date: "1961-05-05",
    event: "Primer estadounidense en el espacio",
    description: "Alan Shepard fue el primer estadounidense en llegar al espacio durante un vuelo suborbital a bordo de Freedom 7.",
    astronauts: ["Alan Shepard"],
    image: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Alan_Shepard_astronaut_in_spacesuit.jpg",
    imageCredit: "NASA · Dominio público"
  },
  {
    date: "1963-06-16",
    event: "Primera mujer en el espacio",
    description: "Valentina Tereshkova se convirtió en la primera mujer en viajar al espacio a bordo de Vostok 6.",
    astronauts: ["Valentina Tereshkova"],
    image: "https://upload.wikimedia.org/wikipedia/commons/6/61/RIAN_archive_612748_Valentina_Tereshkova.jpg",
    imageCredit: "Alexander Mokletsov / RIA Novosti · CC BY-SA 3.0"
  },
  {
    date: "1965-03-18",
    event: "Primera caminata espacial",
    description: "Alexéi Leónov realizó la primera caminata espacial (actividad extravehicular) desde la nave Vosjod 2.",
    astronauts: ["Alexei Leonov"],
    image: "https://upload.wikimedia.org/wikipedia/commons/7/73/Alexei_Leonov_%28S74-20824%29.jpg",
    imageCredit: "NASA · Dominio público"
  },
  {
    date: "1969-07-20",
    event: "Primeros seres humanos en la Luna",
    description: "Neil Armstrong y Buzz Aldrin fueron los primeros seres humanos en caminar sobre la Luna durante la misión Apolo 11.",
    astronauts: ["Neil Armstrong", "Buzz Aldrin"],
    image: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Buzz_salutes_the_U.S._Flag.jpg",
    imageCredit: "NASA · Dominio público"
  },
  {
    date: "1971-04-19",
    event: "Primera estación espacial",
    description: "La Unión Soviética lanzó Saliut 1, la primera estación espacial de la historia, a órbita terrestre baja.",
    astronauts: ["Georgy Dobrovolsky", "Viktor Patsayev", "Vladislav Volkov"],
    image: "https://upload.wikimedia.org/wikipedia/commons/8/83/Salyut_1_and_Soyuz_drawing.png",
    imageCredit: "NASA · Dominio público (ilustración)"
  },
  {
    date: "1973-05-14",
    event: "Primera estación espacial estadounidense",
    description: "Skylab, la primera estación espacial estadounidense, fue lanzada a órbita.",
    astronauts: ["Charles Conrad", "Paul Weitz", "Joseph Kerwin"],
    image: "https://upload.wikimedia.org/wikipedia/commons/0/07/Skylab_%28SL-4%29.jpg",
    imageCredit: "NASA · Dominio público"
  },
  {
    date: "1986-02-20",
    event: "Inicio de la estación espacial Mir",
    description: "La Unión Soviética lanzó el módulo central de la estación Mir, que permaneció en órbita durante 15 años.",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/09/Mir_Space_Station_viewed_from_Endeavour_during_STS-89.jpg",
    imageCredit: "NASA · Dominio público"
  },
  {
    date: "1998-11-20",
    event: "Comienza la construcción de la EEI",
    description: "Se lanzó a órbita Zaryá, el primer módulo de la Estación Espacial Internacional (EEI).",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/db/Zarya_from_STS-88.jpg",
    imageCredit: "NASA · Dominio público"
  },
  {
    date: "2000-11-02",
    event: "Ocupación continua de la EEI",
    description: "La Expedición 1 llegó a la EEI y comenzó una presencia humana ininterrumpida en el espacio que continúa hasta hoy.",
    astronauts: ["William Shepherd", "Yuri Gidzenko", "Sergei Krikalev"],
    image: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Expedition_1_crew_poster.jpg",
    imageCredit: "NASA · Dominio público"
  },
  {
    date: "2021-04-24",
    event: "Inicio de la estación espacial china",
    description: "China lanzó el módulo central de su estación espacial Tiangong.",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/25/Chinese_Tiangong_Space_Station.jpg",
    imageCredit: "Shujianyang · CC BY-SA 4.0 (ilustración)"
  },
  {
    date: "2022-05-21",
    event: "Primera misión privada de astronautas a la EEI",
    description: "Axiom Mission 1 se convirtió en la primera misión de astronautas íntegramente privada a la EEI.",
    astronauts: ["Michael López-Alegría", "Larry Connor", "Mark Pathy", "Eytan Stibbe"],
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Axiom_Crew_Portrait.jpg",
    imageCredit: "NASA TV · Dominio público"
  }
];

/**
 * Get the highest number of people in space at once in history
 */
export function getMaxPeopleInSpace(): number {
  return Math.max(...yearlyAstronautCounts.map(year => year.total));
}

/**
 * Get the total number of people who have been to space
 * Note: This is an approximate figure
 */
export function getTotalPeopleEverInSpace(): number {
  // As of 2024, approximately 600 people have been to space
  return 600;
}

/**
 * Get average number of people in space by decade
 */
export function getAverageByDecade(): { decade: string; average: number }[] {
  const decades: { [key: string]: number[] } = {};

  yearlyAstronautCounts.forEach(yearData => {
    const decade = `${Math.floor(yearData.year / 10) * 10}s`;
    if (!decades[decade]) {
      decades[decade] = [];
    }
    decades[decade].push(yearData.total);
  });

  return Object.entries(decades).map(([decade, values]) => {
    const sum = values.reduce((acc, val) => acc + val, 0);
    return {
      decade,
      average: parseFloat((sum / values.length).toFixed(1))
    };
  });
}
