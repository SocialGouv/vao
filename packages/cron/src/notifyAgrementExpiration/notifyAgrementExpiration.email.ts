import { senderEmail, domains } from "../config";
import constructMail from "../utils/mails";
import { transportEmails } from "../utils/transporter";

import type {
  NotifyAgrementExpirationRow,
  GenerateEmailParams,
} from "./notifyAgrementExpiration.type";

const generateEmail6m = ({
  mail,
  formattedDateFinValidite,
}: GenerateEmailParams) => {
  const html = constructMail(
    "",
    [
      {
        p: [
          "Bonjour,",
          `Il reste 120 jours avant l’expiration de votre agrément sur le portail VAO (le  ${formattedDateFinValidite}).`,
          "En déposant dès maintenant votre demande de renouvellement d’agrément, vous éviterez toute interruption dans la déclaration et l’organisation de vos séjours adaptés.",
          "En effet, la demande de renouvellement doit être formulée dans les quatre mois précédant la date d’expiration de l’agrément en cours.</br>",
          "Sans renouvellement validé à cette date, vous ne pourrez plus déclarer de séjours dans le portail VAO.",
          `<strong>Pour renouveler votre agrément, cliquez sur le lien suivant</strong> : <a href=${domains.frontUsagersDomain}>Portail VAO</a>`,
        ],
        type: "p",
      },
    ],
    `L'équipe du SI VAO<BR><a href=${domains.frontUsagersDomain}>Portail VAO</a><br><br><i>Ce courriel est un message automatique, merci de ne pas répondre.</i>`,
  );
  return {
    from: senderEmail,
    replyTo: senderEmail,
    html,
    subject: `Portail VAO - Votre agrément expire dans 6 mois`,
    to: [mail],
  };
};

const generateEmail120j = ({
  mail,
  formattedDateFinValidite,
}: GenerateEmailParams) => {
  const html = constructMail(
    "",
    [
      {
        p: [
          "Bonjour,",
          `Votre agrément sur le portail VAO expire le ${formattedDateFinValidite}.`,
          "Vous pouvez dès à présent préparer votre demande de renouvellement pour assurer la continuité de vos activités et éviter toute interruption dans la déclaration de vos séjours.",
          "En effet, la demande de renouvellement doit être formulée dans les quatre mois précédant la date d’expiration de l’agrément en cours.</br></br>",
          `Pour renouveler votre agrément, cliquez sur le lien suivant : <a href=${domains.frontUsagersDomain}>Portail VAO</a>`,
        ],
        type: "p",
      },
    ],
    `L'équipe du SI VAO<BR><a href=${domains.frontUsagersDomain}>Portail VAO</a><br><br><i>Ce courriel est un message automatique, merci de ne pas répondre.</i>`,
  );
  return {
    from: senderEmail,
    replyTo: senderEmail,
    html,
    subject: `Portail VAO - [Urgent] Renouvelez votre agrément dès maintenant`,
    to: [mail],
  };
};

export const sendNotifyAgrementExpirationRow = async (
  rows: NotifyAgrementExpirationRow[],
) => {
  const mails = rows.map(({ mail, date_fin_validite, expiration_type }) => {
    const formattedDateFinValidite = date_fin_validite.toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
    return expiration_type === "6m"
      ? generateEmail6m({ mail, formattedDateFinValidite })
      : generateEmail120j({ mail, formattedDateFinValidite });
  });
  return await transportEmails(mails);
};
