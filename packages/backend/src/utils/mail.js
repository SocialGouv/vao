const dayjs = require("dayjs");
const { senderEmail, frontUsagersDomain, frontBODomain } = require("../config");

const config = require("../config");
const sendTemplate = require("../helpers/mail");

const logger = require("./logger");
const AppError = require("./error");

const log = logger(module.filename);

module.exports = {
  bo: {
    authentication: {
      sendACompleterMail: ({ destinataires, comment, declaration }) => {
        log.i("sendACompleterMail - In", {
          destinataires,
        });
        if (!destinataires) {
          const message = `Le paramètre destinataires manque à la requête`;
          log.w(`sendACompleterMail - ${message}`);
          throw new AppError(message);
        }
        if (!comment) {
          const message = `Le paramètre comment manque à la requête`;
          log.w(`sendACompleterMail - ${message}`);
          throw new AppError(message);
        }

        const params = {
          from: senderEmail,
          html: `
                <p>Bonjour,</p>

                <p>Vous avez recu des demandes de complément pour votre déclaration ${declaration.idFonctionnelle} </p>
                <p>Voici les commentaires qui vont ont été fait</p>

                <pre>${comment}</pre>
                <p>Veuillez agréer, madame/monsieur, l’assurance de notre considération distinguée.</p>
                `,
          replyTo: senderEmail,
          subject: `Demande de compléments sur la déclaration ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendACompleterMail post email", {
          params,
        });

        return params;
      },
      sendForgottenPassword: ({ email, token }) => {
        log.i("sendForgottenPassword - In", {
          email,
          token,
        });
        if (!email) {
          const message = `Le paramètre email manque à la requête`;
          log.w(`sendForgottenPassword - ${message}`);
          throw new AppError(message);
        }
        if (!token) {
          const message = `Le paramètre token manque à la requête`;
          log.w(`sendForgottenPassword - ${message}`);
          throw new AppError(message);
        }

        const link = `${frontBODomain}/connexion/reset-mot-de-passe?token=${token}`;
        log.d("sendForgottenPassword - sending forgotten mail");

        const html = sendTemplate.getBody(
          "PORTAIL VAO ADMINISTRATION - MOT DE PASSE OUBLIE",
          [
            {
              p: [
                "Bonjour,",
                "Vous recevez ce mail car vous avez demandé le renouvellement de votre mot de passe sur le Portail VAO Administration.",
                "Pour définir un nouveau mot de passe, veuillez cliquer sur lien ci dessous.",
              ],
              type: "p",
            },
            {
              link,
              text: "Changer mon mot de passe",
              type: "link",
            },
          ],
          "L'équipe du SI VAO",
        );

        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Portail VAO Administration - Renouvellement du mot de passe`,
          to: email,
        };
        log.d("sendForgottenPassword post email", { params });

        return params;
      },
      sendRefusMail: ({ destinataires, comment, declaration }) => {
        log.i("sendRefusMail - In", {
          destinataires,
        });
        if (!destinataires) {
          const message = `Le paramètre destinataires manque à la requête`;
          log.w(`sendRefusMail - ${message}`);
          throw new AppError(message);
        }
        if (!comment) {
          const message = `Le paramètre comment manque à la requête`;
          log.w(`sendRefusMail - ${message}`);
          throw new AppError(message);
        }

        const params = {
          from: senderEmail,
          html: `
                <p>Bonjour,</p>

                <p>Votre déclaration ${declaration.idFonctionnelle} à été refusée </p>
                <p>En voici les raisons</p>

                <pre>${comment}</pre>
                <p>Veuillez agréer, madame/monsieur, l’assurance de notre considération distinguée.</p>
                `,
          replyTo: senderEmail,
          subject: `Refus la déclaration ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendRefusMail post email", {
          params,
        });

        return params;
      },
      sendValidationMail: ({ email, token }) => {
        log.i("sendValidationMail - In", {
          email,
          token,
        });
        if (!email) {
          const message = `Le paramètre email manque à la requête`;
          log.w(`sendValidationMail - ${message}`);
          throw new AppError(message);
        }
        if (!token) {
          const message = `Le paramètre token manque à la requête`;
          log.w(`sendValidationMail - ${message}`);
          throw new AppError(message);
        }

        const link = `${frontBODomain}/connexion/validation?token=${token}`;
        log.d("sendValidationMail - sending validation mail");

        const html = sendTemplate.getBody(
          "PORTAIL VAO ADMINISTRATION - CREATION DE COMPTE",
          [
            {
              p: [
                "Bonjour,",
                "Vous recevez ce mail car vous vous avez été inscrit sur le portail VAO Administration.",
                "Pour activer votre compte et créer votre mot de passe, veuillez cliquer sur lien ci dessous.",
              ],
              type: "p",
            },
            {
              link,
              text: "Activer mon compte",
              type: "link",
            },
          ],
          "L'équipe du SI VAO",
        );
        const params = {
          from: senderEmail,
          html: html,
          replyTo: senderEmail,
          subject: `Portail VAO Administration - Validez votre email`,
          to: email,
        };
        log.d("sendValidationMail post email", {
          params,
        });

        return params;
      },
    },
  },
  usagers: {
    authentication: {
      sendForgottenPassword: ({ email, token }) => {
        log.i("sendForgottenPassword - In", {
          email,
          token,
        });
        if (!email) {
          const message = `Le paramètre email manque à la requête`;
          log.w(`sendForgottenPassword - ${message}`);
          throw new AppError(message);
        }
        if (!token) {
          const message = `Le paramètre token manque à la requête`;
          log.w(`sendForgottenPassword - ${message}`);
          throw new AppError(message);
        }

        log.d("sendForgottenPassword - sending validation mail");
        const params = {
          from: senderEmail,
          html: `
                <p>Bonjour,</p>

                <p>Vous recevez ce mail car vous ne trouvez plus votre mot de passe sur le portail VAO</p>

                <p>Afin de modifier votre mot de passe, veuillez cliquer sur le lien suivant qui vous redirigera vers le portail :</p>

                <p><a href="${frontUsagersDomain}/connexion/reset-mot-de-passe?token=${token}">Je réinitialise mon mot de passe</a></p>
                `,
          replyTo: senderEmail,
          subject: `Portail VAO - Réinitialisation du mot de passe`,
          to: email,
        };
        log.d("sendForgottenPassword post email", { params });

        return params;
      },
      sendValidationMail: ({ email, token }) => {
        log.i("sendValidationMail - In", {
          email,
          token,
        });
        if (!email) {
          const message = `Le paramètre email manque à la requête`;
          log.w(`sendValidationMail - ${message}`);
          throw new AppError(message);
        }
        if (!token) {
          const message = `Le paramètre token manque à la requête`;
          log.w(`sendValidationMail - ${message}`);
          throw new AppError(message);
        }

        log.d("sendValidationMail - sending validation mail");
        const params = {
          from: senderEmail,
          html: `
                <p>Bonjour,</p>

                <p>Pour finaliser la création de votre compte sur la plateforme VAO, confirmez votre adresse e-mail en
                cliquant sur le lien ci dessous : </p>

                <p><a href="${frontUsagersDomain}/connexion/validation?token=${token}">Valider mon e-mail</a></p>

                <p>Attention, ce lien ne sera valide que pendant ${config.validationToken.expiresIn / 60000} minutes </p>
                `,
          replyTo: senderEmail,
          subject: `VAO - Validez votre email`,
          to: email,
        };
        log.d("sendValidationMail post email", {
          params,
        });

        return params;
      },
    },
    declarationSejour: {
      sendAR2mois: ({ dest, cc, declaration }) => {
        log.i("sendAR2mois - In", {
          cc,
          dest,
        });
        if (!dest || !declaration) {
          const message = `paramètre manquant à la requête`;
          log.w(`sendForgottenPassword - ${message}`);
          throw new AppError(message);
        }

        log.d("sendAR2mois - sending AR2mois mail");
        const params = {
          cc: cc,
          from: senderEmail,
          html: `
                <p>Vous êtes titulaire de l’agrément « Vacances adaptées organisées » délivré le ${declaration.organisme.agrement.dateObtention} et avez déposé en date du ${dayjs().format("DD/MM/YYYY")}, une déclaration pour le séjour « ${declaration.libelle} » que vous organisez du ${dayjs(declaration.dateDebut).format("DD/MM/YYYY")} au ${dayjs(declaration.dateFin).format("DD/MM/YYYY")}.</p>
                <p>Nous accusons ce jour, le ${dayjs().format("DD/MM/YYYY")}, réception de votre déclaration ${declaration.idFonctionnelle}.</p>
                <p>Vous devrez, huit jours avant le déroulement de ce séjour, me faire parvenir la déclaration complémentaire prévue à l’article R. 412-14 du code du tourisme.</p>
                <p>Veuillez agréer, madame/monsieur, l’assurance de notre considération distinguée.</p>
                `,
          replyTo: senderEmail,
          subject: `Portail VAO - la déclaration ${declaration.idFonctionnelle} a bien été transmise`,
          to: dest,
        };
        log.d("sendAR2mois post email", { params });

        return params;
      },
    },
  },
};
