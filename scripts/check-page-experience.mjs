import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const failures = [];

function read(path) {
  if (!existsSync(path)) {
    failures.push(`${path} does not exist`);
    return "";
  }
  return readFileSync(path, "utf8");
}

function requireToken(path, token) {
  const content = read(path);
  if (!content.includes(token)) failures.push(`${path} is missing: ${token}`);
}

function forbidToken(path, token) {
  const content = read(path);
  if (content.includes(token)) failures.push(`${path} still contains forbidden legacy token: ${token}`);
}

function collectFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? collectFiles(path) : [path];
  });
}

const page = read("src/app/page.tsx");
if (/const\s+initialData\s*:\s*SpaceData/.test(page) || /number:\s*12/.test(page)) {
  failures.push("src/app/page.tsx still exposes the stale hardcoded initial astronaut snapshot");
}

requireToken("src/components/SpacePeopleExperience.tsx", "getPeopleInSpace");
requireToken("src/components/SpacePeopleExperience.tsx", "<PersonasEnEspacio");
requireToken("src/components/SpacePeopleExperience.tsx", "<MisionesActivas");
requireToken("src/components/PersonasEnEspacio.tsx", "<h1");
requireToken("src/components/PersonasEnEspacio.tsx", "¿Cuántas personas hay en el espacio ahora?");
requireToken("src/components/PersonasEnEspacio.tsx", "Compartir este dato");
requireToken("src/components/PersonasEnEspacio.tsx", "Ver quiénes están arriba");
requireToken("src/components/PersonasEnEspacio.tsx", "share_space_count");
requireToken("src/components/SpacePeopleExperience.tsx", "manual_refresh");
requireToken("src/components/PersonasEnEspacio.tsx", "No pudimos actualizar los datos en vivo");

forbidToken("src/components/MisionesActivas.tsx", "getMissionDetails");
forbidToken("src/components/MisionesActivas.tsx", "AstronautImage");
forbidToken("src/components/MisionesActivas.tsx", "mission_duration");
forbidToken("src/components/MisionesActivas.tsx", "nationality");

requireToken("src/app/layout.tsx", "alternates");
requireToken("src/app/layout.tsx", "summary_large_image");
requireToken("src/app/layout.tsx", "/og-space-people.png");
requireToken("src/app/layout.tsx", "es_MX");
forbidToken("src/app/sitemap.ts", "hourly");
requireToken("src/components/StructuredData.tsx", "FAQPage");
requireToken("src/app/page.tsx", "Cómo sabemos este número");
requireToken("src/app/page.tsx", "¿Qué cuenta como una persona “en el espacio”?");

const srcFiles = collectFiles("src").filter((path) => /\.(ts|tsx|js|jsx)$/.test(path));
const gaOccurrences = srcFiles.reduce((count, path) => {
  const matches = read(path).match(/G-8KTLDRRQTP/g);
  return count + (matches?.length ?? 0);
}, 0);

if (gaOccurrences !== 1) {
  failures.push(`Expected exactly one GA measurement ID occurrence under src/, found ${gaOccurrences}`);
}

const h1Occurrences = srcFiles.reduce((count, path) => {
  const matches = read(path).match(/<h1\b/g);
  return count + (matches?.length ?? 0);
}, 0);

if (h1Occurrences !== 1) {
  failures.push(`Expected exactly one visible h1 in src/, found ${h1Occurrences}`);
}

if (failures.length > 0) {
  console.error("Page experience contract check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Page experience contract check passed.");
