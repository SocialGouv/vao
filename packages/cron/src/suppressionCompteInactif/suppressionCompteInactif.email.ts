import { senderEmail, domains } from "../config";
import constructMail from "../utils/mails";
import { transportEmails } from "../utils/transporter";

export type SendSuppressionCompteInactifEmailParams = {
  to: string;
};

const CREATE_ACCOUNT_URL_PATH = `${domains.frontUsagersDomain}/connexion/enregistrement`;

export const sendSuppressionCompteInactifEmail = async ({
  to,
}: SendSuppressionCompteInactifEmailParams) => {
  const subject = "Portail VAO - Suppression de votre compte après inactivité";
  const body = `
    <p>Bonjour,</p>
    <p>Votre compte VAO n’a pas été utilisé depuis plus de 6 mois.<br />
    Conformément à nos règles de gestion, il a été supprimé.</p>
    <p>Pour continuer à utiliser le service, vous devez créer un nouveau compte sur le Portail VAO :<br />
      <a href="${CREATE_ACCOUNT_URL_PATH}" title="Créer un nouveau compte">Créer un nouveau compte</a>
    </p>
    <p>Cordialement.<br />L’équipe du SI VAO<br />Portail VAO</p>
  `;
  const html = constructMail("", [{ p: [body], type: "p" }], "");
  const mail = {
    from: senderEmail,
    replyTo: senderEmail,
    html,
    subject,
    to: [to],
  };
  await transportEmails([mail]);
};
