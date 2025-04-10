export type UpdateRappelRow = {
  id: number;
};

export type RappelDeclarationSejour8j15jRow = {
  id: number;
  date_debut: string;
  statut: string;
  titre: string;
  dateDebutAlerte: string;
  mail: string;
};

export type GenerateEmailParams = {
  mail: string;
  deadlineRemind: string;
  dateDebutAlerte: string;
  titre: string
}