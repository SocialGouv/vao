export enum ERRORS_COMMON {
  NOT_FOUND = "NOT_FOUND",
}

export enum ERRORS_LOGIN {
  TooManyLoginAttempts = "TooManyLoginAttempts",
  WrongCredentials = "WrongCredentials",
  NeedEmailValidation = "NeedEmailValidation",
  EmailUnauthorized = "EmailUnauthorized",
  UserTemporarilyBlocked = "UserTemporarilyBlocked",
  UnexpectedError = "UnexpectedError",
  SiretNotFound = "SiretNotFound",
}

export enum ERRORS_SIRET {
  EtablissementsError = "EtablissementsError",
  EtablissementSuccesseurError = "EtablissementSuccesseurError",
  EtablissementNoSuccesseur = "EtablissementNoSuccesseur",
  SiretError = "SiretError",
  RepresentantsLegauxError = "RepresentantsLegauxError",
  UnknownError = "UnknownError",
}

export const ERRORS_SIRET_MESSAGES: Record<ERRORS_SIRET, string> = {
  [ERRORS_SIRET.EtablissementNoSuccesseur]:
    "Aucun successeur pour cet établissement (siret).",
  [ERRORS_SIRET.EtablissementSuccesseurError]:
    "Erreur lors de la récupération de l'établissements successeur.",
  [ERRORS_SIRET.EtablissementsError]:
    "Erreur lors de la récupération des établissements.",
  [ERRORS_SIRET.SiretError]:
    "Erreur lors de la récupération des informations SIRET.",
  [ERRORS_SIRET.RepresentantsLegauxError]:
    "Erreur lors de la récupération des représentants légaux.",
  [ERRORS_SIRET.UnknownError]: "Erreur inconnue liée au SIRET.",
};
