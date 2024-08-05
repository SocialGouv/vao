const dayjs = require("dayjs");
const { senderEmail, frontUsagersDomain, frontBODomain } = require("../config");

const config = require("../config");
const sendTemplate = require("../helpers/mail");

const logger = require("./logger");
const AppError = require("./error");
const { mapEigToLabel } = require("../helpers/eig");
const { generateTypes } = require("../helpers/eigMail");

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
          `L'équipe du SI VAO<BR><a href=${frontBODomain}>Portail VAO</a>`,
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
                "Attention, ce lien n’est valable qu’une heure. Si celui-ci est expiré, vous pouvez en générer un nouveau en suivant le lien d’activation",
              ],
              type: "p",
            },
            {
              link,
              text: "Activer mon compte",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontBODomain}>Portail VAO</a>`,
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

        const link = `${frontBODomain}/sejours/${declaration.id}`;

        const html = sendTemplate.getBody(
          "PORTAIL VAO ADMINISTRATION - DECLARATION A 8 JOURS DEPOSEE",
          [
            {
              p: [
                "Bonjour,",
                `La déclaration de séjour à 8 jours ${declaration.idFonctionnelle} vient d'être déposée sur le portail VAO.`,
                `La DDETS du département ${departementSuivi} est en charge de l'instruction de cette déclaration.`,
                `${
                  departementsSecondaires.length > 0
                    ? `<p>Les départements ${departementsSecondaires.join(", ")} sont en charge du contrôle d'au moins un hébergement.</p>`
                    : ""
                }`,
              ],
              type: "p",
            },
            {
              link,
              text: "Accéder à la déclaration",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontBODomain}>Portail VAO</a>`,
        );

        const params = {
          cc,
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Portail VAO - déclaration à 8 jours déposée : ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendDeclarationA8joursNotify post email", {
          params,
        });

        return params;
      },
      sendDeclarationCanceled: ({ declaration, destinataires }) => {
        log.i("sendDeclarationCanceled - In", {
          destinataires,
        });
        if (!destinataires) {
          const message = `Le paramètre destinataires manque à la requête`;
          log.w(`sendDeclarationCanceled - ${message}`);
          throw new AppError(message);
        }

        const link = `${frontBODomain}/sejours/`;

        const html = sendTemplate.getBody(
          `Portail VAO - Déclaration annulée : ${declaration.idFonctionnelle}`,
          [
            {
              p: [
                "Bonjour,",
                `La déclaration ${declaration.idFonctionnelle}, «${declaration.libelle}», vient d'être annulée par l'organisateur sur le portail VAO`,
                "Il n'y a plus aucune action à effectuer dessus.",
              ],
              type: "p",
            },
            {
              link,
              text: "Liste des déclarations en cours",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontBODomain}>Portail VAO</a>`,
        );

        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Portail VAO - Déclaration annulée : ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendDeclarationCanceled post email", {
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

        const link = `${frontUsagersDomain}/demande-sejour/${declaration.id}`;

        const html = sendTemplate.getBody(
          "PORTAIL VAO ADMINISTRATION - NOUVELLE DECLARATION DE SEJOUR",
          [
            {
              p: [
                "Bonjour,",
                `La déclaration de séjour ${declaration.idFonctionnelle} vient d'être déposée sur le portail VAO.`,
                `La DDETS du département ${departementSuivi} est en charge de l'instruction de cette déclaration.`,
                `${
                  departementsSecondaires.length > 0
                    ? `<p>Les départements ${departementsSecondaires.join(", ")} sont en charge du contrôle d'au moins un hébergement.</p>`
                    : ""
                }`,
              ],
              type: "p",
            },
            {
              link,
              text: "Accéder à ma déclaration",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>${frontUsagersDomain}</a>`,
        );

        const params = {
          cc,
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Portail VAO - Nouvelle déclaration déposée : ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendDeclarationNotify post email", {
          params,
        });

        return params;
      },
      sendMessageNotify: ({ declaration, destinataires }) => {
        log.i("sendMessageNotify - In", {
          destinataires,
        });
        if (!destinataires) {
          const message = `Le paramètre destinataires manque à la requête`;
          log.w(`sendMessageNotify - ${message}`);
          throw new AppError(message);
        }

        const params = {
          from: senderEmail,
          html: `
                <p>Bonjour,</p>

                <p>Un message vous a été adressé sur la déclaration <a href="${frontBODomain}/sejours/${declaration.id}">${declaration.idFonctionnelle}</a>, onglet Messagerie.</p>

                <p>Cordialement,</p>
                <p>L'équipe VAO</p>
                `,
          replyTo: senderEmail,
          subject: `nouveau message sur la déclaration ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendMessageNotify post email", {
          params,
        });

        return params;
      },
    },
    eig: {
      sendToAutre: ({ dest, eig, userName, departementName, regionName }) => {
        log.i("sendToDREETS - In", {
          dest,
        });
        if (!dest) {
          const message = `paramètre manquant à la requête`;
          log.w(`sendToDREETS - ${message}`);
          throw new AppError(message);
        }

        const orgName = eig.raisonSociale ?? `${eig?.prenom} ${eig?.nom}`;
        const link = `${frontBODomain}/eig/${eig.id}`;

        const html = sendTemplate.getBody(
          "Portail VAO - Déclaration d’un Evènement indésirable grave",
          [
            {
              p: [
                `Bonjour`,
                `${userName} a déclaré un évènement indésirable grave survenu lors du séjour ${eig.idFonctionnelle}, ${eig.libelle}, organisé par ${orgName}`,
                `Le qualificatif de l’incident est :`,
                generateTypes(eig),
              ],
              type: "p",
            },
            {
              link,
              text: "Vous pouvez retrouver les détails de cet EIG dans votre espace VAO en cliquant ici",
              type: "link",
            },
            {
              p: [
                `Cette déclaration a été envoyée à la préfecture du département de ${departementName} ainsi qu'à la région ${regionName}`,
                "Cordialement",
              ],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        log.d("sendToDREETS - sending sendToDDETS mail");
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Déclaration d’un Evènement indésirable grave par ${orgName}`,
          to: dest,
        };
        log.d("sendToDREETS post email", { params });

        return params;
      },
      sendToDDETS: ({ dest, eig }) => {
        log.i("sendToDDETS - In", {
          dest,
        });
        if (!dest) {
          const message = `paramètre manquant à la requête`;
          log.w(`sendToDDETS - ${message}`);
          throw new AppError(message);
        }

        const orgName = eig.raisonSociale ?? `${eig?.prenom} ${eig?.nom}`;
        const link = `${frontBODomain}/eig/${eig.id}`;

        const html = sendTemplate.getBody(
          "Portail VAO - Déclaration d’un Evènement indésirable grave",
          [
            {
              p: [
                `Bonjour`,
                `L’organisme ${orgName} a déclaré un évènement indésirable grave lors du séjour ${eig.idFonctionnelle}, ${eig.libelle}, qui s’est déroulé dans votre département.`,
                `Le type d'évènement est :`,
                generateTypes(eig),
              ],
              type: "p",
            },
            {
              link,
              text: "Vous pouvez retrouver les détails de cet EIG dans votre espace VAO en cliquant ici",
              type: "link",
            },
            {
              p: ["Cordialement"],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        log.d("sendToDDETS - sending sendToDDETS mail");
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Déclaration d’un Evènement indésirable grave par ${orgName}`,
          to: dest,
        };
        log.d("sendToDDETS post email", { params });

        return params;
      },
      sendToDREETS: ({ dest, eig, departementName }) => {
        log.i("sendToDREETS - In", {
          dest,
        });
        if (!dest) {
          const message = `paramètre manquant à la requête`;
          log.w(`sendToDREETS - ${message}`);
          throw new AppError(message);
        }

        const orgName = eig.raisonSociale ?? `${eig?.prenom} ${eig?.nom}`;
        const link = `${frontBODomain}/eig/${eig.id}`;

        const html = sendTemplate.getBody(
          "Portail VAO - Déclaration d’un Evènement indésirable grave",
          [
            {
              p: [
                `Bonjour`,
                `L’organisme ${orgName}, qui a reçu son agrément dans votre région, a déclaré un évènement indésirable grave lors du séjour  ${eig.idFonctionnelle}, ${eig.libelle}, qui s’est déroulé dans le département ${departementName} `,
                `Le type d'évènement est :`,
                generateTypes(eig),
              ],
              type: "p",
            },
            {
              link,
              text: "Vous pouvez retrouver les détails de cet EIG dans votre espace VAO en cliquant ici",
              type: "link",
            },
            {
              p: ["Cordialement"],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        log.d("sendToDREETS - sending sendToDDETS mail");
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Déclaration d’un Evènement indésirable grave par ${orgName}`,
          to: dest,
        };
        log.d("sendToDREETS post email", { params });

        return params;
      },
      sendMarkAsRead: ({ dest, eig }) => {
        log.i("sendMarkAsRead - In", {
          dest,
        });
        if (!dest) {
          const message = `paramètre manquant à la requête`;
          log.w(`sendMarkAsRead - ${message}`);
          throw new AppError(message);
        }

        const html = sendTemplate.getBody(
          "Consultation de votre EIG déposé sur la plateforme VAO",
          [
            {
              p: [
                `Bonjour`,
                `Le rapport de l'évènement indésirable grave que vous avez déposé le ${dayjs(eig.dateDepot).format("DD/MM/YYYY")} et qui s’est déroulé lors du séjour ${eig.libelle} a été consulté par un agent de la préfecture. Si c’est nécessaire, cette personne pourra vous contacter via la messagerie de la plateforme VAO`,
                `Cordialement,`,
              ],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        log.d("sendMarkAsRead - sending sendMarkAsRead mail");
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Consultation de votre EIG déposé sur la plateforme VAO`,
          to: dest,
        };
        log.d("sendMarkAsRead post email", { params });

        return params;
      },
      sendToOrganisme: ({
        dest,
        eig,
        userName,
        departementName,
        regionName,
      }) => {
        log.i("sendToDREETS - In", {
          dest,
        });
        if (!dest) {
          const message = `paramètre manquant à la requête`;
          log.w(`sendToDREETS - ${message}`);
          throw new AppError(message);
        }

        const orgName = eig.raisonSociale ?? `${eig?.prenom} ${eig?.nom}`;
        const link = `${frontBODomain}/eig/${eig.id}`;

        const html = sendTemplate.getBody(
          "Portail VAO - Déclaration d’un Evènement indésirable grave",
          [
            {
              p: [
                `Bonjour`,
                `${userName} a déclaré un évènement indésirable grave survenu lors du séjour ${eig.idFonctionnelle}, ${eig.libelle}`,
                `Le qualificatif de l’incident est :`,
                generateTypes(eig),
              ],
              type: "p",
            },
            {
              link,
              text: "Vous pouvez retrouver les détails de cet EIG dans votre espace VAO en cliquant ici",
              type: "link",
            },
            {
              p: [
                `Cette déclaration a été envoyée à la préfecture du département de ${departementName} ainsi qu'à la région ${regionName}`,
                "Cordialement",
              ],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        log.d("sendToDREETS - sending sendToDDETS mail");
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Déclaration d’un Evènement indésirable grave par ${orgName}`,
          to: dest,
        };
        log.d("sendToDREETS post email", { params });

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

        const link = `${frontUsagersDomain}/connexion/reset-mot-de-passe?token=${token}`;

        const html = sendTemplate.getBody(
          "Portail VAO - Réinitialisation du mot de passe",
          [
            {
              p: [
                "Bonjour,",
                "Vous recevez ce mail car vous ne trouvez plus votre mot de passe sur le portail VAO",
                "Afin de modifier votre mot de passe, veuillez cliquer sur le lien ci dessous qui vous redirigera vers le portail",
              ],
              type: "p",
            },
            {
              link,
              text: "Je réinitialise mon mot de passe",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        const params = {
          from: senderEmail,
          html,
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

        const link = `${frontUsagersDomain}/connexion/validation?token=${token}`;

        const html = sendTemplate.getBody(
          "Portail VAO - Validation de votre email",
          [
            {
              p: [
                "Bonjour,",
                "Pour finaliser la création de votre compte sur la plateforme VAO, confirmez votre adresse e-mail en cliquant sur le lien ci dessous",
                "Afin de modifier votre mot de passe, veuillez cliquer sur le lien ci dessous qui vous redirigera vers le portail",
              ],
              type: "p",
            },
            {
              link,
              text: "Je valide mon email",
              type: "link",
            },
            {
              p: [
                `Attention, ce lien ne sera valide que pendant ${config.validationToken.expiresIn / 60000} minutes.`,
              ],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        log.d("sendValidationMail - sending validation mail");
        const params = {
          from: senderEmail,
          html,
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

        const link = `${frontUsagersDomain}/demande-sejour/${declaration.id}`;

        const html = sendTemplate.getBody(
          "Portail VAO - demande de complément",
          [
            {
              p: [
                "Bonjour,",
                `Vous avez reçu des demandes de complément pour votre déclaration ${declaration.idFonctionnelle}`,
                `Vous trouverez ci-joint le message de la DDETS ${territoireCode}`,
              ],
              type: "p",
            },
            {
              p: [`${comment}`],
              type: "p",
            },
            {
              link,
              text: "Accéder à ma déclaration",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        const params = {
          from: senderEmail,
          html,
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
        const link = `${frontUsagersDomain}/demande-sejour/${declaration.id}`;

        const html = sendTemplate.getBody(
          "Portail VAO - accusé de réception de déclaration de séjour",
          [
            {
              p: [
                "Bonjour,",
                `Vous êtes titulaire de l’agrément « Vacances adaptées organisées » délivré le ${dayjs(declaration.organisme.agrement.dateObtention).format("DD/MM/YYYY")} et avez déposé en date du
          ${dayjs(declaration.attestation.at).format("DD/MM/YYYY")}, une déclaration pour le séjour « ${declaration.libelle} » que vous organisez du ${dayjs(declaration.dateDebut).format("DD/MM/YYYY")} au ${dayjs(declaration.dateFin).format("DD/MM/YYYY")}.`,
                `Nous accusons ce jour, le ${dayjs().format("DD/MM/YYYY")}, réception de votre déclaration ${declaration.idFonctionnelle}.`,
                `Vous devrez, huit jours avant le déroulement de ce séjour, réaliser la déclaration complémentaire prévue à l’article R. 412-14 du code du tourisme.`,
              ],
              type: "p",
            },
            {
              link,
              text: "Accéder à ma déclaration",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Portail VAO - Enregistrement de la déclaration ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendEnregistrementA2MoisMail post email", {
          params,
        });

        return params;
      },
      sendAccuseReception8JoursMail: ({ destinataires, declaration }) => {
        log.i("sendAccuseReception8JoursMail - In", {
          destinataires,
        });

        if (!destinataires) {
          const message = `Le paramètre destinataires manque à la requête`;
          log.w(`sendAccuseReception8JoursMail - ${message}`);
          throw new AppError(message);
        }

        const link = `${frontUsagersDomain}/demande-sejour/${declaration.id}`;

        const html = sendTemplate.getBody(
          "Portail VAO - accusé de réception de déclaration complémentaire ",
          [
            {
              p: [
                "Bonjour,",
                `Vous êtes titulaire de l’agrément « Vacances adaptées organisées » délivré le ${dayjs(declaration.organisme.agrement.dateObtention).format("DD/MM/YYYY")} et avez déposé en date du
          ${dayjs(declaration.attestation.at).format("DD/MM/YYYY")}, une déclaration complémentaire pour le séjour « ${declaration.libelle} » que vous organisez du ${dayjs(declaration.dateDebut).format("DD/MM/YYYY")} au ${dayjs(declaration.dateFin).format("DD/MM/YYYY")}.`,
                `Nous accusons ce jour, le ${dayjs().format("DD/MM/YYYY")}, réception de votre déclaration ${declaration.idFonctionnelle}.`,
              ],
              type: "p",
            },
            {
              link,
              text: "Accéder à ma déclaration",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Portail VAO - Enregistrement de la déclaration ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendAccuseReception8JoursMail post email", {
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

        const link = `${frontUsagersDomain}/demande-sejour/${declaration.id}`;

        const html = sendTemplate.getBody(
          `Portail VAO - ${firstSubmit ? "Transmission de la déclaration de séjour" : "Transmission de complément sur la déclaration de séjour"}`,
          [
            {
              p: [
                "Bonjour,",
                `Votre déclaration de séjour n°${declaration.idFonctionnelle} a bien été transmise au(x) service(s) instructeur(s) le ${dayjs().format("DD/MM/YYYY")}.`,
              ],
              type: "p",
            },
            {
              link,
              text: "Accéder à ma déclaration",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );
        const params = {
          cc: cc,
          from: senderEmail,
          html,
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

        const link = `${frontUsagersDomain}/demande-sejour/${declaration.id}`;

        const html = sendTemplate.getBody(
          "Portail VAO - Transmission de la déclaration de séjour à 8 jours",
          [
            {
              p: [
                "Bonjour,",
                `Votre déclaration à 8 jours n°${declaration.idFonctionnelle} a bien été transmise au(x) service(s) instructeur(s) le ${dayjs().format("DD/MM/YYYY")}.`,
              ],
              type: "p",
            },
            {
              link,
              text: "Accéder à ma déclaration",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        log.d(
          "sendAccuseTransmission8jours - sending sendAccuseTransmission8jours mail",
        );
        const params = {
          cc: cc,
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Portail VAO - "Transmission de la déclaration de séjour à 8 jours n°${declaration.idFonctionnelle}`,
          to: dest,
        };
        log.d("sendAccuseTransmission8jours post email", { params });

        return params;
      },
      sendCanceledMail: ({ destinataires, declaration }) => {
        log.i("sendCanceledMail - In", {
          destinataires,
        });
        if (!destinataires) {
          const message = `Le paramètre destinataires manque à la requête`;
          log.w(`sendCanceledMail - ${message}`);
          throw new AppError(message);
        }

        const link = `${frontUsagersDomain}/demande-sejour/liste`;

        const html = sendTemplate.getBody(
          "Portail VAO - Déclaration annulée",
          [
            {
              p: [
                "Bonjour,",
                `Votre déclaration ${declaration.idFonctionnelle} a bien été annulée à votre demande.`,
                "Les services compétents ont été avisés de cette annulation.",
              ],
              type: "p",
            },
            {
              link,
              text: "Accéder à mes déclarations",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Portail VAO - Déclaration annulée : ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendCanceledMail post email", {
          params,
        });

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

        const link = `${frontUsagersDomain}/demande-sejour/liste`;

        const html = sendTemplate.getBody(
          "Portail VAO - Déclaration annulée",
          [
            {
              p: [
                "Bonjour,",
                `Votre déclaration ${declaration.idFonctionnelle} a été refusée pour les raisons indiquées ci dessous.`,
              ],
              type: "p",
            },
            {
              p: [`${comment}`],
              type: "p",
            },
            {
              link,
              text: "Accéder à mes déclarations",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        const params = {
          from: senderEmail,
          html,
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
