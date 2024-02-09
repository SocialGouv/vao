const jwt = require("jsonwebtoken");
const { senderEmail, frontUsagersDomain, frontBODomain } = require("../config");

const config = require("../config");
const sendTemplate = require("../helpers/mail");

const logger = require("./logger");
const { buildValidationToken } = require("./token");
const AppError = require("./error");

const log = logger(module.filename);

module.exports = {
  usagers: {
    authentication: {
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
          replyTo: senderEmail,
          to: email,
          subject: `VAO - Validez votre email`,
          html: `
                <p>Bonjour,</p>
    
                <p>Vous recevez ce mail car vous vous êtes inscrit sur le portail VAO</p>
    
                <p>Afin de bénéficier de toutes les fonctionnalités, veuillez valider votre email en cliquant sur le lien suivant:</p>
    
                <p><a href="${frontUsagersDomain}/connexion/validation?token=${token}">J'active mon compte.</a></p>
                `,
        };
        log.d("sendValidationMail post email", {
          params,
        });

        return params;
      },
      sendActivationMail: ({ email }) => {
        log.i("sendActivationMail - In", {
          email,
        });
        if (!email) {
          const message = `Le paramètre email manque à la requête`;
          log.w(`sendActivationMail - ${message}`);
          throw new AppError(message);
        }

        log.d("sendActivationMail - sending Activation mail");
        const params = {
          from: senderEmail,
          replyTo: senderEmail,
          to: email,
          subject: `Portail VAO - Votre email a été validé`,
          html: `
                <p>Bonjour,</p>
    
                <p>Vous recevez ce mail car vous vous êtes inscrit sur le portail Prévention.</p>
    
                <p>Votre email a bien été validé. Vous pouvez continuer la procédure de création de compte en vous connectant à nouveau sur le portail Honorabilté.</p>
    
                <p><a href="${frontUsagersDomain}/mon-compte">Je complète mon compte.</a></p>
                `,
        };
        log.d("sendActivationMail", { params });

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

        log.d("sendForgottenPassword - sending validation mail");
        const params = {
          from: senderEmail,
          replyTo: senderEmail,
          to: email,
          subject: `Portail VAO - Renouvellement du mot de passe`,
          html: `
                <p>Bonjour,</p>
    
                <p>Vous recevez ce mail car vous ne trouvez plus votre mot de passe sur le portail Prévention</p>
    
                <p>Afin de modifier votre mot de passe, veuillez cliquer sur le lien suivant qui vous redirigera vers le portail :</p>
    
                <p><a href="${frontUsagersDomain}/connexion/reset-mot-de-passe?token=${token}">Je renouvelle mon mot de passe</a></p>
                `,
        };
        log.d("sendForgottenPassword post email", { params });

        return params;
      },
    },
  },
  bo: {
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

        const link = `${frontBODomain}/connexion/reset-mot-de-passe?token=${token}`;
        log.d("sendForgottenPassword - sending forgotten mail");

        const html = sendTemplate.getBody(
          "PORTAIL VAO INSTRUCTEURS - MOT DE PASSE OUBLIE",
          [
            {
              type: "p",
              p: [
                "Bonjour,",
                "Vous recevez ce mail car vous avez demandé le renouvellement de votre mot de passe sur le Portail VAO Instructeurs.",
                "Pour définir un nouveau mot de passe, veuillez cliquer sur lien ci dessous.",
              ],
            },
            {
              type: "link",
              link,
              text: "Changer mon mot de passe",
            },
          ],
          "L'équipe du SI VAO",
        );

        const params = {
          from: senderEmail,
          replyTo: senderEmail,
          to: email,
          subject: `Portail VAO Instructeurs - Renouvellement du mot de passe`,
          html,
        };
        log.d("sendForgottenPassword post email", { params });

        return params;
      },
      sendOtp: ({ mail, codeTemp }) => {
        log.i("sendOtp - In", mail);

        const html = sendTemplate.getBody(
          "PORTAIL VAO INSTRUCTEURS - AUTHENTIFICATION PAR CODE",
          [
            {
              type: "p",
              p: [
                "Bonjour,",
                "Vous recevez ce mail car vous souhaitez accéder au Portail VAO Instructeurs.",
                "Pour accéder au portail, veuillez entrer le code ci dessous.",
              ],
            },
            {
              type: "code",
              code: codeTemp,
            },
          ],
          "L'équipe du SI VAO",
        );

        const params = {
          from: senderEmail,
          to: mail,
          replyTo: senderEmail,
          subject: "Portail VAO Instructeurs - code authentification",
          html,
        };

        log.d("sendOtp - DONE", { params });

        return params;
      },
      sendActivation: (dataMail) => {
        log.i("sendActivation - In");
        const expireIn = config.validationToken.expiresIn / 1000;
        const token = jwt.sign(
          buildValidationToken(dataMail.idUser, dataMail.datefinValidite),
          `${config.validationToken.secret}`,
          {
            expiresIn: expireIn,
          },
        );

        const link = `${frontBODomain}/connexion/validation/${token}?id=${dataMail.idUser}`;
        const duree = expireIn / 3600;

        const html = sendTemplate.getBody(
          "PORTAIL VAO INSTRUCTEURS - ACTIVATION DE COMPTE",
          [
            {
              type: "p",
              p: [
                "Bonjour,",
                "Vous recevez ce mail car votre compte vient d'être réactivé sur le Portail VAO Instructeurs.",
                `Pour activer votre compte, veuillez cliquer sur lien ci dessous. Attention, ce lien ne sera valable que ${duree} heures`,
              ],
            },
            {
              type: "link",
              link,
              text: "Activer votre compte",
            },
          ],
          "L'équipe du SI VAO",
        );

        const params = {
          from: senderEmail,
          to: dataMail.mail,
          replyTo: senderEmail,
          subject: "Portail VAO Instructeurs - Activation de compte",
          html,
        };

        log.d("sendActivation - DONE", { params });

        return params;
      },
      sendReactivation: ({ email, token, idUser }) => {
        log.i("sendReactivation - In", {
          email,
          token,
        });
        if (!email) {
          const message = `Le paramètre email manque à la requête`;
          log.w(`sendReactivation - ${message}`);
          throw new AppError(message);
        }
        if (!token) {
          const message = `Le paramètre token manque à la requête`;
          log.w(`sendReactivation - ${message}`);
          throw new AppError(message);
        }

        const link = `${frontBODomain}/connexion/validation/${token}?id=${idUser}`;
        log.d("sendReactivation - sending reactivate mail");

        const html = sendTemplate.getBody(
          "PORTAIL VAO INSTRUCTEURS - ACTIVATION DE COMPTE",
          [
            {
              type: "p",
              p: [
                "Bonjour,",
                "Vous recevez ce mail car votre compte vient d'être réactivé sur le Portail VAO Instructeurs.",
                "Pour activer votre compte, veuillez cliquer sur lien ci dessous.",
              ],
            },
            {
              type: "link",
              link,
              text: "Valider votre mail",
            },
          ],
          "L'équipe du SI VAO",
        );

        const params = {
          from: senderEmail,
          replyTo: senderEmail,
          to: email,
          subject: `Portail VAO Instructeurs - Valider votre email`,
          html,
        };
        log.d("sendReactivation post email", { params });

        return params;
      },
    },
  },
};
