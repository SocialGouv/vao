export const roles = {
  AGREMENT: "Agrement",
  COMPTE: "Compte",
  CONTROLE: "Controle",
  DESACTIVATION: "Desactivation",
  DS_ECRITURE: "DemandeSejour_Ecriture",
  DS_LECTURE: "DemandeSejour_Lecture",
  EIG_ECRITURE: "Eig_Ecriture",
  EIG_LECTURE: "Eig_Lecture",
} as const;

export type RoleLabel = (typeof roles)[keyof typeof roles];
