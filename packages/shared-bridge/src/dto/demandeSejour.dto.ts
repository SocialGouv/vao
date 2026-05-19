import { DEMANDE_SEJOUR_STATUTS } from "../constantes/demandeSejour";
import type {
  CoordonneesDto,
  InformationsLocauxDto,
  InformationsTransportDto,
} from "./hebergement.dto";

export type DemandeSejourStatutDto =
  (typeof DEMANDE_SEJOUR_STATUTS)[keyof typeof DEMANDE_SEJOUR_STATUTS];

export type DemandeSejourOrganismeDto = Record<string, unknown>;
export type DemandeSejourResponsableSejourDto = Record<string, unknown>;
export type DemandeSejourVacanciersDto = Record<string, unknown>;
export type DemandeSejourPersonnelDto = Record<string, unknown>;
export type DemandeSejourTransportDto = Record<string, unknown>;
export type DemandeSejourProjetSejourDto = Record<string, unknown>;
export type DemandeSejourSanitairesDto = Record<string, unknown>;
export type DemandeSejourAttestationDto = Record<string, unknown>;
export type DemandeSejourDeclaration2mDto = Record<string, unknown>;
export type DemandeSejourFileDto = Record<string, unknown>;

export interface DemandeSejourHebergementItemDto {
  hebergementId: number;
  nom: string;
  dateDebut: string;
  dateFin: string;
  coordonnees: CoordonneesDto;
  informationsLocaux: InformationsLocauxDto;
  informationsTransport: InformationsTransportDto;
}

export interface DemandeSejourHebergementDto {
  hebergements: DemandeSejourHebergementItemDto[];
  sejourEtranger: boolean | null;
  sejourItinerant: boolean | null;
}

export interface DemandeSejourDto {
  id: number;
  statut: DemandeSejourStatutDto;
  organismeId: number;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  duree: string;
  periode: string;
  idFonctionnelle: string | null;
  departementSuivi: string | null;
  responsableSejour: DemandeSejourResponsableSejourDto;
  informationsVacanciers: DemandeSejourVacanciersDto;
  informationsPersonnel: DemandeSejourPersonnelDto;
  informationsTransport: DemandeSejourTransportDto;
  projetSejour: DemandeSejourProjetSejourDto;
  informationsSanitaires: DemandeSejourSanitairesDto;
  organisme: DemandeSejourOrganismeDto;
  files: DemandeSejourFileDto[];
  attestation: DemandeSejourAttestationDto | null;
  declaration2mois: DemandeSejourDeclaration2mDto | null;
  hebergement: DemandeSejourHebergementDto;
  siret?: string | null;
  editedAt: string | null;
  sejourEtranger: boolean | null;
  sejourItinerant: boolean | null;
  rappelDsCompl?: boolean;
  createdAt?: string;
}
