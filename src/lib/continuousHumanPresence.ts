// NASA: la Expedición 1 llegó a la EEI el 2 de noviembre de 2000.
// Fuente: https://www.nasa.gov/international-space-station/space-station-facts-and-figures/
export const CONTINUOUS_HUMAN_PRESENCE_START = "2000-11-02";

export function getContinuousHumanPresenceYears(now: Date = new Date()): number {
  const [year, month, day] = CONTINUOUS_HUMAN_PRESENCE_START.split("-").map(Number);
  const anniversaryPassed =
    now.getUTCMonth() + 1 > month ||
    (now.getUTCMonth() + 1 === month && now.getUTCDate() >= day);
  return Math.max(0, now.getUTCFullYear() - year - (anniversaryPassed ? 0 : 1));
}
