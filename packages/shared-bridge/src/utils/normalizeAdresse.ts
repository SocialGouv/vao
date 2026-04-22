import type { AdresseDto } from "../dto/adresse.dto";

export function normalizeAdresse(
  adresse: Partial<AdresseDto> | null | undefined,
): AdresseDto {
  if (!adresse) throw new Error("normalizeAdresse: adresse is required");

  let coords = adresse.coordinates;

  if (
    (!Array.isArray(coords) || coords.length !== 2) &&
    adresse.long != null &&
    adresse.lat != null
  ) {
    coords = [Number(adresse.long), Number(adresse.lat)];
  }

  const long =
    coords && coords[0] !== undefined && coords[0] !== null
      ? String(coords[0])
      : null;
  const lat =
    coords && coords[1] !== undefined && coords[1] !== null
      ? String(coords[1])
      : null;

  // Vérifie que les champs obligatoires sont présents
  if (
    adresse.label == null ||
    adresse.codeInsee == null ||
    adresse.codePostal == null ||
    adresse.departement == null
  ) {
    throw new Error("normalizeAdresse: adresse is missing required fields");
  }

  return {
    ...adresse,
    codeInsee: adresse.codeInsee,
    codePostal: adresse.codePostal,
    coordinates: coords ?? null,
    departement: adresse.departement,
    label: adresse.label,
    lat,
    long,
  };
}
