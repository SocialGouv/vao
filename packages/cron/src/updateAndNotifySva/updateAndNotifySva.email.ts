import { senderEmail, domains } from "../config";
import constructMail from "../utils/mails";
import { transportEmails } from "../utils/transporter";
import { UpdateAndNotifySvaRow } from "./updateAndNotifySva.type";
import { FicheTerritoire } from "../shared/territoires/territoire.type";
import { formatFR } from "@vao/shared-bridge";

const CREATE_ACCOUNT_URL_PATH = `${domains.frontBODomain}/agrements/`;

export const MailSva = {
  bo: {
    sendNotificationDelay21Days: ({
      to,
      svaToNotify,
    }: {
      to: string;
      svaToNotify: UpdateAndNotifySvaRow;
    }) => {
      const subject =
        "Portail VAO - Rappel : Instruction du dossier de renouvellement d’agrément en attente de décision";
      const body = `
        <p>Bonjour,</p>
        <p>Le dossier de renouvellement d’agrément de l’OVA ${svaToNotify.organisme_nom} est en attente de décision.</p>
        <p>Le délai légal de <strong>2 mois calendaires</strong> prendra fin le ${formatFR(svaToNotify.date_fin_previsionnelle)}.<br />
        Il reste ${svaToNotify.jours_restants} jours pour instruire et finaliser le traitement de ce dossier.</p>
        <p>⚠️ Sans décision expresse avant cette date, le dossier sera automatiquement validé par tacite accord.<br />
          <a href="${CREATE_ACCOUNT_URL_PATH}${svaToNotify.agrement_id}" title="Accéder au dossier">Accéder au dossier</a>
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
      transportEmails([mail]);
    },
    sendNotificationSvaTacite: ({
      to,
      svaToNotify,
    }: {
      to: string;
      svaToNotify: UpdateAndNotifySvaRow;
    }) => {
      const subject =
        "Portail VAO - Validation tacite du dossier de renouvellement d’agrément";
      const body = `
        <p>Bonjour,</p>
        <p>Le dossier de renouvellement d’agrément de l’OVA ${svaToNotify.organisme_nom} a atteint le terme du délai légal de <strong>2 mois calendaires</strong> sans décision expresse.</p>
        <p>L’agrément est désormais considéré comme <strong>renouvelé tacitement</strong> à compter du ${formatFR(svaToNotify.date_fin_previsionnelle)}.</p>
        <p>Un email de notification a été adressé automatiquement à l’OVA.</p>
        <p>Vous devez dès à présent :</p>
        <ul>
          <li>Fournir une attestation de cette décision implicite d'acceptation à l’OVA concerné,</li>
          <li>Compléter les informations liées à ce renouvellement tacite sur votre espace VAO en cliquant sur le lien suivant: <a href="${CREATE_ACCOUNT_URL_PATH}${svaToNotify.agrement_id}">${CREATE_ACCOUNT_URL_PATH}${svaToNotify.agrement_id}</a></li>
        </ul>
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
      transportEmails([mail]);
    },
  },
  ova: {
    sendNotificationSvaTacite: ({
      to,
      territoire,
      svaToNotify,
    }: {
      to: string[];
      territoire: FicheTerritoire;
      svaToNotify: UpdateAndNotifySvaRow;
    }) => {
      const subject =
        "Portail VAO - Validation tacite du dossier de renouvellement d’agrément";
      const body = `
        <p>Bonjour,</p>
        <p>Vous avez sollicité, via le portail VAO en date du ${formatFR(svaToNotify.date_depot)}, une demande d’agrément pour l’organisation de séjours de « vacances adaptées organisées</p>
        <p>La DREETS a accusé réception de votre dossier complet le ${formatFR(svaToNotify.date_confirm_completude)}. A défaut de réception d’une décision expresse dans un délai de 2 mois calendaires suivant la date de l’accusé réception de votre demande complète, à savoir le ${formatFR(svaToNotify.date_fin_previsionnelle)}, l’agrément « Vacances adaptées organisées » est réputé accepté tacitement.</p>

        <p>Par conséquent, le renouvellement d’agrément est délivré à ${svaToNotify.organisme_nom} ${svaToNotify?.organisme_adresse ?? ""} pour l’organisation de séjours de vacances adaptées organisées. </p>

        <p>Il vous appartiendra, à compter de cette même date, de solliciter auprès de la DREETS ${territoire.label}, une attestation de cette décision implicite d'acceptation.</p>

        <p>Cordialement.<br />L’équipe du SI VAO<br />Portail VAO</p>
      `;
      const html = constructMail("", [{ p: [body], type: "p" }], "");
      const mail = {
        from: senderEmail,
        replyTo: senderEmail,
        html,
        subject,
        to,
      };
      transportEmails([mail]);
    },
  },
};
