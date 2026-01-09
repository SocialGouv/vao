export interface PersonnePhysiqueDto {
  historic: {
    nom: string | null;
    prenom: string | null;
    siret: string | null;
    updatedAt: Date | null;
  }[];
  nomUsage: string;
  nomNaissance: string;
  prenom: string;
  telephone: string;
}
