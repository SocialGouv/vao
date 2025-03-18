import { senderEmail } from "../config";
import constructMail from "@vao/shared/src/templates/mails";
import { transportEmails } from "../utils/transporter";
import type {
  RappelDeclarationSejour8j15jRow,
  GenerateEmailParams,
} from "./notifyRappelDs8j15j.type";

const generateEmail = ({
  mail,
  deadlineRemind,
  dateDebutAlerte,
  titre,
}: GenerateEmailParams) => {
  const html = constructMail(
    "",
    [
      {
        p: [
          `
        <p>Bonjour,</p>
        <p>Il vous reste ${deadlineRemind} jours à compter du ${dateDebutAlerte} pour réaliser la déclaration de séjour à 8 jours pour le séjour «${titre}».<br>
        Passé ce délai, il ne vous sera plus possible de constituer le dossier pour votre séjour.</p>
        `,
        ],
        type: "p",
      },
    ],
    "L'équipe du SI VAO<br><br><i>Ce courriel est un message automatique, merci de ne pas répondre.</i>",
  );
  return {
    from: senderEmail,
    replyTo: senderEmail,
    html,
    subject: `Séjours VAO – Récapitulatif des déclarations de séjour en attente de traitement de votre part`,
    to: [mail],
  };
};

export const sendRappelDeclarationEmails = async (
  rows: RappelDeclarationSejour8j15jRow[],
  deadlineRemind: string,
) => {
  const mails = rows.map(({ mail, dateDebutAlerte, titre }) =>
    generateEmail({ mail, dateDebutAlerte, deadlineRemind, titre }),
  );
  return await transportEmails(mails);
};
