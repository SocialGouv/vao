export enum FILE_CATEGORY {
  AMODIFER = "AGR_AMODIFIER",
  REFUS = "AGR_REFUS",
  PROCVERBAL = "AGR_PROCVERBAL",
  MOTIVATION = "AGR_MOTIVATION",
  IMMATRICUL = "AGR_IMMATRICUL",
  ASSURRESP = "AGR_ASSURRESP",
  ASSURRAPAT = "AGR_ASSURRAPAT",
  SEJOUR = "AGR_SEJOUR",
  ACCOMPRESP = "AGR_ACCOMPRESP",
  SUIVIMED = "AGR_SUIVIMED",
  BUDGET = "AGR_BUDGET",
  CHANGEEVOL = "AGR_CHANGEEVOL",
  BILANQUALIT = "AGR_BILANQUALIT",
  BILANFINANC = "AGR_BILANFINANC",
  BILANQUALITPERCEPTION = "AGR_BILANQUALITPERCEPTION",
  BILANQUALITPERSPECTIVE = "AGR_BILANQUALITPERSPECTIVE",
  BILANQUALITELEMARQ = "AGR_BILANQUALITELEMARQ",
  BILANQUALITCOMPLEMENTAIRES = "AGR_BILANQUALITCOMPLEMENTAIRES",
  BILANFINANCIERQUATREANNEES = "AGR_BILANFINANCIERQUATREANNEES",
  PROJETSSEJOURSPREVUS = "AGR_PROJETSSEJOURSPREVUS",
  PROJETSSEJOURSCOMPETENCESEXPERIENCE = "AGR_PROJSEJCOMPETEXP",
  PROJETSSEJOURSMESURES = "AGR_PROJETSSEJOURSMESURES",
  PROJETSSEJOURSCOMPLEMENTAIRES = "AGR_PROJETSSEJOURSCOMPLEMENTAIRES",
  PROJETSSEJOURSCASIER = "AGR_PROJETSSEJOURSCASIER",
  PROJETSSEJOURSORGATRANSPORT = "AGR_PROJSSEJORGATRANSPORT",
  PROJETSSEJOURSSUIVIMED = "AGR_PROJETSSEJOURSSUIVIMED",
  PROJSEJPROTCOREORIENT = "AGR_PROJSEJPROTCOREORIENT",
  PROJSSEJOURSPROTCOLERAPATR = "AGR_PROJSSEJOURSPROTCOLERAPATR",
  PROJSEJOURSBUDGETPERSONNES = "AGR_PROJSEJOURSBUDGETPERSONNES",
}

export type FileKey =
  | "fileAModifier"
  | "fileRefus"
  | "filesMotivation"
  | "fileProcesVerbal"
  | "fileImmatriculation"
  | "fileAttestationsRespCivile"
  | "fileAttestationsRapatriement"
  | "filesChangeEvol"
  | "filesBilanQualit"
  | "filesBilanFinancier"
  | "filesAgrementSejour"
  | "filesAccompResp"
  | "filesSuiviMed"
  | "filesBilanQualitPerception"
  | "filesBilanQualitPerspectives"
  | "filesBilanQualitElementsMarquants"
  | "filesBilanQualitComplementaires"
  | "filesBilanFinancierQuatreAnnees"
  | "filesProjetsSejoursPrevus"
  | "filesProjetsSejoursCompetencesExperience"
  | "filesProjetsSejoursMesures"
  | "filesProjetsSejoursComplementaires"
  | "fileProjetsSejoursCasier"
  | "filesProjetsSejoursOrgaTransports"
  | "filesProjetsSejoursSuiviMed"
  | "filesProjetsSejoursProtocoleReorientation"
  | "filesProjetsSejoursProtocoleRapatriement"
  | "filesProjSejoursBudgetPersonnes";

export const FILE_CATEGORY_CONFIG = {
  [FILE_CATEGORY.AMODIFER]: {
    fileKey: "fileAModifier",
    label: "Fichier associé à la demande de complétion",
    multiple: false,
  },
  [FILE_CATEGORY.REFUS]: {
    fileKey: "fileRefus",
    label: "Fichier lié au refus de l'agrément",
    multiple: false,
  },
  [FILE_CATEGORY.PROCVERBAL]: {
    fileKey: "fileProcesVerbal",
    label: "Procès verbal d’assemblée générale",
    multiple: false,
  },
  [FILE_CATEGORY.MOTIVATION]: {
    fileKey: "filesMotivation",
    label: "Motivation, compétences et expériences",
    multiple: true,
  },
  [FILE_CATEGORY.IMMATRICUL]: {
    fileKey: "fileImmatriculation",
    label:
      "Certificat d’immatriculation au registre des opérateurs de voyages et de séjours",
    multiple: false,
  },
  [FILE_CATEGORY.ASSURRESP]: {
    fileKey: "fileAttestationsRespCivile",
    label: "Attestation Assurance Responsabilité",
    multiple: false,
  },
  [FILE_CATEGORY.ASSURRAPAT]: {
    fileKey: "fileAttestationsRapatriement",
    label: "Attestation Assurance Cas de rapatriement",
    multiple: false,
  },
  [FILE_CATEGORY.SEJOUR]: {
    fileKey: "filesAgrementSejour",
    label: "Projet de séjour",
    multiple: true,
  },
  [FILE_CATEGORY.ACCOMPRESP]: {
    fileKey: "filesAccompResp",
    label: "Accompagnants & responsables",
    multiple: true,
  },
  [FILE_CATEGORY.SUIVIMED]: {
    fileKey: "filesSuiviMed",
    label: "Suivi médical",
    multiple: true,
  },
  [FILE_CATEGORY.BUDGET]: {
    fileKey: "filesProjSejoursBudgetPersonnes",
    label: "Budget des personnes",
    multiple: true,
  },
  [FILE_CATEGORY.CHANGEEVOL]: {
    fileKey: "filesChangeEvol",
    label: "Bilan - Changement ou évolution",
    multiple: true,
  },
  [FILE_CATEGORY.BILANQUALIT]: {
    fileKey: "filesBilanQualit",
    label: "Bilan qualitatif 4 dernières années",
    multiple: true,
  },
  [FILE_CATEGORY.BILANFINANC]: {
    fileKey: "filesBilanFinancier",
    label: "Bilan financier 4 dernières années",
    multiple: true,
  },
} as const;

export type FileCategoryConfig = typeof FILE_CATEGORY_CONFIG;
