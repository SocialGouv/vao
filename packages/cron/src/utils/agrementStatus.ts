// TODO A supprimer et utiliser l'énum partagée une fois la PR de ach mergée
// Ref: packages/backend/src/dto/AgrementsDto.ts
export enum AGREMENT_STATUT {
  BROUILLON = "BROUILLON",
  TRANSMIS = "TRANSMIS",
  DEPOSE = "DEPOSE",
  VERIF_EN_COURS = "VERIF_EN_COURS",
  PRIS_EN_CHARGE = "PRIS_EN_CHARGE",
  EN_COURS = "EN_COURS",
  A_MODIFIER = "A_MODIFIER",
  REFUSE = "REFUSE",
  COMPLETUDE_CONFIRME = "COMPLETUDE_CONFIRME",
  VALIDE = "VALIDE",
}
