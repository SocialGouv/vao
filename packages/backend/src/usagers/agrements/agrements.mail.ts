import config, { frontUsagersDomain, senderEmail } from "../../config";
import sendTemplate from "../../helpers/mail";
import AppError from "../../utils/error";
import logger from "../../utils/logger";

const log = logger(module.filename);

const assistanceText = `Si vous avez besoin d’accompagnement, vous pouvez contacter notre <a href='${config.assistance.uriFaq}'>équipe support</a>`;

export const AgrementMailUsagers = {
  sendStatutAModifierMail: ({
    email,
    commentaire,
    regionDreets,
  }: {
    email: string[];
    commentaire: string | undefined;
    regionDreets: string;
  }) => {
    log.i("sendStatutAModifierMail - In", { email });
    if (!email) {
      throw new AppError(
        "Email manquant pour l'envoi du mail de demande de modification d'agrément",
      );
    }
    const html = sendTemplate.getBody(
      "PeroVAO - Demande d'agrément transmise",
      [
        {
          p: [
            "Bonjour,",
            `Suite à la réception de votre demande de renouvellement d’agrément, la DREETS ${regionDreets} vous informe qu’un ou plusieurs éléments complémentaires sont nécessaires afin de poursuivre l’examen de votre dossier.`,
            "<strong>Commentaire de l’agent instructeur :</strong>",
            commentaire?.replace(/\n/g, "<br>"),
            "Nous vous invitons à vous connecter au portail <strong>VAO</strong> afin de consulter le détail de cette demande et de transmettre les informations ou documents demandés :",
            `<a href=${frontUsagersDomain}>${frontUsagersDomain}</a>`,
            "Pour toute question ou précision concernant cette demande de compléments, merci d’utiliser la <strong>messagerie intégrée au portail VAO</strong>, accessible depuis votre page agrément.",
            assistanceText,
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
      subject:
        "Portail VAO - Demande de compléments d’informations suite à votre demande de renouvellement d’agrément",
      to: email,
    };
    log.d("sendStatutTransmisMail post email", { params });
    return params;
  },
  sendStatutCompletudeMail: ({
    email,
    regionDreets,
  }: {
    email: string[];
    regionDreets: string;
  }) => {
    log.i("sendStatutCompletudeMail - In", { email });
    if (!email) {
      throw new AppError(
        "Email manquant pour l'envoi du mail la validation de la complétude de l'agrément",
      );
    }
    const urlAgrement = frontUsagersDomain + "/mon-agrement";
    const html = sendTemplate.getBody(
      "Portail VAO – Confirmation de la complétude de votre dossier de renouvellement d’agrément",
      [
        {
          p: [
            "Bonjour,",
            `Votre demande de renouvellement d’agrément a été examinée par la DREETS ${regionDreets}.`,
            "Conformément à la réglementation, l’administration dispose d’un délai de 2 mois pour instruire votre dossier et rendre une décision (ce délai est géré par la DREETS).",
            `À défaut de décision dans ce délai, votre agrément sera réputé accordé (règle du "silence vaut accord"). La décision implicite d’acceptation du dossier ne court qu'à compter du moment où l’ensemble des pièces sont fournies par l’OVA.`,
            "Vous pouvez suivre l’avancement de votre demande à tout moment depuis votre espace sur le portail VAO :",
            `<a href=${urlAgrement}>${urlAgrement}</a>`,
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
      subject:
        "Portail VAO – Confirmation de la complétude de votre dossier de renouvellement d’agrément",
      to: email,
    };
    log.d("sendStatutTransmisMail post email", { params });
    return params;
  },
  sendStatutRefuseMail: ({
    email,
    regionDreets,
  }: {
    email: string[];
    regionDreets: string;
  }) => {
    log.i("sendStatutRefuseMail - In", { email });
    if (!email) {
      throw new AppError(
        "Email manquant pour l'envoi du mail de refus d'agrément",
      );
    }
    const urlAgrement = frontUsagersDomain + "/mon-agrement";
    const html = sendTemplate.getBody(
      "Portail VAO - Refus de votre agrément",
      [
        {
          p: [
            "Bonjour,",
            `Suite à l’instruction de votre demande de renouvellement d’agrément, la DREETS ${regionDreets} vous informe que celle-ci a été <strong>refusée</strong>.`,
            `Vous trouverez sur le <a href=${urlAgrement}>portail VAO</a> <strong>l’arrêté officiel de refus</strong> correspondant à cette décision.`,
            "Nous vous rappelons que, conformément à la réglementation en vigueur, cette décision est <strong>définitive</strong> et vous empêche de déclarer de nouveaux séjours adaptés. Cependant, cette décision ne vous empêche pas de vous connecter à votre compte sur le portail VAO.",
            "Pour toute question ou précision concernant ce refus, merci d’utiliser la <strong>messagerie intégrée au portail VAO</strong>, accessible depuis votre page agrément.",
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
      subject: "Portail VAO - Refus de votre agrément",
      to: email,
    };
    log.d("sendStatutRefuseMail post email", { params });
    return params;
  },
  sendStatutTransmisMail: ({
    email,
    date,
    regionDreets,
  }: {
    email: string;
    date: string;
    regionDreets: string;
  }) => {
    log.i("sendStatutTransmisMail - In", {
      date,
      email,
      regionDreets,
    });
    if (!email) {
      throw new AppError(
        "Email manquant pour l'envoi du mail de transmission d'agrément",
      );
    }
    const html = sendTemplate.getBody(
      "Portail VAO – Confirmation de transmission de votre demande de renouvellement d’agrément",
      [
        {
          p: [
            "Bonjour,",
            `Votre demande d’agrément a bien été transmise le ${date} à la DREETS ${regionDreets}.`,
            "Vous pouvez suivre l’avancement de votre dossier à tout moment depuis votre espace personnel sur le portail VAO :",
            `<a href='${frontUsagersDomain}/mon-agrement'>Lien direct vers le dossier</a>`,
            "Un email vous sera envoyé à chaque évolution du traitement de votre demande.",
          ],
          type: "p",
        },
      ],
      `Cordialement,<br>L’équipe du SI VAO<br><a href='${frontUsagersDomain}'>Portail VAO</a>`,
    );
    const params = {
      from: senderEmail,
      html,
      replyTo: senderEmail,
      subject:
        "Portail VAO – Confirmation de transmission de votre demande de renouvellement d’agrément",
      to: email,
    };
    log.d("sendStatutTransmisMail post email", { params });
    return params;
  },
};
