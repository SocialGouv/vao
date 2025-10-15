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
    const body = `
      <p>Bonjour,</p>
      <p>Votre compte VAO n’a pas été utilisé depuis 5 mois.<br>
      Pour des raisons de sécurité, il sera supprimé dans 1 mois si vous ne vous reconnectez pas d’ici le <strong>${formattedDateSuppression}</strong>.</p>
      <p>Pour vous reconnecter à votre compte, vous devrez au préalable réinitialiser votre mot de passe en cliquant sur le lien suivant :</p>
      <p><a href="${RESET_PASSWORD_URL}">Réinitialiser mon mot de passe</a></p>
      <p>Cordialement.<br>L’équipe du SI VAO<br>Portail VAO</p>
      <br><i>Ce courriel est un message automatique, merci de ne pas répondre.</i>
    `;
    const html = constructMail("", [{ p: [body], type: "p" }], "");
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
    const body = `
      <p>Bonjour,</p>
      <p>Votre compte VAO n’a pas été utilisé depuis plusieurs mois.<br>
      Pour des raisons de sécurité, il sera supprimé dans 7 jours si vous ne vous reconnectez pas d’ici le <strong>${formattedDateSuppression}</strong>.</p>
      <p>Pour vous reconnecter à votre compte, vous devrez au préalable réinitialiser votre mot de passe en cliquant sur le lien suivant :</p>
      <p><a href="${RESET_PASSWORD_URL}">Réinitialiser mon mot de passe</a></p>
      <p>Cordialement.<br>L’équipe du SI VAO<br>Portail VAO</p>
      <br><i>Ce courriel est un message automatique, merci de ne pas répondre.</i>
    `;
    const html = constructMail("", [{ p: [body], type: "p" }], "");
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
