export interface AdresseDto {
  id: number | null;
  cleInsee: string | null;
  label: string | null;
  codeInsee: string | null;
  codePostal: string | null;
  coordinates: [number | null, number | null] | number[] | null;
  departement: string | null;
}
