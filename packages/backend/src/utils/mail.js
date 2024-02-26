const jwt = require("jsonwebtoken");
const { senderEmail, frontUsagersDomain, frontBODomain } = require("../config");

const config = require("../config");
const sendTemplate = require("../helpers/mail");

const logger = require("./logger");
const { buildValidationToken } = require("./token");
const AppError = require("./error");

const log = logger(module.filename);

module.exports = {
  bo: {
    authentication: {
      sendActivationMail: (dataMail) => {
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
          "PORTAIL VAO ADMINISTRATION - ACTIVATION DE COMPTE",
          [
            {
              p: [
                "Bonjour,",
                "Vous recevez ce mail car votre compte vient d'être réactivé sur le Portail VAO Administration.",
                `Pour activer votre compte, veuillez cliquer sur lien ci dessous. Attention, ce lien ne sera valable que ${duree} heures`,
              ],
              type: "p",
            },
            {
              link,
              text: "Activer votre compte",
              type: "link",
            },
          ],
          "L'équipe du SI VAO",
        );

        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: "Portail VAO Administration - Activation de compte",
          to: dataMail.mail,
        };

        log.d("sendActivation - DONE", { params });

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
    
                <p>Vous recevez ce mail car vous vous êtes inscrit sur le portail VAO Administration</p>
    
                <p>Afin de bénéficier de toutes les fonctionnalités, veuillez valider votre email en cliquant sur le lien suivant:</p>
    
                <p><a href="${frontBODomain}/connexion/validation?token=${token}">J'active mon compte.</a></p>
                `,
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
          html: `
                <p>Bonjour,</p>
    
                <p>Vous recevez ce mail car vous vous êtes inscrit sur le portail VAO.</p>
    
                <p>Votre email a bien été validé. Vous pouvez continuer la procédure de création de compte en vous connectant à nouveau sur le portail VAO.</p>
    
                <p><a href="${frontUsagersDomain}/mon-compte">Je complète mon compte.</a></p>
                `,
          replyTo: senderEmail,
          subject: `Portail VAO - Votre email a été validé`,
          to: email,
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
          html: `
                <p>Bonjour,</p>
    
                <p>Vous recevez ce mail car vous ne trouvez plus votre mot de passe sur le portail VAO</p>
    
                <p>Afin de modifier votre mot de passe, veuillez cliquer sur le lien suivant qui vous redirigera vers le portail :</p>
    
                <p><a href="${frontUsagersDomain}/connexion/reset-mot-de-passe?token=${token}">Je renouvelle mon mot de passe</a></p>
                `,
          replyTo: senderEmail,
          subject: `Portail VAO - Renouvellement du mot de passe`,
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
    
                <p>Vous recevez ce mail car vous vous êtes inscrit sur le portail VAO</p>
    
                <p>Afin de bénéficier de toutes les fonctionnalités, veuillez valider votre email en cliquant sur le lien suivant:</p>
    
                <p><a href="${frontUsagersDomain}/connexion/validation?token=${token}">J'active mon compte.</a></p>
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
  },
};
