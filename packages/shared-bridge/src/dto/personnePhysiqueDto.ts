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
}
