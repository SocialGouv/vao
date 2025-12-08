import { PersonneMoraleDto } from "./personneMoraleDto";
import { PersonnePhysiqueDto } from "./personnePhysiqueDto";

export interface OrganismeDto {
  id: string;
  nom: string;
  siret: string;
  organismeId: string;
  complet: boolean;
  typeOrganisme: string;
  personneMorale: PersonneMoraleDto;
  personnePhysique: PersonnePhysiqueDto;
  agrement: {
    numero: string;
    dateFinValidite: string;
  };
}
