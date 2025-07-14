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
    event: "First human in space",
    description: "Yuri Gagarin became the first human to journey into outer space when his Vostok spacecraft completed one orbit of Earth.",
    astronauts: ["Yuri Gagarin"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Yuri_Gagarin_%28cropped%29.jpg/800px-Yuri_Gagarin_%28cropped%29.jpg"
  },
  {
    date: "1961-05-05",
    event: "First American in space",
    description: "Alan Shepard became the first American in space during a suborbital flight aboard Freedom 7.",
    astronauts: ["Alan Shepard"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Alan_Shepard_astronaut_in_spacesuit.jpg/800px-Alan_Shepard_astronaut_in_spacesuit.jpg"
  },
  {
    date: "1963-06-16",
    event: "First woman in space",
    description: "Valentina Tereshkova became the first woman in space aboard Vostok 6.",
    astronauts: ["Valentina Tereshkova"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/RIAN_archive_612748_Valentina_Tereshkova.jpg/800px-RIAN_archive_612748_Valentina_Tereshkova.jpg"
  },
  {
    date: "1965-03-18",
    event: "First spacewalk",
    description: "Alexei Leonov conducted the first spacewalk, or EVA (Extra-Vehicular Activity), from the Voskhod 2 spacecraft.",
    astronauts: ["Alexei Leonov"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Alexey_Leonov%2C_1974_%28cropped%29.jpg/800px-Alexey_Leonov%2C_1974_%28cropped%29.jpg"
  },
  {
    date: "1969-07-20",
    event: "First humans on the Moon",
    description: "Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon during the Apollo 11 mission.",
    astronauts: ["Neil Armstrong", "Buzz Aldrin"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Buzz_salutes_the_U.S._Flag.jpg/800px-Buzz_salutes_the_U.S._Flag.jpg"
  },
  {
    date: "1971-04-19",
    event: "First space station",
    description: "The Soviet Union launched Salyut 1, the world's first space station, into low Earth orbit.",
    astronauts: ["Georgy Dobrovolsky", "Viktor Patsayev", "Vladislav Volkov"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Salyut_1_and_Soyuz_11.jpg/800px-Salyut_1_and_Soyuz_11.jpg"
  },
  {
    date: "1973-05-14",
    event: "First American space station",
    description: "Skylab, the first American space station, was launched into orbit.",
    astronauts: ["Charles Conrad", "Paul Weitz", "Joseph Kerwin"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Skylab_%28SL-4%29.jpg/800px-Skylab_%28SL-4%29.jpg"
  },
  {
    date: "1986-02-20",
    event: "Mir space station begins",
    description: "The Soviet Union launched the core module of the Mir space station, which would remain in orbit for 15 years.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Mir_space_station_12_June_1998.jpg/800px-Mir_space_station_12_June_1998.jpg"
  },
  {
    date: "1998-11-20",
    event: "ISS construction begins",
    description: "The first module of the International Space Station, Zarya, was launched into orbit.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/ISS_Zarya_module.jpg/800px-ISS_Zarya_module.jpg"
  },
  {
    date: "2000-11-02",
    event: "ISS continuously occupied",
    description: "The first long-duration crew, Expedition 1, arrived at the ISS, beginning continuous human presence in space that continues today.",
    astronauts: ["William Shepherd", "Yuri Gidzenko", "Sergei Krikalev"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/ISS_Expedition_1_crew.jpg/800px-ISS_Expedition_1_crew.jpg"
  },
  {
    date: "2021-04-24",
    event: "Chinese space station begins",
    description: "China launched the core module of its Tiangong space station.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Tianhe_Core_Module.jpg/800px-Tianhe_Core_Module.jpg"
  },
  {
    date: "2022-05-21",
    event: "First all-private astronaut mission",
    description: "Axiom Mission 1 became the first all-private astronaut mission to the ISS.",
    astronauts: ["Michael López-Alegría", "Larry Connor", "Mark Pathy", "Eytan Stibbe"],
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Axiom_Mission_1_Crew_Portrait_%28NHQ202205230001%29.jpg/800px-Axiom_Mission_1_Crew_Portrait_%28NHQ202205230001%29.jpg"
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
