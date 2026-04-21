import type { AdresseDto } from "../dto/adresse.dto";

export function normalizeAdresse(adresse: AdresseDto) {
  if (!adresse) return adresse;
  const coords = adresse.coordinates;
  if (!Array.isArray(coords) || coords.length !== 2) {
    console.warn(
      "[normalizeAdresse] Adresse sans coordonnées valides :",
      adresse,
    );
    return {
      ...adresse,
      lat: null,
      long: null,
    };
  }
  return {
    ...adresse,
    lat:
      coords[1] !== undefined && coords[1] !== null ? String(coords[1]) : null,
    long:
      coords[0] !== undefined && coords[0] !== null ? String(coords[0]) : null,
  };
}
