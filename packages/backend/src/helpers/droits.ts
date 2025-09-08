export const DroitsGroup = {
  agrement: "agrement",
  demande_sejour: "demande_sejour",
  eig: "eig",
  hebergement: "hebergement",
} as const;

export type DroitDomain = (typeof DroitsGroup)[keyof typeof DroitsGroup];
