import type { AgrementDto } from "./agrement.dto";
import type { PersonneMoraleDto } from "./personneMoraleDto";
import type { PersonnePhysiqueDto } from "./personnePhysiqueDto";

export interface OrganismeDto {
  id: number;
  nom: string;
  siret: string;
  organismeId: string;
  complet: boolean;
  typeOrganisme: string;
  personneMorale: PersonneMoraleDto;
  personnePhysique: PersonnePhysiqueDto;
  agrement: AgrementDto & {
    dateFinValidite: string;
  };
}
