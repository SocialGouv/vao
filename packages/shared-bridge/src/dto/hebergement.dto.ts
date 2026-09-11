import type { AdresseDto } from "./adresse.dto";

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
  amenagementsSpecifiques: boolean | null;
  chambresDoubles: boolean | null;
  chambresUnisexes: boolean | null;
  couchageIndividuel: boolean | null;
  descriptionLieuHebergement: string | null;
  fileDernierArreteAutorisationMaire: unknown | null;
  fileDerniereAttestationSecurite: unknown | null;
  fileReponseExploitantOuProprietaire: unknown | null;
  litsDessus: boolean | null;
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

export interface SiteDto {
  id: number;
  siteId: string;
  current: boolean;
  adresseId: number | null;
  nomSiteOfficiel: string | null;
  hebergementTypeId: number | null;
  descriptif: string | null;
  createdAt: Date;
  editedAt: Date | null;
  createdBy: number | null;
  editedBy: number | null;
}

export interface SiteOrganismeDto {
  siteId: string;
  organismeId: number;
  nomSite: string | null;
  respNomPrenom: string | null;
  respTelephone: string | null;
  respEmail: string | null;
  excursionDescription: string | null;
  deplacementProximiteDescription: string | null;
  vehiculesAdaptes: boolean | null;
}

export interface UniteHebergementDto {
  id: number;
  siteId: string;
  organismeId: number;
  statutId: number | null;
  createdAt: Date;
  editedAt: Date;
  hebergementId: string;
  current: boolean;
  createdBy: number | null;
  editedBy: number | null;
  nombreCouchageTotal: number | null;
  litsSuperposes: boolean | null;
  accessibilitePmr: boolean | null;
  accessibilitePrecision: string | null;
  chambresDoubles: boolean | null;
  separationHommeFemme: boolean | null;
  reglementationErp: boolean | null;
  couchageIndividuel: boolean | null;
  rangementIndividuel: boolean | null;
  amenagementsSpecifiques: boolean | null;
  amenagementsSpecifiquesPrecision: string | null;
  fileReponseExploitantOuProprietaire: string | null;
  fileDernierArreteAutorisationMaire: string | null;
  fileDerniereAttestationSecurite: string | null;
  visiteLocaux: boolean | null;
  visiteLocauxAt: Date | null;
}

export type UniteHebergementPayloadDto = Omit<
  UniteHebergementDto,
  | "id"
  | "siteId"
  | "organismeId"
  | "statutId"
  | "createdAt"
  | "editedAt"
  | "hebergementId"
  | "current"
  | "createdBy"
  | "editedBy"
>;

export type UniteHebergementWriteData = UniteHebergementPayloadDto & {
  statutId: number | null;
};

export interface UsagerHebergementBodyLegacyDto {
  coordonnees: CoordonneesDto;
  informationsLocaux: InformationsLocauxDto;
  informationsTransport: InformationsTransportDto;
  nom: string;
}

export interface UsagerHebergementBodyUniteDto {
  coordonnees: CoordonneesDto;
  nom: string;
  uniteData: UniteHebergementPayloadDto;
}

export type UsagerHebergementBodyDto =
  | UsagerHebergementBodyLegacyDto
  | UsagerHebergementBodyUniteDto;

export interface HebergementDto {
  id: number;
  nom: string;
  organismeId: number;
  statut: string | null;
  coordonnees: CoordonneesDto;
  informationsLocaux: InformationsLocauxDto;
  informationsTransport: InformationsTransportDto;
  siteId?: string | null;
}
