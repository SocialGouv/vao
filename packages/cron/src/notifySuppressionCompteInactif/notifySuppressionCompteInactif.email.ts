import { senderEmail, domains } from "../config";
import constructMail from "../utils/mails";
import { transportEmails } from "../utils/transporter";

import type { NotifySuppressionCompteInactifRow } from "./notifySuppressionCompteInactif.type";

const RESET_PASSWORD_URL = `${domains.frontUsagersDomain}/connexion/mot-de-passe-oublie`;

export const sendAlerte5mEmails = async (
  rows: NotifySuppressionCompteInactifRow[],
  dateSuppression: Date | string,
) => {
  const formattedDateSuppression =
    dateSuppression &&
    typeof dateSuppression !== "string" &&
    "toLocaleDateString" in dateSuppression
      ? (dateSuppression as Date).toLocaleDateString("fr-FR")
      : dateSuppression;
  const mails = rows.map((row) => {
    const subject = "Portail VAO - Suppression de votre compte dans 1 mois";
    const content = [
      {
        p: [
          `Bonjour,<br><br>Votre compte VAO n’a pas été utilisé depuis 5 mois.<br>Pour des raisons de sécurité, il sera supprimé dans 1 mois si vous ne vous reconnectez pas d’ici le <strong>${formattedDateSuppression}</strong>.<br><br>Pour vous reconnecter à votre compte, vous devrez au préalable réinitialiser votre mot de passe en cliquant sur le bouton ci-dessous :`
        ],
        type: "p" as const,
      },
      {
        link: RESET_PASSWORD_URL,
        text: "Réinitialiser mon mot de passe",
        type: "link" as const,
      }
    ];
    const signature = `L’équipe du SI VAO<BR><a href=${domains.frontUsagersDomain}>Portail VAO</a><br><br><i>Ce courriel est un message automatique, merci de ne pas répondre.</i>`;
    const html = constructMail("Suppression de votre compte VAO", content, signature);
    return {
      from: senderEmail,
      replyTo: senderEmail,
      html,
      subject,
      to: [row.mail],
    };
  });
  return await transportEmails(mails);
};

export const sendRappelJ7Emails = async (
  rows: NotifySuppressionCompteInactifRow[],
  dateSuppression: Date | string,
) => {
  const formattedDateSuppression =
    dateSuppression &&
    typeof dateSuppression !== "string" &&
    "toLocaleDateString" in dateSuppression
      ? (dateSuppression as Date).toLocaleDateString("fr-FR")
      : dateSuppression;
  const mails = rows.map((row) => {
    const subject = "Portail VAO - Suppression de votre compte dans 7 jours";
    const content = [
      {
        p: [
          `Bonjour,<br><br>Votre compte VAO n’a pas été utilisé depuis plusieurs mois.<br>Pour des raisons de sécurité, il sera supprimé dans 7 jours si vous ne vous reconnectez pas d’ici le <strong>${formattedDateSuppression}</strong>.<br><br>Pour vous reconnecter à votre compte, vous devrez au préalable réinitialiser votre mot de passe en cliquant sur le bouton ci-dessous :`
        ],
        type: "p" as const,
      },
      {
        link: RESET_PASSWORD_URL,
        text: "Réinitialiser mon mot de passe",
        type: "link" as const,
      }
    ];
    const signature = `L’équipe du SI VAO<BR><a href=${domains.frontUsagersDomain}>Portail VAO</a><br><br><i>Ce courriel est un message automatique, merci de ne pas répondre.</i>`;
    const html = constructMail("Suppression de votre compte VAO", content, signature);
    return {
      from: senderEmail,
      replyTo: senderEmail,
      html,
      subject,
      to: [row.mail],
    };
  });
  return await transportEmails(mails);
};
