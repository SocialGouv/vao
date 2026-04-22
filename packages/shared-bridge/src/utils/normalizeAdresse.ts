import type { AdresseDto } from "../dto/adresse.dto";

export function normalizeAdresse(adresse: AdresseDto): AdresseDto {
  if (!adresse) return adresse;

  let coords = adresse.coordinates;

  // Si coordinates absent mais long/lat présents, on les reconstitue
  if (
    (!Array.isArray(coords) || coords.length !== 2) &&
    adresse.long != null &&
    adresse.lat != null
  ) {
    coords = [
      adresse.long !== null ? Number(adresse.long) : null,
      adresse.lat !== null ? Number(adresse.lat) : null,
    ];
  }

  // Si coordinates présents, on synchronise long/lat
  const long =
    coords && coords[0] !== undefined && coords[0] !== null
      ? String(coords[0])
      : null;
  const lat =
    coords && coords[1] !== undefined && coords[1] !== null
      ? String(coords[1])
      : null;

  return {
    ...adresse,
    coordinates: coords ?? null,
    lat,
    long,
  };
}
