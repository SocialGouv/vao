import { domains, senderEmail } from "../config";
import {
  RappelDSBORow,
  RappelDSFUsagerRow,
  RappelRows,
} from "./notifyRappelActionsBo.type";
import constructMail from "../utils/mails";
import { transportEmails } from "../utils/transporter";

export const initialEmailContent = [
  "<p>Bonjour,</p>",
  "<p>Vous trouverez ci-dessous la liste des déclarations VAO sur lesquelles une action de votre part est attendue,</p>",
];

const isFUsagerRow = (
  row: RappelDSBORow | RappelDSFUsagerRow,
): row is RappelDSFUsagerRow => "mails" in row;

type GroupedRows<T> = Record<
  string,
  {
    withAlerts: T[];
    withoutAlerts: T[];
  }
>;

const groupByEmails = <T extends RappelDSBORow | RappelDSFUsagerRow>(
  rows: T[],
) => {
  const groupedRows = rows.reduce((acc, row) => {
    const mail = isFUsagerRow(row) ? row.mails : row.mail;
    if (!acc[mail]) {
      acc[mail] = {
        withAlerts: [],
        withoutAlerts: [],
      };
    }
    if (row.isalerte) {
      acc[mail].withAlerts.push(row);
    } else {
      acc[mail].withoutAlerts.push(row);
    }
    return acc;
  }, {} as GroupedRows<T>);

  return groupedRows;
};

const createDSContent = (ds: RappelDSBORow | RappelDSFUsagerRow) => {
  const content = [];
  content.push(`<p>${ds.id_fonctionnelle} - ${ds.communes}<br>`);
  content.push(`Statut de la déclaration : ${ds.statut}<br>`);
  content.push(`Date de début du séjour :  ${ds.date_debut}<br></p>`);
  return content;
};

const appendContent = (alerts: RappelRows, starter: string) => {
  const newContent: string[] = [];
  if (alerts.length > 0) {
    newContent.push(starter);
    newContent.push("<ul>");
    newContent.push(...alerts.flatMap((ds) => createDSContent(ds)));
    newContent.push("</ul></p>");
  }
  return newContent;
};

type CreateContentParams = {
  dsWithAlerts: RappelRows;
  dsWithoutAlerts: RappelRows;
};

const createContent = ({
  dsWithAlerts,
  dsWithoutAlerts,
}: CreateContentParams) => {
  const emailContent = [...initialEmailContent];
  emailContent.push(
    ...appendContent(
      dsWithAlerts,
      "<p><b>DECLARATIONS NECESSITANT UNE ACTION URGENTE DE VOTRE PART dont la date de début de séjour est à moins de 10 jours</b>",
    ),
  );
  emailContent.push(
    ...appendContent(
      dsWithoutAlerts,
      "<p><b>AUTRES DECLARATIONS DE SEJOUR NECESSITANT UNE ACTION DE VOTRE PART</b>",
    ),
  );
  return emailContent;
};

const generateEmail = (email: string, content: string, isBO: boolean) => {
  const textDeFin = isBO
    ? []
    : [
        '<p>Si vous avez des difficultés pour traiter vos déclarations, vous vous rappelons que vous pouvez <a href="https://vao-assistance.atlassian.net/servicedesk/customer/portals">contacter le support utilisateur</a>.</p>',
        "<p>De plus, vous avez toujours la possibilité d’annuler des déclarations de séjours qui ne sont plus d’actualité pour garder votre tableau à jour.</p>",
      ];
  const link = isBO
    ? `${domains.frontBODomain}/sejours`
    : `${domains.frontUsagersDomain}/demande-sejour/liste`;
  const html = constructMail(
    "",
    [
      {
        p: [
          `
        ${content}
        `,
          textDeFin.join("\n"),
        ],
        type: "p",
      },
      {
        link,
        text: "Accéder à mes déclarations",
        type: "link",
      },
    ],
    "L'équipe du SI VAO<br><br><i>Ce courriel est un message automatique, merci de ne pas répondre.</i>",
  );
  return {
    from: senderEmail,
    replyTo: senderEmail,
    html,
    subject: `Séjours VAO – Récapitulatif des déclarations de séjour en attente de traitement de votre part`,
    to: [email],
  };
};

const sendEmail = (email: string, content: string[], isBO: boolean) => {
  const mailNew = content.join(";");
  const mail = generateEmail(email, mailNew, isBO);
  return mail;
};

export const sendEmails = async (rows: RappelRows, isBo: boolean) => {
  const groupedRows = groupByEmails(rows);
  const mails = [];
  for (const [email, { withAlerts, withoutAlerts }] of Object.entries(
    groupedRows,
  )) {
    const content = createContent({
      dsWithAlerts: withAlerts,
      dsWithoutAlerts: withoutAlerts,
    });
    mails.push(sendEmail(email, content, isBo));
  }
  return await transportEmails(mails);
};
