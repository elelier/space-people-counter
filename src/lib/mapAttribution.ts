const openStreetMapCredit = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';
const cartoCredit = '&copy; <a href="https://carto.com/attribution/">CARTO</a>';

/** Attribution follows the actual tile provider selected for day/night. */
export function getMapTileAttribution(isDayTime: boolean): string {
  return isDayTime ? openStreetMapCredit : `${openStreetMapCredit} | ${cartoCredit}`;
}
