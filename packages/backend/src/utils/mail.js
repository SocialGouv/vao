const dayjs = require("dayjs");
const { senderEmail, frontUsagersDomain, frontBODomain } = require("../config");

const config = require("../config");
const sendTemplate = require("../helpers/mail");

const logger = require("./logger");
const AppError = require("./error");
const { generateTypes } = require("../helpers/eigMail");
const { partOrganisme } = require("../helpers/org-part");

const log = logger(module.filename);

const assistanceText = `Si vous avez besoin d’accompagnement, vous pouvez contacter notre <a href='${config.assistance.uriFaq}'>équipe support</a>`;

module.exports = {
  bo: {
    action: {
      sendAccountDeletionMail: ({ email }) => {
        log.i("sendAccountDeletionMail - In", {
          email,
        });
        if (!email) {
          const message = `Le paramètre de l'adresse courriel manque à la requête`;
          log.w(`sendForgottenPassword - ${message}`);
          throw new AppError(message);
        }
        log.d("sendAccountDeletionMail - sending mail on deletion");
        const html = sendTemplate.getBody(
          "PORTAIL VAO ADMINISTRATION - DESACTIVATION DE VOTRE COMPTE",
          [
            {
              p: [
                "Bonjour,",
                `Nous vous informons que votre compte associé à l’adresse <strong>${email}</strong> a été <strong>désactivé</strong> par un administrateur sur le portail VAO.`,
                "Si vous estimez qu’il s’agit d’une erreur ou si vous avez besoin d’un accès à nouveau, vous pouvez :",
                `<ul><li>Contacter votre administrateur référent, ou</li><li>Contacter le support en <a href=${config.assistance.uriNewRequest}>cliquant ici</a>.</li></ul>`,
              ],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontBODomain}>Portail VAO</a>`,
        );

        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: "PORTAIL VAO ADMINISTRATION - DESACTIVATION DE VOTRE COMPTE",
          to: email,
        };
        log.d("sendAccountDeletionMail post email", { params });

        return params;
      },
    },
    authentication: {
      sendForgottenPassword: ({ email, token }) => {
        log.i("sendForgottenPassword - In", {
          email,
          token,
        });
        if (!email) {
          const message = `Le paramètre de l'adresse courriel manque à la requête`;
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
          const message = `Le paramètre de l'adresse courriel manque à la requête`;
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
          subject: `Portail VAO Administration - Validez votre courriel`,
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

        const link = `${frontBODomain}/sejours?statuts=TRANSMISE`;

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
              text: "Accéder aux déclarations transmises",
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

        const link = `${frontBODomain}/sejours?statuts=TRANSMISE`;

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
              text: "Accéder aux déclarations transmises",
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
      sendMessageNotify: ({ declaration, destinataires, message }) => {
        log.i("sendMessageNotify - In", {
          destinataires,
        });
        if (!destinataires) {
          const message = `Le paramètre destinataires manque à la requête`;
          log.w(`sendMessageNotify - ${message}`);
          throw new AppError(message);
        }
        const link = `${frontBODomain}/sejours/${declaration.id}`;
        const html = sendTemplate.getBody(
          "Portail VAO - Nouveau message",
          [
            {
              p: [
                "Bonjour,",
                `Le message ci dessous vous a été adressé relativement à la déclaration ${declaration.idFonctionnelle}. Il est consultable dans l'onglet Messagerie.`,
              ],
              type: "p",
            },
            {
              p: [`${message}`],
              type: "quote",
            },
            {
              link,
              text: "Accéder à ma déclaration",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontBODomain}>Portail VAO</a>`,
        );
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `nouveau message sur la déclaration ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendMessageNotify post email", {
          params,
        });

        return params;
      },
      sendUpdateValide8jours: ({
        declaration,
        destinataires,
        message,
        dataUpdated,
        type,
      }) => {
        log.i("sendMessageNotify - In", {
          destinataires,
        });
        if (!destinataires) {
          const messageErreur = `Le paramètre destinataires manque à la requête`;
          log.w(`sendMessageNotify - ${messageErreur}`);
          throw new AppError(messageErreur);
        }
        const content = [
          "Bonjour",
          `L’organisme ${declaration.organisme.typeOrganisme === partOrganisme.PERSONNE_MORALE ? declaration.organisme.personneMorale.raisonSociale : declaration.organisme.personnePhysique.nom} a apporté une modification au nombre de vacanciers présents lors du séjour ${declaration.libelle} qui se déroule à partir du ${dayjs(declaration.dateDebut).format("DD/MM/YYYY")} dans votre département.`,
          `Les modifications apportées sont les suivantes : `,
        ];
        switch (type) {
          case "informationsVacanciers": {
            content.push(
              `<ul><li>Ancien nombre de vacanciers participant au séjour = ${declaration.informationsVacanciers.effectifPrevisionnel} (Hommes = ${declaration.informationsVacanciers.effectifPrevisionnelHomme}, Femmes = ${declaration.informationsVacanciers.effectifPrevisionnelFemme})</li>`,
              `<li>Nouveau nombre de vacanciers participant au séjour = ${dataUpdated.effectifPrevisionnel.apres} (Hommes = ${dataUpdated?.effectifPrevisionnelHomme?.apres ?? declaration.informationsVacanciers.effectifPrevisionnelHomme}, Femmes = ${dataUpdated?.effectifPrevisionnelFemme?.apres ?? declaration.informationsVacanciers.effectifPrevisionnelFemme})</li></ul>`,
            );
            break;
          }
          case "informationsPersonnel": {
            Object.entries(dataUpdated).map(([key, value]) => {
              const includesKeysPersonnel = [
                { cle: "encadrants", valeur: "personnel d'encadrement" },
                { cle: "accompagnants", valeur: "personnel d'accompagnement" },
                {
                  cle: "prestatairesMedicaments",
                  valeur: "prestataire en charge des médicaments",
                },
                {
                  cle: "prestatairesActivites",
                  valeur: "prestataire en charge des activités",
                },
                {
                  cle: "prestatairesEntretien",
                  valeur: "prestataire en charge de l'entretien",
                },
                {
                  cle: "prestatairesTransport",
                  valeur: "prestataire en charge du transport",
                },
                {
                  cle: "prestatairesRestauration",
                  valeur: "prestataire de restauration",
                },
              ];
              const parts = key.split(".");
              const cleanKey = parts[0];
              const personnelInfo = includesKeysPersonnel.find(
                (item) => item.cle === cleanKey,
              );
              const label = personnelInfo ? personnelInfo.valeur : null;
              message = "";
              if (label) {
                if (value?.avant == null && value?.apres != null) {
                  message = `Ajout d'un ${label} : ${value.apres?.prenom} ${value.apres?.nom}`;
                } else if (value?.avant != null && value?.apres == null) {
                  message = `Suppression d'un ${label} : ${value.avant?.prenom} ${value.avant?.nom}`;
                } else {
                  message = `Modification d'un ${label} ${parts[2]}: ${value?.avant} en ${value.apres}`;
                }
              }
              if (message) {
                content.push(message);
              }
            });
            break;
          }
          default:
            log.d("wrong type");
            throw new AppError(`Type inconnu : ${type}`);
        }
        content.push(
          `Cette modification est inscrite dans l’historique de la déclaration.`,
        );
        const link = `${frontBODomain}/sejours/${declaration.id}/formulaire`;
        const html = sendTemplate.getBody(
          "Portail VAO - Nouveau message",
          [
            {
              p: content,
              type: "p",
            },
            {
              link,
              text: "Accéder à ma déclaration",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontBODomain}>Portail VAO</a>`,
        );
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `VAO - Modification ${type === "informationsVacanciers" ? " du nombre de vacanciers " : " de personnel "} de la déclaration ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendMessageNotify post email", {
          params,
        });

        return params;
      },
    },
    eig: {
      sendMarkAsRead: ({
        dest,
        eig,
        typeReader,
        territoireCode,
        territoireName,
      }) => {
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
                `La déclaration d’un évènement indésirable grave que vous avez déposée le ${dayjs(eig.dateDepot).format("DD/MM/YYYY")} et qui s’est déroulé ${dayjs(eig.date).format("DD/MM/YYYY")} lors du séjour dans le département ${eig.departement}, a été consultée ${typeReader === "DREETS" ? `par un agent de la préfecture de la région ${territoireName}` : `par un agent de la DDETS ${territoireCode} du département ${territoireName}`}. Si c’est nécessaire, cette personne pourra vous contacter via la messagerie de la plateforme VAO. `,
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
      sendToAutre: ({ dest, eig, userName }) => {
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
          `VAO : Déclaration d’un évènement indésirable grave par ${orgName}`,
          [
            {
              p: [
                `Bonjour`,
                `${userName} a déclaré un évènement indésirable grave survenu le ${dayjs(eig.date).format("DD/MM/YYYY")} lors du séjour ${eig.libelle}.`,
                `Le type de l’événement est :`,
                generateTypes(eig),
              ],
              type: "p",
            },
            {
              p: [
                `Vous pouvez retrouver les détails de cet EIG dans votre espace VAO en vous connectant avec votre compte utilisateur nominatif`,
              ],
              type: "p",
            },
            {
              link,
              text: "SE CONNECTER A VAO",
              type: "link",
            },
            {
              p: [
                `Cette déclaration a été envoyée à la direction départementale de l'emploi, du travail, des solidarités et de la protection des populations (DDETS-PP), ainsi qu’à la direction régionale de l’économie, de l’emploi, du travail et des solidarités (DREETS) ayant délivré l’agrément VAO`,
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
      sendToDDETS: ({
        dest,
        eig,
        departementName,
        declarationSejour,
        regionName,
        communeName,
      }) => {
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
          `VAO : Déclaration d’un évènement indésirable grave par ${orgName}`,
          [
            {
              p: [
                `Bonjour`,
                `L’organisme ${orgName} a déclaré un évènement indésirable grave, qui s’est produit le ${dayjs(eig.date).format("DD/MM/YYYY")}, lors d’un séjour de vacances adaptées organisées (VAO), sur la commune de ${communeName} dans votre département ${departementName}`,
                `Référence de la déclaration de séjour : ${declarationSejour.libelle} - ${eig.idFonctionnelle} du ${dayjs(declarationSejour.dateDebut).format("DD/MM/YYYY")} au ${dayjs(declarationSejour.dateFin).format("DD/MM/YYYY")}`,
                `Le type d'évènement déclaré est :`,
                generateTypes(eig),
              ],
              type: "p",
            },
            {
              p: [
                "Vous pouvez retrouver les détails de cet EIG dans votre espace VAO en vous connectant avec votre compte utilisateur nominatif",
              ],
              type: "p",
            },
            {
              link,
              text: "SE CONNECTER A VAO",
              type: "link",
            },
            {
              p: [
                `Cet email a également été envoyé à la DREETS de la région ${regionName} qui a délivré l’agrément de l’organisme déclarant`,
              ],
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
      sendToDREETS: ({
        dest,
        eig,
        departementName,
        declarationSejour,
        communeName,
      }) => {
        log.i("sendToDREETS - In", {
          dest,
        });
        if (!dest) {
          const message = "paramètre manquant à la requête";
          log.w(`sendToDREETS - ${message}`);
          throw new AppError(message);
        }

        const orgName = eig.raisonSociale ?? `${eig?.prenom} ${eig?.nom}`;
        const link = `${frontBODomain}/eig/${eig.id}`;

        const html = sendTemplate.getBody(
          `VAO : Déclaration d’un évènement indésirable grave par ${orgName}`,
          [
            {
              p: [
                "Bonjour",
                `L’organisme ${orgName}, dont l’agrément vacances adaptées organisées (VAO) a été délivré dans votre région, a déclaré un évènement indésirable grave qui s’est produit le ${dayjs(eig.date).format("DD/MM/YYYY")}, lors d’un séjour organisé dans  la commune de ${communeName} dans le département de ${departementName}.`,
                `Référence de la déclaration de séjour : ${declarationSejour.libelle} - ${eig.idFonctionnelle} du ${dayjs(declarationSejour.dateDebut).format("DD/MM/YYYY")} au ${dayjs(declarationSejour.dateFin).format("DD/MM/YYYY")}`,
                `Le type d'évènement déclaré est :`,
                generateTypes(eig),
              ],
              type: "p",
            },
            {
              p: [
                "Vous pouvez retrouver les détails de cet EIG dans votre espace VAO en vous connectant avec votre compte utilisateur nominatif",
              ],
              type: "p",
            },
            {
              link,
              text: "SE CONNECTER A VAO",
              type: "link",
            },
            {
              p: [
                `Cette déclaration d’EIG a également été envoyée à la DDETS du département ${departementName}`,
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
      sendToOrganisme: ({ dest, eig, userName, declarationSejour }) => {
        log.i("sendToOrganisme - In", {
          dest,
        });
        if (!dest) {
          const message = "paramètre manquant à la requête";
          log.w(`sendToOrganisme - ${message}`);
          throw new AppError(message);
        }

        const orgName = eig.raisonSociale ?? `${eig?.prenom} ${eig?.nom}`;
        const link = `${frontUsagersDomain}/eig/${eig.id}`;

        const html = sendTemplate.getBody(
          `VAO : Déclaration d’un évènement indésirable grave par ${orgName}`,
          [
            {
              p: [
                "Bonjour",
                `${userName} a déclaré un évènement indésirable grave survenu le ${dayjs(eig.date).format("DD/MM/YYYY")} lors du séjour ${eig.libelle}.`,
                `Référence de la déclaration de séjour : ${declarationSejour.libelle} - ${eig.idFonctionnelle} du ${dayjs(declarationSejour.dateDebut).format("DD/MM/YYYY")} au ${dayjs(declarationSejour.dateFin).format("DD/MM/YYYY")}`,
                "Le type de l’événement est :",
                generateTypes(eig),
              ],
              type: "p",
            },
            {
              p: [
                "Vous pouvez retrouver les détails de cet EIG dans votre espace VAO en vous connectant avec votre compte utilisateur nominatif",
              ],
              type: "p",
            },
            {
              link,
              text: "SE CONNECTER A VAO",
              type: "link",
            },
            {
              p: [
                `Cette déclaration a été envoyée à l’ova principal titulaire de l'agrément.`,
                `Cette déclaration a été envoyée à la direction départementale de l'emploi, du travail, des solidarités et de la protection des populations (DDETS-PP), ainsi qu’à la direction régionale de l’économie, de l’emploi, du travail et des solidarités (DREETS) ayant délivré l’agrément VAO.`,
              ],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        log.d("sendToOrganisme - sending sendToOrganisme mail");
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: `Déclaration d’un Evènement indésirable grave par ${orgName}`,
          to: dest,
        };
        log.d("sendToOrganisme post email", { params });

        return params;
      },
    },
    newVaoAccount: {
      sendDretsNewAccountValidation: ({ email, user }) => {
        const link = `https://annuaire-entreprises.data.gouv.fr/etablissement/${user.userSiret}`;
        const linkListeUsersOva = `${frontBODomain}/utilisateurs-ova/liste`;
        const html = sendTemplate.getBody(
          "PORTAIL VAO ADMINISTRATION - VALIDATION DE COMPTE",
          [
            {
              p: [
                "Bonjour,",
                "Un utilisateur souhaite rejoindre un organisme au sein de la plateforme VAO.",
                "Voici les informations concernant l’utilisateur : ",
                `- Nom : ${user.nom}`,
                `- Prénom : ${user.prenom}`,
                `- Email : ${user.email}`,
                `- Téléphone : ${user.telephone}`,
              ],
              type: "p",
            },
            {
              p: [
                `Cet utilisateur souhaite ajouter, au sein de la plateforme VAO, l’organisme SIRET : <a href="${link}" target="_blank">siret</a>`,
              ],
              type: "p",
            },
            {
              p: [
                "Vous pouvez cliquer directement sur le lien hypertexte pour accéder aux détails de l’organisme.",
                "Si vous avez un doute, vous pouvez prendre contact avec cette personne avant de traiter la demande.",
              ],
              type: "p",
            },
            {
              link: linkListeUsersOva,
              text: "TRAITER LA DEMANDE",
              type: "link",
            },
          ],
        );
        return {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: "Portail VAO Administration - Validation de compte",
          to: email,
        };
      },
    },
    organisme: {
      sendDreetsChangeSiret: ({
        mailDreets,
        user,
        organisme,
        ancienSiret,
        nouveauSiret,
      }) => {
        const html = sendTemplate.getBody(
          "PORTAIL VAO - CHANGEMENT DE SIRET D'UN OVA",
          [
            {
              p: [
                "Bonjour,",
                "Nous vous informons qu’un changement de numéro de SIRET a été enregistré pour un organisateur titulaire d’un agrément VAO rattaché à votre DREETS.",
                "<strong>Détails de la mise à jour : </strong>",
                `<strong>- Nom de l'OVA : </strong>${
                  organisme.typeOrganisme === "personne_morale"
                    ? organisme.personneMorale.raisonSociale
                    : `${organisme.personnePhysique.prenom} ${
                        organisme.personnePhysique.nomUsage ??
                        organisme.personnePhysique.nomNaissance
                      }`
                }<br>
                <strong>- Ancien siret : </strong>${ancienSiret}<br>
                <strong>- Nouveau siret : </strong>${nouveauSiret}<br>
                <strong>- Date de mise à jour : </strong>${new Date().toLocaleDateString("fr-FR")}<br>
                <strong>- Mise à jour effectuée par : </strong>${user.prenom} ${user.nom} - ${user.email}`,
                "Les informations du nouveau SIRET sont désormais actives dans VAO.",
              ],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        return {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: "Portail VAO - Changement de SIRET d’un OVA",
          to: mailDreets,
        };
      },
    },
  },
  usagers: {
    action: {
      sendAccountDeletionMail: ({ email }) => {
        log.i("sendAccountDeletionMail - In", {
          email,
        });
        if (!email) {
          const message = `Le paramètre de l'adresse courriel manque à la requête`;
          log.w(`sendForgottenPassword - ${message}`);
          throw new AppError(message);
        }
        log.d("sendAccountDeletionMail - sending mail on deletion");
        const html = sendTemplate.getBody(
          "Portail VAO - DESACTIVATION DE VOTRE COMPTE",
          [
            {
              p: [
                "Bonjour,",
                `Nous vous informons que votre compte associé à l’adresse <strong>${email}</strong> a été <strong>désactivé</strong> par un administrateur sur le portail VAO.`,
                "Si vous estimez qu’il s’agit d’une erreur ou si vous avez besoin d’un accès à nouveau, vous pouvez :",
                `<ul><li>Contacter votre administrateur référent, ou</li><li>Contacter le support en <a href=${config.assistance.uriNewRequest}>cliquant ici</a>.</li></ul>`,
              ],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: "Portail VAO - DESACTIVATION DE VOTRE COMPTE",
          to: email,
        };
        log.d("sendAccountDeletionMail post email", { params });

        return params;
      },
    },
    authentication: {
      sendAccountAlreadyExist: ({ email }) => {
        log.i("sendAccountAlreadyExist - In", {
          email,
        });
        if (!email) {
          const message = `Le paramètre de l'adresse courriel manque à la requête`;
          log.w(`sendAccountAlreadyExist - ${message}`);
          throw new AppError(message);
        }

        const link = new URL(
          "/connexion/mot-de-passe-oublie",
          frontUsagersDomain,
        ).toString();
        const html = sendTemplate.getBody(
          "Portail VAO - Votre compte existe déjà - Récupérez l'accès facilement",
          [
            {
              p: [
                "Bonjour",
                "Une tentative de création de compte a été faite avec cette adresse e-mail sur VAO.",
                "Nous vous rappelons que cette adresse e-mail est déjà associée à un compte existant.",
                "Si vous avez oublié votre mot de passe, vous pouvez le réinitialiser ici :",
              ],
              type: "p",
            },
            {
              link,
              text: "Je réinitialise mon mot de passe",
              type: "link",
            },
            {
              p: [
                "Si ce n'était pas vous, vous pouvez ignorer cet e-mail.",
                "Aucune action n’est requise de votre part.",
              ],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );

        log.d("sendAccountAlreadyExist - sending validation mail");
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: "Portail VAO - Votre compte existe déjà",
          to: email,
        };
        log.d("sendAccountAlreadyExist post email", {
          params,
        });

        return params;
      },
      sendAccountValided: (email) => {
        const link = `${frontUsagersDomain}/connexion/`;
        const html = sendTemplate.getBody(
          "Portail VAO - Prochaines étapes",
          [
            {
              p: [
                "Bonjour,",
                "Vous venez de valider votre compte en tant qu’organisateur de séjours VAO. Voici les étapes à compléter pour pouvoir déclarer vos premiers séjours : ",
                "- Rejoignez votre organisme en indiquant son numéro de SIRET",
                "- complétez votre fiche organisme avec les informations légales et nécessaires à la déclaration d’un séjour",
                "- créez les fiches des hébergements où vos vacanciers vont séjourner",
                "- faites vos premières déclarations de séjour",
              ],
              type: "p",
            },
            {
              p: [assistanceText],
              type: "p",
            },
            {
              link,
              text: "Se connecter à VAO",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: "Portail VAO - Prochaines étapes",
          to: email,
        };

        return params;
      },
      sendForgottenPassword: ({ email, token }) => {
        log.i("sendForgottenPassword - In", {
          email,
          token,
        });
        if (!email) {
          const message = `Le paramètre de l'adresse courriel manque à la requête`;
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
          const message = `Le paramètre de l'adresse courriel manque à la requête`;
          log.w(`sendValidationMail - ${message}`);
          throw new AppError(message);
        }
        if (!token) {
          const message = "Le paramètre token manque à la requête";
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
                "Pour finaliser la création de votre compte sur la plateforme VAO, confirmez votre adresse e-mail en cliquant sur le lien ci-dessous",
              ],
              type: "p",
            },
            {
              link,
              text: "Je valide mon adresse courriel",
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
          subject: `Portail VAO - Validez votre adresse courriel`,
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
      sendMessageNotify: ({ declaration, destinataires, message }) => {
        log.i("sendMessageNotify - In", {
          destinataires,
        });
        if (!destinataires) {
          const message = `Le paramètre destinataires manque à la requête`;
          log.w(`sendMessageNotify - ${message}`);
          throw new AppError(message);
        }

        const link = `${frontUsagersDomain}/demande-sejour/${declaration.id}`;
        const html = sendTemplate.getBody(
          "Portail VAO - Nouveau message",
          [
            {
              p: [
                "Bonjour,",
                `Le message ci dessous vous a été adressé relativement à la déclaration ${declaration.idFonctionnelle}. Il est consultable dans l'onglet Messagerie.`,
              ],
              type: "p",
            },
            {
              p: [`${message}`],
              type: "quote",
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
          subject: `nouveau message sur la déclaration ${declaration.idFonctionnelle}`,
          to: destinataires,
        };
        log.d("sendMessageNotify post email", {
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
    newVaoAccount: {
      sendNewAccountBlockedByDreets: (email, motif, regionName) => {
        const html = sendTemplate.getBody(
          "Refus d’inscription de votre organisme sur la plateforme VAO",
          [
            {
              p: [
                "Bonjour,",
                `La DREETS de la région ${regionName} a traité votre demande d’inscription, qui n’a pas pu être validée pour la raison suivante`,
                motif,
                "Vous pouvez directement contacter la DREETS de votre région pour avoir plus de renseignements à ce propos.",
              ],
              type: "p",
            },
            {
              p: [assistanceText],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject:
            "Refus d’inscription de votre organisme sur la plateforme VAO",
          to: email,
        };

        return params;
      },
      sendNewAccountBlockedByOrganisme: (email, motif) => {
        const html = sendTemplate.getBody(
          "Refus d’inscription au sein de l’organisme VAO",
          [
            {
              p: [
                "Bonjour,",
                "L’organisateur VAO que vous avez souhaité rejoindre lors de votre inscription a traité votre demande, et celle-ci n’a pas pu être validée pour la raison suivante",
                motif,
                "Pour en savoir plus, vous pouvez contacter directement l’organisateur qui vous donnera plus de renseignements à ce propos.",
              ],
              type: "p",
            },
            {
              p: [assistanceText],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject:
            "Refus d’inscription de votre organisme sur la plateforme VAO",
          to: email,
        };

        return params;
      },
      sendNewAccountValided: (email) => {
        const link = `${frontUsagersDomain}/connexion/`;
        const html = sendTemplate.getBody(
          "VAO - Inscription validée, prochaines étapes pour votre compte",
          [
            {
              p: [
                "Bonjour,",
                "Votre inscription au sein de VAO vient d'être validée en tant qu’organisateur de séjours VAO. Voici les étapes à compléter pour pouvoir déclarer vos premiers séjours : ",
                "- Complétez votre fiche organisme avec les informations légales et nécessaires à la déclaration d’un séjour",
                "- Ensuite vous pourrez créer les fiches des hébergements où vos vacanciers vont séjourner",
                "- Et enfin faites vos premières déclarations de séjour",
              ],
              type: "p",
            },
            {
              p: [assistanceText],
              type: "p",
            },
            {
              link,
              text: "Se connecter à VAO",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject:
            "VAO - Inscription validée, prochaines étapes pour votre compte",
          to: email,
        };

        return params;
      },
      sendOrganismeNewAccountValidation: ({ email, user }) => {
        const link = `https://annuaire-entreprises.data.gouv.fr/etablissement/${user.userSiret}`;
        const linkListeUsersOva = `${frontUsagersDomain}/utilisateurs/liste`;
        const html = sendTemplate.getBody(
          "PORTAIL VAO ORGANISME - VALIDATION DE COMPTE",
          [
            {
              p: [
                "Bonjour,",
                "Un utilisateur souhaite rejoindre un nouvel organisme OVA au sein de la plateforme SI VAO.",
                "Voici les informations concernant l’utilisateur : ",
                `- Nom : ${user.nom}`,
                `- Prénom : ${user.prenom}`,
                `- Email : ${user.email}`,
                `- Téléphone : ${user.telephone}`,
              ],
              type: "p",
            },
            {
              p: [
                `Si vous connaissez cette personne et qu’elle appartient bien à l’organisme tel que répertorié sur <a href="${link}" target="_blank">l’annuaire des entreprises</a> qui organisme des séjours VAO, vous pouvez valider la demande dans l’interface dédiée.`,
                `Si vous ne souhaitez pas que cette personne rejoigne votre organisme, vous pouvez également refuser sa demande.`,
              ],
              type: "p",
            },
            {
              p: [
                "Vous pouvez cliquer directement sur le lien hypertexte pour accéder aux détails de l’organisme.",
                "Si vous avez un doute, vous pouvez prendre contact avec cette personne avant de traiter la demande.",
              ],
              type: "p",
            },
            {
              link: linkListeUsersOva,
              text: "TRAITER LA DEMANDE",
              type: "link",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );
        return {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: "Portail VAO Administration - Validation de compte",
          to: email,
        };
      },
      sendWaitAccountValidationDREETS: (email, mailDreets) => {
        const html = sendTemplate.getBody(
          "VAO - confirmation de votre demande d’inscription",
          [
            {
              p: [
                "Bonjour,",
                "Votre inscription a bien été prise en compte. Elle a été adressée à la DREETS de votre siège social, qui va traiter la demande sous peu.",
                `L’adresse de contact de la DREETS est la suivante : ${mailDreets}`,
              ],
              type: "p",
            },
            {
              p: [assistanceText],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: "VAO - confirmation de votre demande d’inscription",
          to: email,
        };

        return params;
      },
      sendWaitAccountValidationOrganisme: (email) => {
        const html = sendTemplate.getBody(
          "VAO - confirmation de votre demande d’inscription",
          [
            {
              p: [
                "Bonjour,",
                "Votre inscription a bien été prise en compte. Elle a été adressée à votre entité qui va traiter la demande sous peu.",
                "En cas de question, merci de contacter votre organisme.",
              ],
              type: "p",
            },
            {
              p: [assistanceText],
              type: "p",
            },
          ],
          `L'équipe du SI VAO<BR><a href=${frontUsagersDomain}>Portail VAO</a>`,
        );
        const params = {
          from: senderEmail,
          html,
          replyTo: senderEmail,
          subject: "VAO - confirmation de votre demande d’inscription",
          to: email,
        };

        return params;
      },
    },
  },
};
