const defaultStatus = {
  BROUILLON: "BROUILLON",
  TRANSMISE: "TRANSMISE",
  EN_COURS: "EN COURS",
  A_MODIFIER: "A MODIFIER",
  REFUSEE: "REFUSEE",
  ATTENTE_8_JOUR: "EN ATTENTE DECLARATION 8 JOURS",
  TRANSMISE_8J: "TRANSMISE 8J",
  EN_COURS_8J: "EN COURS 8J",
  A_MODIFIER_8J: "A MODIFIER 8J",
  VALIDEE_8J: "VALIDEE 8J",
  REFUSEE_8J: "REFUSEE 8J",
  ANNULEE: "ANNULEE",
  ABANDONNEE: "ABANDONNEE",
  SEJOUR_EN_COURS: "SEJOUR EN COURS",
  TERMINEE: "TERMINEE",
};

const statusWithoutDraft = Object.fromEntries(
  Object.entries(defaultStatus).filter(
    ([key]) => key !== defaultStatus.BROUILLON,
  ),
);

export default {
  defaultStatus,
  statusWithoutDraft,
};