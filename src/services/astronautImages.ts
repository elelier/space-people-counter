// Mapeo de nombres de astronautas a sus imágenes
const astronautImages: Record<string, string> = {
  // Astronautas ISS
  "Oleg Kononenko": "https://same-assets.com/api/v1/asset?assetUrl=https%3A%2F%2Fs3.us-west-1.amazonaws.com%2Fupload-image.same.com%2F2025%2F3%2F21%2Foleg-kononenko.jpg&thumbnail=300x300",
  "Nikolai Chub": "https://same-assets.com/api/v1/asset?assetUrl=https%3A%2F%2Fs3.us-west-1.amazonaws.com%2Fupload-image.same.com%2F2025%2F3%2F21%2Fnikolai-chub.jpg&thumbnail=300x300",
  "Tracy Caldwell Dyson": "https://same-assets.com/api/v1/asset?assetUrl=https%3A%2F%2Fs3.us-west-1.amazonaws.com%2Fupload-image.same.com%2F2025%2F3%2F21%2Ftracy-caldwell.jpg&thumbnail=300x300",
  "Matthew Dominick": "https://same-assets.com/api/v1/asset?assetUrl=https%3A%2F%2Fs3.us-west-1.amazonaws.com%2Fupload-image.same.com%2F2025%2F3%2F21%2Fmatthew-dominick.jpg&thumbnail=300x300",
  "Michael Barratt": "https://same-assets.com/api/v1/asset?assetUrl=https%3A%2F%2Fs3.us-west-1.amazonaws.com%2Fupload-image.same.com%2F2025%2F3%2F21%2Fmichael-barratt.jpg&thumbnail=300x300",
  "Jeanette Epps": "https://same-assets.com/api/v1/asset?assetUrl=https%3A%2F%2Fs3.us-west-1.amazonaws.com%2Fupload-image.same.com%2F2025%2F3%2F21%2Fjeanette-epps.jpg&thumbnail=300x300",
  "Alexander Grebenkin": "https://same-assets.com/api/v1/asset?assetUrl=https%3A%2F%2Fs3.us-west-1.amazonaws.com%2Fupload-image.same.com%2F2025%2F3%2F21%2Falexander-grebenkin.jpg&thumbnail=300x300",
  "Butch Wilmore": "https://same-assets.com/api/v1/asset?assetUrl=https%3A%2F%2Fs3.us-west-1.amazonaws.com%2Fupload-image.same.com%2F2025%2F3%2F21%2Fbutch-wilmore.jpg&thumbnail=300x300",
  "Sunita Williams": "https://same-assets.com/api/v1/asset?assetUrl=https%3A%2F%2Fs3.us-west-1.amazonaws.com%2Fupload-image.same.com%2F2025%2F3%2F21%2Fsunita-williams.jpg&thumbnail=300x300",

  // Astronautas estación china Tiangong
  "Li Guangsu": "https://same-assets.com/api/v1/asset?assetUrl=https%3A%2F%2Fs3.us-west-1.amazonaws.com%2Fupload-image.same.com%2F2025%2F3%2F21%2Fli-guangsu.jpg&thumbnail=300x300",
  "Li Cong": "https://same-assets.com/api/v1/asset?assetUrl=https%3A%2F%2Fs3.us-west-1.amazonaws.com%2Fupload-image.same.com%2F2025%2F3%2F21%2Fli-cong.jpg&thumbnail=300x300",
  "Ye Guangfu": "https://same-assets.com/api/v1/asset?assetUrl=https%3A%2F%2Fs3.us-west-1.amazonaws.com%2Fupload-image.same.com%2F2025%2F3%2F21%2Fye-guangfu.jpg&thumbnail=300x300"
};

// Imagen de placeholder para cuando no hay foto disponible
const placeholderImage = "https://same-assets.com/api/v1/asset?assetUrl=https%3A%2F%2Fs3.us-west-1.amazonaws.com%2Fupload-image.same.com%2F2025%2F3%2F21%2Fastronaut-placeholder.jpg&thumbnail=300x300";

/**
 * Obtiene la imagen de un astronauta por su nombre
 * @param name Nombre del astronauta
 * @returns URL de la imagen o placeholder si no existe
 */
export function getAstronautImage(name: string): string {
  return astronautImages[name] || placeholderImage;
}
