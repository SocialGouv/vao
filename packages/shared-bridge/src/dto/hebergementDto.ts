export interface AdresseDto {
  codeInsee: string | null;
  codePostal: string | null;
  coordinates: [number | null, number | null] | number[] | null;
  departement: string | null;
  label: string | null;
}

export interface CoordonneesDto {
  adresse: AdresseDto | null;
  email: string | null;
  nomGestionnaire: string | null;
  numTelephone1: string | null;
  numTelephone2: string | null;
}

export interface InformationsLocauxDto {
  accessibilite: string | null;
  accessibilitePrecision: string | null;
  amenagementsSpecifiques: string | null;
  chambresDoubles: boolean | null;
  chambresUnisexes: boolean | null;
  couchageIndividuel: boolean | null;
  descriptionLieuHebergement: string | null;
  fileDernierArreteAutorisationMaire: unknown | null;
  fileDerniereAttestationSecurite: unknown | null;
  fileReponseExploitantOuProprietaire: unknown | null;
  litsDessus: number | null;
  nombreLits: number | null;
  nombreLitsSuperposes: number | null;
  nombreMaxPersonnesCouchage: number | null;
  pension: string | null;
  precisionAmenagementsSpecifiques: string | null;
  prestationsHotelieres: string[];
  rangementIndividuel: boolean | null;
  reglementationErp: boolean | null;
  type: string | null;
  visiteLocaux: boolean | null;
  visiteLocauxAt: string | Date | null;
}

export interface InformationsTransportDto {
  deplacementProximite: string | null;
  excursion: string | null;
  vehiculesAdaptes: boolean | null;
}

export interface HebergementDto {
  id: number;
  nom: string;
  organismeId: number;
  statut: string | null;
  coordonnees: CoordonneesDto;
  informationsLocaux: InformationsLocauxDto;
  informationsTransport: InformationsTransportDto;
}
