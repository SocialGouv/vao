export enum ERRORS_LOGIN {
  TooManyLoginAttempts = "TooManyLoginAttempts",
  WrongCredentials = "WrongCredentials",
  NeedEmailValidation = "NeedEmailValidation",
  EmailUnauthorized = "EmailUnauthorized",
  UserTemporarilyBlocked = "UserTemporarilyBlocked",
  UnexpectedError = "UnexpectedError",
}

export enum ERRORS_SIRET {
  EtablissementsError = "EtablissementsError",
  SiretError = "SiretError",
  RepresentantsLegauxError = "RepresentantsLegauxError",
  UnknownError = "UnknownError",
}

export const ERRORS_SIRET_MESSAGES: Record<ERRORS_SIRET, string> = {
  [ERRORS_SIRET.EtablissementsError]:
    "Erreur lors de la récupération des établissements.",
  [ERRORS_SIRET.SiretError]:
    "Erreur lors de la récupération des informations SIRET.",
  [ERRORS_SIRET.RepresentantsLegauxError]:
    "Erreur lors de la récupération des représentants légaux.",
  [ERRORS_SIRET.UnknownError]: "Erreur inconnue liée au SIRET.",
};
