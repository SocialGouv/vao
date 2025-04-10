export type InsertEventParams = {
  source: string;
  demande_sejour_id: number;
  usager_user_id: number | null;
  bo_user_id: number | null;
  type: string;
  type_precision: string;
  metadata: object;
};

export type SelectAbandonDeclarationsRow = {
  id: number;
  statut: string;
};

export type UpdateEnCoursDeclarationsRow = {
  id: number;
};

export type UpdateTermineDeclarationsRow = {
  id: number;
};

export type InsertEventRow = {
  eventid: number;
};
