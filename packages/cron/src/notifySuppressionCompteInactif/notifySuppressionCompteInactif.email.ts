import { senderEmail, domains } from "../config";
import constructMail from "../utils/mails";
import { transportEmails } from "../utils/transporter";

import type {
  NotifySuppressionCompteInactifRow,
} from "./notifySuppressionCompteInactif.type";
import type {
  NotifyCompteInactif2mEmailParams
} from "./notifySuppressionCompteInactif.type";

type NotifyCompteInactif2mEmailParamsFixed = Omit<NotifyCompteInactif2mEmailParams, "dateSuppression"> & { dateSuppression: Date | string };



const RESET_PASSWORD_URL = `${domains.frontUsagersDomain}/connexion/mot-de-passe-oublie`;

const generateEmail = ({ mail, dateSuppression, type }: NotifyCompteInactif2mEmailParams) => {
  let subject = "";
  let body = "";
  
  const formattedDateSuppression = (dateSuppression && typeof dateSuppression !== "string" && "toLocaleDateString" in dateSuppression)
    ? (dateSuppression as Date).toLocaleDateString("fr-FR")
    : dateSuppression;

  if (type === "ALERTE_5M") {
    subject = "Portail VAO - Suppression de votre compte dans 1 mois";
    body = `
      <p>Bonjour,</p>
      <p>Votre compte VAO n’a pas été utilisé depuis 5 mois.<br>
      Pour des raisons de sécurité, il sera supprimé dans 1 mois si vous ne vous reconnectez pas d’ici le <strong>${formattedDateSuppression}</strong>.</p>
      <p>Pour vous reconnecter à votre compte, vous devrez au préalable réinitialiser votre mot de passe en cliquant sur le lien suivant :</p>
      <p><a href="${RESET_PASSWORD_URL}">Réinitialiser mon mot de passe</a></p>
      <p>Cordialement.<br>L’équipe du SI VAO<br>Portail VAO</p>
      <br><i>Ce courriel est un message automatique, merci de ne pas répondre.</i>
    `;
  } else if (type === "RAPPEL_J7") {
    subject = "Portail VAO - Suppression de votre compte dans 7 jours";
    body = `
      <p>Bonjour,</p>
      <p>Votre compte VAO n’a pas été utilisé depuis plusieurs mois.<br>
      Pour des raisons de sécurité, il sera supprimé dans 7 jours si vous ne vous reconnectez pas d’ici le <strong>${formattedDateSuppression}</strong>.</p>
      <p>Pour vous reconnecter à votre compte, vous devrez au préalable réinitialiser votre mot de passe en cliquant sur le lien suivant :</p>
      <p><a href="${RESET_PASSWORD_URL}">Réinitialiser mon mot de passe</a></p>
      <p>Cordialement.<br>L’équipe du SI VAO<br>Portail VAO</p>
      <br><i>Ce courriel est un message automatique, merci de ne pas répondre.</i>
    `;
  }

  const html = constructMail("", [{ p: [body], type: "p" }], "");

  return {
    from: senderEmail,
    replyTo: senderEmail,
    html,
    subject,
    to: [mail],
  };
};


export const sendAlerte5mEmails = async (
  rows: NotifySuppressionCompteInactifRow[],
  dateSuppression: Date | string
) => {
  const mails = rows.map(row =>
    generateEmail({
      mail: row.mail,
      dateSuppression: dateSuppression,
      type: "ALERTE_5M"
    } as NotifyCompteInactif2mEmailParamsFixed)
  );
  return await transportEmails(mails);
};

export const sendRappelJ7Emails = async (
  rows: NotifySuppressionCompteInactifRow[],
  dateSuppression: Date | string
) => {
  const mails = rows.map(row =>
    generateEmail({
      mail: row.mail,
      dateSuppression,
      type: "RAPPEL_J7"
    } as NotifyCompteInactif2mEmailParamsFixed)
  );
  return await transportEmails(mails);
};
