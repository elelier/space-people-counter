import type { SpaceData } from "./spaceApi";

type CountSnapshot = Pick<SpaceData, "number" | "status" | "isFallback">;

/** Only compare two previously fetched, non-fallback snapshots. */
export function getRosterDelta(previous: CountSnapshot | null, current: CountSnapshot): number | null {
  if (
    !previous ||
    previous.status !== "live" ||
    previous.isFallback === true ||
    current.status !== "live" ||
    current.isFallback === true ||
    previous.number === current.number
  ) {
    return null;
  }

  return current.number - previous.number;
}
