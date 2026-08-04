import { AGREMENT_STATUT, type AgrementDto } from "@vao/shared-bridge";

export const STATUTS_AGREMENT_EN_COURS = [
  AGREMENT_STATUT.BROUILLON,
  AGREMENT_STATUT.A_COMPLETER,
  AGREMENT_STATUT.A_CORRIGER,
  AGREMENT_STATUT.TRANSMIS,
  AGREMENT_STATUT.EN_INSTRUCTION,
  AGREMENT_STATUT.PRIS_EN_CHARGE,
];

export function hasAgrementRenouvellementEnCours(
  agrements: AgrementDto[] | null,
): boolean {
  if (!agrements) return false;
  return agrements.some(
    (a) =>
      a.statut !== null &&
      STATUTS_AGREMENT_EN_COURS.includes(a.statut as AGREMENT_STATUT),
  );
}
