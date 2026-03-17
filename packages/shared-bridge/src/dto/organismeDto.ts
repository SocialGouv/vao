import type { AgrementDto } from "./agrement.dto";
import type { PersonneMoraleDto } from "./personneMorale.dto";
import type { PersonnePhysiqueDto } from "./personnePhysique.dto";

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
