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
    description: `Votre identifiant ou votre mot de passe sont incorrects, ou votre compte a été désactivé par un tiers. Veuillez réessayer ou utiliser la fonction “Mot de passe oublié”`,
    type: "error",
  },
  TooManyLoginAttempts: {
    title: "Trop de tentatives de connexion",
    description:
      "Vous avez dépassé le nombre maximal de tentatives de connexion. Veuillez réessayer ultérieurement.",
    type: "error",
  },
  UnexpectedError: {
    title: "Une erreur est survenue",
    description:
      "Le service ne semble pas répondre. Veuillez réessayer ultérieurement",
    type: "error",
  },
};
