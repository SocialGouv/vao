import { senderEmail, domains } from "../config";
import constructMail from "../utils/mails";
import { transportEmails } from "../utils/transporter";

import type {
  NotifyCompteInactif2mRow,
  GenerateEmailParams,
} from "./notifyCompteInactif2mtype";

const generateEmail = ({
  mail,
  deadlineDesactivation,
}: GenerateEmailParams) => {
  const html = constructMail(
    "",
    [
      {
        p: [
          `
        <p>Bonjour,</p>
        <p>
        Votre compte VAO n’a pas été utilisé depuis 2 mois.<br>
        Il sera désactivé provisoirement dans 1 mois si vous ne vous reconnectez pas d’ici <strong>le ${deadlineDesactivation}</strong>.<br>
        `,
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
    subject: `Portail VAO - Désactivation provisoire de votre compte VAO dans 1 mois `,
    to: [mail],
  };
};

export const sendNotifyCompteInactif2mRow = async (
  rows: NotifyCompteInactif2mRow[],
  deadlineDesactivation: string,
) => {
  const mails = rows.map(({ mail }) =>
    generateEmail({ mail, deadlineDesactivation }),
  );
  return await transportEmails(mails);
};
