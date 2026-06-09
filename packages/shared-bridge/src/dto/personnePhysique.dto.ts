export interface PersonnePhysiqueDto {
  historic: {
    nom: string | null;
    prenom: string | null;
    siret: string | null;
    updatedAt: Date | null;
  }[];
  siren: string | null;
  siret: string;
  nomUsage: string;
  nomNaissance: string;
  prenom: string;
  telephone: string;
  profession: string;
  adresseSiege: {
    label: string | null;
    cleInsee: string | null;
    codeInsee: string | null;
    codePostal: string | null;
    long: number | null;
    lat: number | null;
    departement: string | null;
  };
  adresseDomicile: {
    label: string | null;
    cleInsee: string | null;
    codeInsee: string | null;
    codePostal: string | null;
    long: number | null;
    lat: number | null;
    departement: string | null;
  };
}
