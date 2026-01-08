export interface PersonnePhysiqueDto {
  historic: {
    nom?: string | null;
    prenom?: string | null;
    updatedAt?: Date | null;
    siret?: string | null;
  }[];
  nomUsage: string;
  nomNaissance: string;
  prenom: string;
  telephone: string;
}
