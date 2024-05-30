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
          subject: `Portail VAO Administration - Réinitialisation du mot de passe`,
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
    declarationSejour: {
      sendDeclarationA8joursNotify: ({
        declaration,
        destinataires,
        cc,
        departementSuivi,
        departementsSecondaires,
      }) => {
        log.i("sendDeclarationA8joursNotify - In", {
          destinataires,
        });
        if (!destinataires) {
          const message = `Le paramètre destinataires manque à la requête`;
          log.w(`sendDeclarationA8joursNotify - ${message}`);
          throw new AppError(message);
        }

        const params = {
          cc,
          from: senderEmail,
          html: `
                <p>Bonjour,</p>

                <p>La déclaration de séjour ${declaration.idFonctionnelle} à 8 jours vient d'être déposée sur le portail VAO</p>
                <p>La DDETS du département ${departementSuivi} est en charge de l'instruction de cette déclaration.</p>
                ${
                  departementsSecondaires.length > 0
                    ? `<p>Les départements ${departementsSecondaires.join(", ")} sont en charge du contrôle d'au moins un hébergement.</p>`
                    : ""
                }
                `,
          replyTo: senderEmail,
          subject: `Portail VAO - déclaration à 8 jours déposée : ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendDeclarationA8joursNotify post email", {
          params,
        });

        return params;
      },
      sendDeclarationNotify: ({
        declaration,
        destinataires,
        cc,
        departementSuivi,
        departementsSecondaires,
      }) => {
        log.i("sendDeclarationNotify - In", {
          destinataires,
        });
        if (!destinataires) {
          const message = `Le paramètre destinataires manque à la requête`;
          log.w(`sendDeclarationNotify - ${message}`);
          throw new AppError(message);
        }

        const params = {
          cc,
          from: senderEmail,
          html: `
                <p>Bonjour,</p>

                <p>La déclaration de séjour ${declaration.idFonctionnelle} vient d'être déposée sur le portail VAO</p>
                <p>La DDETS du département ${departementSuivi} est en charge de l'instruction de cette déclaration.</p>
                ${
                  departementsSecondaires.length > 0
                    ? `<p>Les départements ${departementsSecondaires.join(", ")} sont en charge du contrôle d'au moins un hébergement.</p>`
                    : ""
                }
                `,
          replyTo: senderEmail,
          subject: `Portail VAO - Nouvelle déclaration déposée : ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendDeclarationNotify post email", {
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
                <p>Cordialement,</p>
                <p>L'équipe VAO</p>
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
                <p>Cordialement,</p>
                <p>L'équipe VAO</p>
                `,
          replyTo: senderEmail,
          subject: `Portail VAO - Validez votre email`,
          to: email,
        };
        log.d("sendValidationMail post email", {
          params,
        });

        return params;
      },
    },
    declarationSejour: {
      sendACompleterMail: ({
        destinataires,
        comment,
        declaration,
        territoireCode,
      }) => {
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
                <p>Vous avez reçu des demandes de complément pour votre déclaration ${declaration.idFonctionnelle} </p>
                <p>Vous trouverez ci-joint le message de la DDETS ${territoireCode}</p>
                <pre>${comment}</pre>
                <p>Cordialement,</p>
                <p>L'équipe VAO</p>
                `,
          replyTo: senderEmail,
          subject: `Portail VAO - Demande de compléments sur la déclaration ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendACompleterMail post email", {
          params,
        });

        return params;
      },
      sendAccuseReception2MoisMail: ({ destinataires, declaration }) => {
        log.i("sendEnregistrementA2MoisMail - In", {
          destinataires,
        });
        if (!destinataires) {
          const message = `Le paramètre destinataires manque à la requête`;
          log.w(`sendEnregistrementA2MoisMail - ${message}`);
          throw new AppError(message);
        }

        const params = {
          from: senderEmail,
          html: `
          <p>Bonjour,</p>
          <p>Vous êtes titulaire de l’agrément « Vacances adaptées organisées » délivré le ${dayjs(declaration.organisme.agrement.dateObtention).format("DD/MM/YYYY")} et avez déposé en date du   
          ${dayjs(declaration.attestation.at).format("DD/MM/YYYY")}, une déclaration pour le séjour « ${declaration.libelle} » que vous organisez du ${dayjs(declaration.hebergement.dateDebut).format("DD/MM/YYYY")} au ${dayjs(declaration.hebergement.dateFin).format("DD/MM/YYYY")}.</p>
          <p>Nous accusons ce jour, le ${dayjs().format("DD/MM/YYYY")}, réception de votre déclaration ${declaration.idFonctionnelle}.<.p>
          <p>Vous devrez, huit jours avant le déroulement de ce séjour, réaliser la déclaration complémentaire prévue à l’article R. 412-14 du code du tourisme.</p>
          <p>Cordialement,</p>
          <p>L'équipe VAO</p>
          `,
          replyTo: senderEmail,
          subject: `Portail VAO - Enregistrement de la déclaration ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendEnregistrementA2MoisMail post email", {
          params,
        });

        return params;
      },
      sendAccuseTransmission2mois: ({ dest, cc, declaration }, firstSubmit) => {
        log.i("sendAccuseTransmission2mois - In", {
          cc,
          dest,
        });
        if (!dest || !declaration) {
          const message = `paramètre manquant à la requête`;
          log.w(`sendForgottenPassword - ${message}`);
          throw new AppError(message);
        }

        log.d(
          "sendAccuseTransmission2mois - sending sendAccuseTransmission2mois mail",
        );
        const params = {
          cc: cc,
          from: senderEmail,
          html: `
                <p>Bonjour,</p>
                <p>Votre déclaration de séjour n°${declaration.idFonctionnelle} a bien été transmise au(x) service(s) instructeur(s) le ${dayjs().format("DD/MM/YYYY")}.</p>
                <p>Cordialement,</p>
                <p>L'équipe VAO</p>
                `,
          replyTo: senderEmail,
          subject: `Portail VAO - ${firstSubmit ? "Transmission de la déclaration de séjour" : "Transmission de complément sur la déclaration de séjour"} VAO n°${declaration.idFonctionnelle}`,
          to: dest,
        };
        log.d("sendAccuseTransmission2mois post email", { params });

        return params;
      },
      sendAccuseTransmission8jours: ({ cc, declaration, dest }) => {
        log.i("sendAccuseTransmission8jours - In", {
          cc,
          dest,
        });
        if (!dest || !declaration) {
          const message = `paramètre manquant à la requête`;
          log.w(`sendForgottenPassword - ${message}`);
          throw new AppError(message);
        }

        log.d(
          "sendAccuseTransmission8jours - sending sendAccuseTransmission8jours mail",
        );
        const params = {
          cc: cc,
          from: senderEmail,
          html: `
              <p>Bonjour,</p>
              <p>Votre déclaration à 8 jours n°${declaration.idFonctionnelle} a bien été transmise au(x) service(s) instructeur(s) le ${dayjs().format("DD/MM/YYYY")}.</p>
              <p>Cordialement,</p>
              <p>L'équipe VAO</p>
              `,
          replyTo: senderEmail,
          subject: `Portail VAO - "Transmission de la déclaration de séjour à 8 jours n°${declaration.idFonctionnelle}`,
          to: dest,
        };
        log.d("sendAccuseTransmission8jours post email", { params });

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
                <p>Votre déclaration ${declaration.idFonctionnelle} a été refusée.</p>
                <p>En voici les raisons : </p>
                <pre>${comment}</pre>
                <p>Cordialement,</p>
                <p>L'équipe VAO</p>
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
    },
  },
};
