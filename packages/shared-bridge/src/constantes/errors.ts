export enum ERRORS_COMMON {
  FORBIDDEN = "FORBIDDEN",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  NOT_FOUND = "NOT_FOUND",
  INVALID_BODY = "INVALID_BODY",
  INVALID_PARAMS = "INVALID_PARAMS",
  INVALID_QUERY = "INVALID_QUERY",
  PATH_NOT_FOUND = "PATH_NOT_FOUND",
}

export enum FUNCTIONAL_ERRORS {
  AGREMENT_NOT_FOUND = "AGREMENT_NOT_FOUND",
  AGREMENT_INCONSISTENT = "AGREMENT_INCONSISTENT",
  USER_OTP_CODE_INVALID = "USER_OTP_CODE_INVALID",
  USER_OTP_CODE_EXPIRED = "USER_OTP_CODE_EXPIRED",
  USER_OTP_MAX_ATTEMPTS = "USER_OTP_MAX_ATTEMPTS",
  USER_OTP_TEMPORARILY_BLOCKED = "USER_OTP_TEMPORARILY_BLOCKED",
  USER_OTP_CODE_NOT_FOUND = "USER_OTP_CODE_NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  USER_TEMPORARILY_BLOCKED = "USER_TEMPORARILY_BLOCKED",
  USER_EMAIL_UNAUTHORIZED = "USER_EMAIL_UNAUTHORIZED",
}
export const FUNCTIONAL_ERROR_MESSAGES: Record<FUNCTIONAL_ERRORS, string> = {
  [FUNCTIONAL_ERRORS.AGREMENT_NOT_FOUND]: "Agrément introuvable.",
  [FUNCTIONAL_ERRORS.AGREMENT_INCONSISTENT]: "Agrément incohérent.",

  [FUNCTIONAL_ERRORS.USER_OTP_CODE_INVALID]: "Le code est erroné.",
  [FUNCTIONAL_ERRORS.USER_OTP_CODE_EXPIRED]: "Code OTP expiré.",
  [FUNCTIONAL_ERRORS.USER_OTP_MAX_ATTEMPTS]:
    "Nombre maximal de tentatives OTP atteint.",
  [FUNCTIONAL_ERRORS.USER_OTP_TEMPORARILY_BLOCKED]:
    "Utilisateur temporairement bloqué suite à trop de tentatives OTP.",
  [FUNCTIONAL_ERRORS.USER_OTP_CODE_NOT_FOUND]: "Code OTP introuvable.",

  [FUNCTIONAL_ERRORS.USER_NOT_FOUND]: "Utilisateur introuvable.",
  [FUNCTIONAL_ERRORS.USER_TEMPORARILY_BLOCKED]:
    "Utilisateur temporairement bloqué.",
  [FUNCTIONAL_ERRORS.USER_EMAIL_UNAUTHORIZED]: "Adresse email non autorisée.",
};

export function getFunctionalErrorMessage(
  code: FUNCTIONAL_ERRORS | string,
): string {
  return (
    FUNCTIONAL_ERROR_MESSAGES[code as FUNCTIONAL_ERRORS] ??
    "Erreur fonctionnelle inconnue."
  );
}
export const FUNCTIONAL_ERROR_VALUES = Object.values(
  FUNCTIONAL_ERRORS,
) as string[];

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
