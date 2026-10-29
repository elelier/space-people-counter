const openStreetMapCredit = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';

/** Both visual themes use the same OpenStreetMap tiles. */
export function getMapTileAttribution(): string {
  return openStreetMapCredit;
}
