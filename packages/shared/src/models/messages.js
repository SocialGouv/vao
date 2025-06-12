export const connectionInfos = {
  Success: {
    title: "Authentification réussie",
    description: "Vous allez être redirigé.",
    type: "success",
  },
  NeedEmailValidation: {
    title: "Erreur d'authentification",
    description: "Ce compte n'a pas validé son email",
    type: "error",
  },
  NeedSiretValidation: {
    title: "Erreur d'authentification",
    description:
      "Votre demande est en cours de traitement, vous recevrez les prochaines étapes par e-mail très bientôt",
    type: "error",
  },
  WrongCredentials: {
    title: "Erreur d'authentification",
    description:
      "Votre adresse courriel ou votre mot de passe sont incorrects.",
    type: "error",
  },
  TooManyLoginAttempts: {
    title: "Trop de tentatives de connexion",
    description:
      "Vous avez dépassé le nombre maximal de tentatives de connexion. Veuillez réessayer ultérieurement.",
    type: "error",
  },
  EmailUnauthorized: {
    title: "Erreur d'authentification",
    description:
      "Ce compte est actuellement inaccessible en raison d'une restriction imposée par une autorité. Pour plus d’informations, veuillez consulter la personne auprès de laquelle vous avez sollicité une création de compte.",
    type: "error",
  },
  UnexpectedError: {
    title: "Une erreur est survenue",
    description:
      "Le service ne semble pas répondre. Veuillez réessayer ultérieurement",
    type: "error",
  },
};