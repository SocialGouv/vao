export const TRACKING_ACTIONS = {
  creation: "CREATION",
  deactivation: "DEACTIVATION",
  deletion: "DELETION",
  modification: "MODIFICATION",
  reading: "READING",
} as const;

export const TRACKING_ENTITIES = {
  demandeSejour: "DEMANDE_SEJOUR",
  eig: "EIG",
  personneMorale: "PERSONNE_MORALE",
  personnePhysique: "PERSONNE_PHYSIQUE",
  userBack: "USER_BACK",
  userFront: "USER_FRONT",
} as const;

export const TRACKING_USER_TYPE = {
  back: "BACK",
  front: "FRONT",
} as const;

export type Action = (typeof TRACKING_ACTIONS)[keyof typeof TRACKING_ACTIONS];
export type Entity = (typeof TRACKING_ENTITIES)[keyof typeof TRACKING_ENTITIES];
export type UserType =
  (typeof TRACKING_USER_TYPE)[keyof typeof TRACKING_USER_TYPE];
