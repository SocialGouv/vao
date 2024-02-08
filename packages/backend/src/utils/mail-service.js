const axios = require("axios");
const jwt = require("jsonwebtoken");
const {
  SENDER_EMAIL,
  MAIL_URL,
  frontUsagersDomain,
  frontBODomain,
} = require("../config");

const config = require("../config");
const sendMailTemplate = require("../helpers/mail");

const sendNotificationUrl = `${MAIL_URL}/api/mail`;

const logger = require("./logger");
const { buildValidationToken } = require("./token");
const AppError = require("./error");

const log = logger(module.filename);

module.exports = {
  sendMailActivation: (dataMail) => {
    log.i("sendMailActivation - In");
    const expireIn = config.validationToken.expiresIn / 1000;
    const token = jwt.sign(
      buildValidationToken(dataMail.idUser, dataMail.datefinValidite),
      `${config.validationToken.secret}`,
      {
        expiresIn: expireIn,
      },
    );

    const link = `${frontUsagersDomain}/connexion/validation/${token}?id=${dataMail.idUser}`;
    const duree = expireIn / 3600;

    const html = sendMailTemplate.getBody(
      "PORTAIL HONORABILITE RETOUR - ACTIVATION DE COMPTE",
      [
        {
          type: "p",
          p: [
            "Bonjour,",
            "Vous recevez ce mail car votre compte vient d'être réactivé sur le Portail Honorabilité Retour (PHR).",
            `Pour activer votre compte, veuillez cliquer sur lien ci dessous. Attention, ce lien ne sera valable que ${duree} heures`,
          ],
        },
        {
          type: "link",
          link,
          text: "Activer votre compte",
        },
      ],
      "L'équipe du SI Honorabilité",
    );

    const requestMail = {
      from: SENDER_EMAIL,
      to: dataMail.mail,
      replyTo: SENDER_EMAIL,
      subject: "Portail Honorabilité Retour - Activation de compte",
      html,
    };

    return axios
      .post(sendNotificationUrl, requestMail)
      .then((response) => {
        log.d(response.data);
        log.i("sendMailActivation - Done");
      })
      .catch((error) => {
        log.w(
          "sendMailActivation - error on sending mail",
          error.name,
          error.message,
          {
            method: "sendMailActivation",
          },
        );
        throw new AppError("le mail n'a pas pu être envoyé", {
          name: "mail-service-error",
          cause: error,
        });
      });
  },
  sendMailReactivation: ({ email, token, idUser }) => {
    log.i("sendMailReactivation - In", {
      email,
      token,
    });
    if (!email) {
      const message = `Le paramètre email manque à la requête`;
      log.w(`sendMailReactivation - ${message}`);
      throw new AppError(message);
    }
    if (!token) {
      const message = `Le paramètre token manque à la requête`;
      log.w(`sendMailReactivation - ${message}`);
      throw new AppError(message);
    }

    const link = `${frontUsagersDomain}/connexion/validation/${token}?id=${idUser}`;
    log.d("sendMailReactivation - sending reactivate mail");

    const html = sendMailTemplate.getBody(
      "PORTAIL HONORABILITE RETOUR - ACTIVATION DE COMPTE",
      [
        {
          type: "p",
          p: [
            "Bonjour,",
            "Vous recevez ce mail car votre compte vient d'être réactivé sur le Portail Honorabilité Retour (PHR).",
            "Pour activer votre compte, veuillez cliquer sur lien ci dessous.",
          ],
        },
        {
          type: "link",
          link,
          text: "Valider votre mail",
        },
      ],
      "L'équipe du SI Honorabilité",
    );

    const params = {
      from: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      to: email,
      subject: `Portail Honorabilité Retour - Valider votre email`,
      html,
    };
    log.d("sendMailReactivation post email", { sendNotificationUrl, params });

    return axios
      .post(sendNotificationUrl, params)
      .then(() => {
        log.i("sendMailReactivation - Done");
      })
      .catch((error) => {
        log.w(
          "sendMailReactivation - error on sending mail",
          error.name,
          error.message,
          {
            method: "sendMailReactivation",
          },
        );
        throw new AppError("le mail n'a pas pu être envoyé", {
          name: "mail-service-error",
          cause: error,
        });
      });
  },
  sendMailForgottenPassword: ({ email, token }) => {
    log.i("sendMailForgottenPassword - In", {
      email,
      token,
    });
    if (!email) {
      const message = `Le paramètre email manque à la requête`;
      log.w(`sendMailForgottenPassword - ${message}`);
      throw new AppError(message);
    }
    if (!token) {
      const message = `Le paramètre token manque à la requête`;
      log.w(`sendMailForgottenPassword - ${message}`);
      throw new AppError(message);
    }

    const link = `${frontUsagersDomain}/connexion/reset-mot-de-passe?token=${token}`;
    log.d("sendMailForgottenPassword - sending forgotten mail");

    const html = sendMailTemplate.getBody(
      "PORTAIL HONORABILITE RETOUR - MOT DE PASSE OUBLIE",
      [
        {
          type: "p",
          p: [
            "Bonjour,",
            "Vous recevez ce mail car vous avez demandé le renouvellement de votre mot de passe sur le Portail Honorabilité Retour (PHR).",
            "Pour définir un nouveau mot de passe, veuillez cliquer sur lien ci dessous.",
          ],
        },
        {
          type: "link",
          link,
          text: "Changer mon mot de passe",
        },
      ],
      "L'équipe du SI Honorabilité",
    );

    const params = {
      from: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      to: email,
      subject: `Portail Honorabilité Retour - Renouvellement du mot de passe`,
      html,
    };
    log.d("sendMailForgottenPassword post email", {
      sendNotificationUrl,
      params,
    });

    return axios
      .post(sendNotificationUrl, params)
      .then(() => {
        log.i("sendMailForgottenPassword - Done");
      })
      .catch((error) => {
        log.w(
          "sendMailForgottenPassword - error on sending mail",
          error.name,
          error.message,
          {
            method: "sendMailForgottenPassword",
          },
        );
        throw new AppError("le mail n'a pas pu être envoyé", {
          name: "mail-service-error",
          cause: error,
        });
      });
  },
  sendMailOtp: ({ mail, codeTemp }) => {
    log.i("sendMailOtp - In", mail);

    const html = sendMailTemplate.getBody(
      "PORTAIL HONORABILITE RETOUR - AUTHENTIFICATION PAR CODE",
      [
        {
          type: "p",
          p: [
            "Bonjour,",
            "Vous recevez ce mail car vous souhaitez accéder au Portail Honorabilité Retour (PHR).",
            "Pour accéder au portail, veuillez entrer le code ci dessous.",
          ],
        },
        {
          type: "code",
          code: codeTemp,
        },
      ],
      "L'équipe du SI Honorabilité",
    );

    const requestMail = {
      from: SENDER_EMAIL,
      to: mail,
      replyTo: SENDER_EMAIL,
      subject: "Portail Honorabilité Retour - code authentification",
      html,
    };

    return axios
      .post(sendNotificationUrl, requestMail)
      .then((response) => {
        log.d(response.data);
        log.i("sendMailOtp - Done");
      })
      .catch((error) => {
        log.w(
          "sendMailOtp - error on sending mail",
          error.name,
          error.message,
          {
            method: "sendMailOtp",
          },
        );
        throw new AppError("le mail n'a pas pu être envoyé", {
          name: "mail-service-error",
          cause: error,
        });
      });
  },
  sendMailValidationComptePP: ({ email }) => {
    log.i("sendMailValidationComptePP - In", {
      email,
    });
    if (!email) {
      const message = `Le paramètre email manque à la requête`;
      log.w(`sendMailValidationComptePP - ${message}`);
      throw new AppError(message);
    }

    const link = `${frontUsagersDomain}/mon-compte/mes-demandes`;
    const text = "Je demande mon attestation";
    log.d("sendMailValidationComptePP - sending validation mail");

    const html = sendMailTemplate.getBody(
      "PORTAIL PREVENTION - Votre compte a été validé",
      [
        {
          type: "p",
          p: [
            "Bonjour,",
            "Nous vous informons que votre compte d'accès au Portail Prévention a été vérifié et validé.",
            "Vous pouvez désormais réaliser votre demande d'attestation d’honorabilité en cliquant sur le lien ci dessous.",
          ],
        },
        {
          type: "link",
          link,
          text,
        },
      ],
      "L'équipe du Portail Honorabilité",
    );

    const params = {
      from: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      to: email,
      subject: `Portail Prévention - Vos informations personnelles ont été validées`,
      html,
    };
    log.d("sendMailValidationComptePP post email", {
      sendNotificationUrl,
      params,
    });

    return axios
      .post(sendNotificationUrl, params)
      .then(() => {
        log.i("sendMailValidationComptePP - Done");
      })
      .catch((error) => {
        log.w(
          "sendMailValidationComptePP - error on sending mail",
          error.name,
          error.message,
          {
            method: "sendMailValidationComptePP",
          },
        );
        throw new AppError("le mail n'a pas pu être envoyé", {
          name: "mail-service-error",
          cause: error,
        });
      });
  },
  sendMailInvalidationComptePP: ({ email }) => {
    log.i("sendMailInvalidationComptePP - In", {
      email,
    });
    if (!email) {
      const message = `Le paramètre email manque à la requête`;
      log.w(`sendMailInvalidationComptePP - ${message}`);
      throw new AppError(message);
    }

    const link = `${frontUsagersDomain}/mon-compte/profil/edition`;
    const text = "Je mets à jour mes données d'identité";
    log.d("sendMailInvalidationComptePP - sending validation mail");

    const html = sendMailTemplate.getBody(
      "PORTAIL PREVENTION - Votre compte n'a pas pu être validé",
      [
        {
          type: "p",
          p: [
            "Bonjour,",
            "Vous recevez ce mail car votre compte d'accès au Portail Prévention n'a malheureusement pas pu être validé en l'état.",
            "Vraisemblablement, la photo de votre titre d'identité est la cause de ce refus, soit parce que elle n'est pas d'assez bonne qualité pour être lue, soit parce que cette pièce d'identité ne correspond aux données d'identité que vous avez renseigné.",
            "Nous vous invitons donc à vérifier et, le cas échéant, corriger vos données d'identité (noms, prénoms, sexe, date et lieu de naissance) et à déposer une photo de votre pièce d'identité lisible. Pour ce faire, vous pouvez cliquer sur le lien ci dessous.",
          ],
        },
        {
          type: "link",
          link,
          text,
        },
      ],
      "L'équipe du Portail Honorabilité",
    );

    const params = {
      from: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      to: email,
      subject: `Portail Prévention - Vos informations personnelles n'ont pas pu être validées`,
      html,
    };
    log.d("sendMailInvalidationComptePP post email", {
      sendNotificationUrl,
      params,
    });

    return axios
      .post(sendNotificationUrl, params)
      .then(() => {
        log.i("sendMailInvalidationComptePP - Done");
      })
      .catch((error) => {
        log.w(
          "sendMailInvalidationComptePP - error on sending mail",
          error.name,
          error.message,
          {
            method: "sendMailInvalidationComptePP",
          },
        );
        throw new AppError("le mail n'a pas pu être envoyé", {
          name: "mail-service-error",
          cause: error,
        });
      });
  },
  sendMailInvalidateAIAPP: ({ email }) => {
    log.i("sendMailInvalidateAIAPP - In", {
      email,
    });
    if (!email) {
      const message = `Le paramètre email manque à la requête`;
      log.w(`sendMailInvalidateAIAPP - ${message}`);
      throw new AppError(message);
    }

    log.d("sendMailInvalidateAIAPP - sending validation mail");
    const link = `${frontUsagersDomain}/mon-compte/profil/edition`;
    const text = "Je mets à jour mes données d'identité";

    const html = sendMailTemplate.getBody(
      "PORTAIL PREVENTION - Votre demande d'attestation d'honorabilité",
      [
        {
          type: "p",
          p: [
            "Bonjour,",
            "Vous recevez ce mail car votre demande d'attestation d'Honorabilité réalisée sur le Portail Prévention n'a malheureusement pas pu aboutir pour l'instant.",
            "Vraisemblablement, la photo de votre titre d'identité est la cause de ce refus, soit parce que elle n'est pas d'assez bonne qualité pour être lue, soit parce que cette pièce d'identité ne correspond aux données d'identité que bous avez renseigné.",
            "Nous vous invitons donc à vérifier et, le cas échéant, corriger vos données d'identité (noms, prénoms, sexe, date et lieu de naissance) et à déposer une photo de votre pièce d'identité lisible. Pour ce faire, vous pouvez cliquer sur le lien ci dessous.",
          ],
        },
        {
          type: "link",
          link,
          text,
        },
      ],
      "L'équipe du Portail Honorabilité",
    );

    const params = {
      from: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      to: email,
      subject: `PORTAIL PREVENTION - Votre demande d'attestation d'honorabilité`,
      html,
    };
    log.d("sendMailInvalidateAIAPP post email", {
      sendNotificationUrl,
      params,
    });

    return axios
      .post(sendNotificationUrl, params)
      .then(() => {
        log.i("sendMailInvalidateAIAPP - Done");
      })
      .catch((error) => {
        log.w(
          "sendMailInvalidateAIAPP - error on sending mail",
          error.name,
          error.message,
          {
            method: "sendMailInvalidateAIAPP",
          },
        );
        throw new AppError("le mail n'a pas pu être envoyé", {
          name: "mail-service-error",
          cause: error,
        });
      });
  },

  sendMailAcceptedRequestPP: ({ email }) => {
    log.i("sendMailAcceptedRequestPP - In", {
      email,
    });
    if (!email) {
      const message = `Le paramètre email manque à la requête`;
      log.w(`sendMailAcceptedRequestPP - ${message}`);
      throw new AppError(message);
    }

    const link = `${frontUsagersDomain}/mon-compte/mes-demandes`;
    const text = "Je récupère mon attestation";

    const html = sendMailTemplate.getBody(
      "PORTAIL PREVENTION - Votre attestation d'honorabilité est disponible",
      [
        {
          type: "p",
          p: [
            "Bonjour,",
            "Félicitations, votre demande d'attestation d'Honorabilité réalisée sur le Portail Prévention est à présent terminée.",
            "Votre attestation d’honorabilité est disponible, vous pouvez le récupérer en cliquant sur le lien ci dessous.",
          ],
        },
        {
          type: "link",
          link,
          text,
        },
      ],
      "L'équipe du Portail Honorabilité",
    );

    const params = {
      from: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      to: email,
      subject: `PORTAIL PREVENTION - Votre attestation d'honorabilité est disponible`,
      html,
    };
    log.d("sendMailAcceptedRequestPP post email", {
      sendNotificationUrl,
      params,
    });

    return axios
      .post(sendNotificationUrl, params)
      .then(() => {
        log.i("sendMailAcceptedRequestPP - Done");
      })
      .catch((error) => {
        log.w(
          "sendMailAcceptedRequestPP - error on sending mail",
          error.name,
          error.message,
          {
            method: "sendMailAcceptedRequestPP",
          },
        );
        throw new AppError("le mail n'a pas pu être envoyé", {
          name: "mail-service-error",
          cause: error,
        });
      });
  },
  sendAIAChildrenlMailPP: ({ email }) => {
    log.i("sendMailDeniedRequestPP - In", {
      email,
    });
    if (!email) {
      const message = `Le paramètre email manque à la requête`;
      log.w(`sendAIAChildrenlMailPP - ${message}`);
      throw new AppError(message);
    }

    const link = `${frontUsagersDomain}/mon-compte/mes-demandes`;
    const text = "Je corrige mes données";

    const html = sendMailTemplate.getBody(
      "PORTAIL PREVENTION - identité non reconnue",
      [
        {
          type: "p",
          p: [
            "Bonjour,",
            "Nous vous informons que votre demande d'attestation a été étudiée mais n’a pas pu être validée en l'état.",
            "Malheureusement, au moins une identité des personnes mineures vivant à votre domicile n’a pas pu être vérifiée.",
            "Nous vous invitons à revoir l’exactitude des informations saisies en suivant le lien ci dessous.",
          ],
        },
        {
          type: "link",
          link,
          text,
        },
      ],
      "L'équipe du Portail Prévention",
    );

    const params = {
      from: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      to: email,
      subject: `PORTAIL PREVENTION - Votre demande d'attestation d'honorabilité`,
      html,
    };
    log.d("sendAIAChildrenlMailPP post email", {
      sendNotificationUrl,
      params,
    });

    return axios
      .post(sendNotificationUrl, params)
      .then(() => {
        log.i("sendAIAChildrenlMailPP - Done");
      })
      .catch((error) => {
        log.w(
          "sendAIAChildrenlMailPP - error on sending mail",
          error.name,
          error.message,
          {
            method: "sendAIAChildrenlMailPP",
          },
        );
        throw new AppError("le mail n'a pas pu être envoyé", {
          name: "mail-service-error",
          cause: error,
        });
      });
  },
  sendMailDeniedRequestPP: ({ email }) => {
    log.i("sendMailDeniedRequestPP - In", {
      email,
    });
    if (!email) {
      const message = `Le paramètre email manque à la requête`;
      log.w(`sendMailDeniedRequestPP - ${message}`);
      throw new AppError(message);
    }

    const link = "https://prevention-enfance.gouv.fr/faq/";
    const text = "Accéder à la FAQ";

    const html = sendMailTemplate.getBody(
      "PORTAIL PREVENTION - demande d'attestation terminée",
      [
        {
          type: "p",
          p: [
            "Bonjour,",
            "Nous vous informons que votre demande d'attestation est terminée mais que nous n’avons pas pu vous délivrer d'attestation d’honorabilité.",
            "Nous vous invitons à aller consulter la Foire Aux Questions (FAQ) accessible via le lien ci dessous si vous pensez que ce refus est injustifié.",
          ],
        },
        {
          type: "link",
          link,
          text,
        },
      ],
      "L'équipe du Portail Prévention",
    );

    const params = {
      from: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      to: email,
      subject: `PORTAIL PREVENTION - Votre demande d'attestation d'honorabilité est terminée`,
      html,
    };
    log.d("sendMailDeniedRequestPP post email", {
      sendNotificationUrl,
      params,
    });

    return axios
      .post(sendNotificationUrl, params)
      .then(() => {
        log.i("sendMailDeniedRequestPP - Done");
      })
      .catch((error) => {
        log.w(
          "sendMailDeniedRequestPP - error on sending mail",
          error.name,
          error.message,
          {
            method: "sendMailDeniedRequestPP",
          },
        );
        throw new AppError("le mail n'a pas pu être envoyé", {
          name: "mail-service-error",
          cause: error,
        });
      });
  },

  sendMailActivationPHD: ({ email, token }) => {
    log.i("sendMailActivationPHD - In", {
      email,
      token,
    });
    if (!email) {
      const message = `Le paramètre email manque à la requête`;
      log.w(`sendMailActivationPHD - ${message}`);
      throw new AppError(message);
    }
    if (!token) {
      const message = `Le paramètre token manque à la requête`;
      log.w(`sendMailActivationPHD - ${message}`);
      throw new AppError(message);
    }

    const link = `${frontBODomain}/connexion/validation/${token}`;
    const text = "Valider votre compte";

    log.d("sendMailActivationPHD - sending validation mail");

    const html = sendMailTemplate.getBody(
      "PORTAIL HONORABILITE DEPOSE - ACTIVATION DE COMPTE",
      [
        {
          type: "p",
          p: [
            "Bonjour,",
            "Vous recevez ce mail car votre compte vient d'être créé sur le Portail Honorabilité Dépose (PHD).",
            "Pour activer votre compte, veuillez cliquer sur lien ci dessous.",
          ],
        },
        {
          type: "link",
          link,
          text,
        },
      ],
      "L'équipe du SI Honorabilite",
    );

    const params = {
      from: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      to: email,
      subject: `Portail Honorabilité Dépose - Valider votre email`,
      html,
    };
    log.d("sendMailActivationPHD post email", { sendNotificationUrl, params });

    return axios
      .post(sendNotificationUrl, params)
      .then(() => {
        log.i("sendMailActivationPHD - Done");
      })
      .catch((error) => {
        log.w(
          "sendMailActivationPHD - error on sending mail",
          error.name,
          error.message,
          {
            method: "sendMailActivationPHD",
          },
        );
        throw new AppError("le mail n'a pas pu être envoyé", {
          name: "mail-service-error",
          cause: error,
        });
      });
  },
  sendMailReactivationPHD: ({ email, token }) => {
    log.i("sendMailReactivationPHD - In", {
      email,
      token,
    });
    if (!email) {
      const message = `Le paramètre email manque à la requête`;
      log.w(`sendMailReactivationPHD - ${message}`);
      throw new AppError(message);
    }
    if (!token) {
      const message = `Le paramètre token manque à la requête`;
      log.w(`sendMailReactivationPHD - ${message}`);
      throw new AppError(message);
    }

    const link = `${frontBODomain}/connexion/validation/${token}`;
    const text = "Valider votre compte";

    log.d("sendMailReactivationPHD - sending reactivate mail");

    const html = sendMailTemplate.getBody(
      "PORTAIL HONORABILITE DEPOSE - REACTIVATION DE COMPTE",
      [
        {
          type: "p",
          p: [
            "Bonjour,",
            "Vous recevez ce mail car votre compte vient d'être réactivé sur le Portail Honorabilité Dépose (PHD).",
            "Pour activer votre compte, veuillez cliquer sur lien ci dessous.",
          ],
        },
        {
          type: "link",
          link,
          text,
        },
      ],
      "L'équipe du SI Honorabilite",
    );

    const params = {
      from: SENDER_EMAIL,
      replyTo: SENDER_EMAIL,
      to: email,
      subject: `Portail Honorabilité Dépose - Valider votre email`,
      html,
    };
    log.d("sendMailReactivationPHD post email", {
      sendNotificationUrl,
      params,
    });

    return axios
      .post(sendNotificationUrl, params)
      .then(() => {
        log.i("sendMailReactivationPHD - Done");
      })
      .catch((error) => {
        log.w(
          "sendMailReactivationPHD - error on sending mail",
          error.name,
          error.message,
          {
            method: "sendMailReactivationPHD",
          },
        );
        throw new AppError("le mail n'a pas pu être envoyé", {
          name: "mail-service-error",
          cause: error,
        });
      });
  },
  sendMail: ({ from, replyTo, to, subject, html }) => {
    log.i("sendMail - In", {
      subject,
    });
    if (!from || !replyTo || !to || !subject || !html) {
      const message = `Paramètre manquant à la requête`;
      log.w(`sendMail - ${message}`);
      throw new AppError(message);
    }

    log.d("sendMail - sending mail");

    return axios
      .post(sendNotificationUrl, { from, replyTo, to, subject, html })
      .then(() => {
        log.i("sendMail - Done");
      })
      .catch((error) => {
        log.w("sendMail - error on sending mail", error.name, error.message, {
          method: "sendMail",
        });
        throw new AppError("le mail n'a pas pu être envoyé", {
          name: "mail-service-error",
          cause: error,
        });
      });
  },
};
