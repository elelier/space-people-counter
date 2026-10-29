import type { ISSLocationData } from "@/services/issLocationApi";

// /api/iss-location timestamps are milliseconds from the Pages Function.
// The upstream velocity is orbital speed, with units supplied by WhereTheISS.
const MAX_SAMPLE_AGE_MS = 2 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 30 * 1000;
const MIN_ISS_ORBITAL_KMH = 20_000;
const MAX_ISS_ORBITAL_KMH = 35_000;
const MILES_TO_KM = 1.609344;

export function formatOrbitalSpeed(data: ISSLocationData, nowMs = Date.now()): string {
  if (
    data.status !== "live" ||
    data.isFallback === true ||
    /simulated|fallback/i.test(data.message) ||
    !Number.isFinite(data.timestamp) ||
    data.timestamp < 1e12 ||
    nowMs - data.timestamp > MAX_SAMPLE_AGE_MS ||
    data.timestamp - nowMs > MAX_FUTURE_SKEW_MS
  ) {
    return "No disponible";
  }

  // Also reject stale or malformed upstream-success metadata when provided.
  if (data.lastSuccessfulUpdate !== undefined && data.lastSuccessfulUpdate !== null) {
    const successfulAt = Date.parse(data.lastSuccessfulUpdate);
    if (
      !Number.isFinite(successfulAt) ||
      nowMs - successfulAt > MAX_SAMPLE_AGE_MS ||
      successfulAt - nowMs > MAX_FUTURE_SKEW_MS
    ) {
      return "No disponible";
    }
  }

  if (typeof data.velocity !== "number" || !Number.isFinite(data.velocity)) {
    return "No disponible";
  }

  const kmh = data.units === "kilometers"
    ? data.velocity
    : data.units === "miles"
      ? data.velocity * MILES_TO_KM
      : null;

  // Guard against zero, negative, unknown-unit and physically implausible samples.
  if (kmh === null || kmh < MIN_ISS_ORBITAL_KMH || kmh > MAX_ISS_ORBITAL_KMH) {
    return "No disponible";
  }

  return `${Math.round(kmh).toLocaleString("es-MX")} km/h`;
}
