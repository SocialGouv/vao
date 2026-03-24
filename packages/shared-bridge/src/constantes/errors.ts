export enum ERRORS_COMMON {
  FORBIDDEN = "FORBIDDEN",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  NOT_FOUND = "NOT_FOUND",
  INVALID_BODY = "INVALID_BODY",
  INVALID_PARAMS = "INVALID_PARAMS",
  INVALID_QUERY = "INVALID_QUERY",
}

export enum FUNCTIONAL_ERRORS {
  AGREMENT_NOT_FOUND = "AGREMENT_NOT_FOUND",
  AGREMENT_INCONSISTENT = "AGREMENT_INCONSISTENT",
}

export enum ERRORS_LOGIN {
  TooManyLoginAttempts = "TooManyLoginAttempts",
  WrongCredentials = "WrongCredentials",
  NeedEmailValidation = "NeedEmailValidation",
  EmailUnauthorized = "EmailUnauthorized",
  UserTemporarilyBlocked = "UserTemporarilyBlocked",
  UnexpectedError = "UnexpectedError",
  SiretNotFound = "SiretNotFound",
  NeedSiretValidation = "NeedSiretValidation",
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
