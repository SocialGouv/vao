import { AGREMENT_TYPE_DEPOT, formatFR } from "@vao/shared-bridge";

import { config } from "../../config";
import * as sendTemplate from "../../helpers/mail";
import AppError from "../../utils/error";
import { logger } from "../../utils/logger";

const log = logger(module.filename);

export const AgrementMailUsagers = {
  sendCompletudeConfirmedMail: ({
    email,
    regionDreets,
    date,
  }: {
    email: string[];
    regionDreets: string;
    date: Date | null;
  }) => {
    log.i("sendCompletudeConfirmedMail - In", { email });
    if (!email) {
      throw new AppError(
        "Email manquant pour l'envoi du mail la validation de la complétude de l'agrément",
      );
    }
    const urlAgrement = config.frontUsagersDomain + "/mon-agrement";
    const html = sendTemplate.getBody(
      "Portail VAO – Confirmation de la complétude de votre dossier de renouvellement d’agrément",
      [
        {
          p: [
            "Bonjour,",
            `Vous avez complété votre demande d'agrément${date ? ` le ${formatFR(date)}` : ""}.`,
            `La DREETS ${regionDreets} a bien reçu les éléments transmis et votre dossier est désormais en cours d'instruction.`,
            "Vous pouvez suivre l'avancement de votre dossier à tout moment depuis votre espace personnel sur le portail VAO :",
            `<a href='${urlAgrement}'>Consulter le dossier directement dans mon espace personnel</a>`,
            "Un email vous sera envoyé à chaque évolution du traitement de votre demande.",
            "Cordialement.",
          ],
          type: "p",
        },
      ],
      `L'équipe du SI VAO<BR><a href=${config.frontUsagersDomain}>Portail VAO</a>`,
      { includeSecurityNotice: true },
    );
    const params = {
      from: config.senderEmail,
      html,
      replyTo: config.senderEmail,
      subject:
        "Portail VAO – Confirmation de la complétude de votre dossier de renouvellement d’agrément",
      to: email,
    };
    log.d("sendCompletudeConfirmedMail post email", { params });
    return params;
  },
  sendPrisEnChargeMail: ({
    email,
    regionDreets,
    date,
    typeDepot,
  }: {
    email: string[];
    regionDreets: string | null;
    date: Date | null;
    typeDepot: AGREMENT_TYPE_DEPOT;
  }) => {
    log.i("sendPrisEnChargeMail - In", { email });
    if (!email) {
      throw new AppError(
        "Email manquant pour l'envoi du mail de prise en charge de l'agrément",
      );
    }
    const title = `Portail VAO – Votre dossier de ${typeDepot === AGREMENT_TYPE_DEPOT.PREMIER ? "première demande" : "renouvellement"} est pris en charge par la DREETS`;
    const urlAgrement = config.frontUsagersDomain + "/mon-agrement";
    const regionPhrase = regionDreets
      ? `DREETS ${regionDreets}`
      : "DREETS compétente";
    const html = sendTemplate.getBody(
      title,
      [
        {
          p: [
            "Bonjour,",
            `Votre demande ${typeDepot === AGREMENT_TYPE_DEPOT.PREMIER ? "première demande " : ""}d'agrément a bien été transmise${date ? ` le ${formatFR(date)}` : ""} à la ${regionPhrase}.`,
            `La ${regionPhrase} vient de prendre en charge votre dossier.`,
            "Vous pouvez suivre l'avancement de votre dossier à tout moment depuis votre espace personnel sur le portail VAO :",
            `<a href='${urlAgrement}'>Consulter le dossier directement dans mon espace personnel</a>`,
            "Un email vous sera envoyé à chaque évolution du traitement de votre demande.",
            "Cordialement.",
          ],
          type: "p",
        },
      ],
      `L'équipe du SI VAO<BR><a href=${config.frontUsagersDomain}>Portail VAO</a>`,
      { includeSecurityNotice: true },
    );
    const params = {
      from: config.senderEmail,
      html,
      replyTo: config.senderEmail,
      subject: title,
      to: email,
    };
    log.d("sendPrisEnChargeMail post email", { params });
    return params;
  },
  sendStatutACompleterMail: ({
    email,
    regionDreets,
    date,
  }: {
    email: string[];
    regionDreets: string;
    date: Date | null;
  }) => {
    log.i("sendStatutACompleterMail - In", { email });
    if (!email) {
      throw new AppError(
        "Email manquant pour l'envoi du mail de demande de modification d'agrément",
      );
    }

    const urlAgrement = config.frontUsagersDomain + "/mon-agrement";

    const html = sendTemplate.getBody(
      "Portail VAO – Demande de compléments d’informations",
      [
        {
          p: [
            "Bonjour,",
            `La DREETS ${regionDreets} a examiné votre demande d'agrément${date ? ` transmise le ${formatFR(date)}` : ""}.`,
            "Des informations ou pièces complémentaires sont nécessaires avant de pouvoir débuter l'instruction de votre dossier.",
            "Nous vous invitons à consulter le détail des éléments attendus depuis votre espace personnel sur le portail VAO :",
            `<a href='${urlAgrement}'>Consulter le dossier directement dans mon espace personnel</a>`,
            "Une fois les éléments demandés complétés, votre dossier pourra être pris en charge pour instruction.",
            "Cordialement.",
          ],
          type: "p",
        },
      ],
      `L'équipe du SI VAO<BR><a href=${config.frontUsagersDomain}>Portail VAO</a>`,
      { includeSecurityNotice: true },
    );
    const params = {
      from: config.senderEmail,
      html,
      replyTo: config.senderEmail,
      subject:
        "Portail VAO - Demande de compléments d’informations suite à votre demande de renouvellement d’agrément",
      to: email,
    };
    log.d("sendStatutACompleterMail post email", { params });
    return params;
  },
  sendStatutACorrigerMail: ({
    email,
    regionDreets,
  }: {
    email: string[];
    regionDreets: string;
  }) => {
    log.i("sendStatutACorrigerMail - In", { email });
    if (!email) {
      throw new AppError(
        "Email manquant pour l'envoi du mail de demande de correction d'agrément",
      );
    }
    const urlAgrement = config.frontUsagersDomain + "/mon-agrement";
    const html = sendTemplate.getBody(
      "Portail VAO - Demande de correction sur votre dossier de renouvellement d'agrément",
      [
        {
          p: [
            "Bonjour,",
            `Dans le cadre de l'instruction de votre demande d'agrément, la DREETS ${regionDreets} a identifié des éléments nécessitant une correction ou des précisions complémentaires.`,
            "Nous vous invitons à consulter le détail des corrections demandées depuis votre espace personnel sur le portail VAO :",
            `<a href='${urlAgrement}'>Consulter le dossier directement dans mon espace personnel</a>`,
            "Une fois les corrections effectuées, votre dossier reprendra son instruction.",
            "Cordialement.",
          ],
          type: "p",
        },
      ],
      `L'équipe du SI VAO<BR><a href=${config.frontUsagersDomain}>Portail VAO</a>`,
      { includeSecurityNotice: true },
    );
    const params = {
      from: config.senderEmail,
      html,
      replyTo: config.senderEmail,
      subject:
        "Portail VAO - Demande de correction sur votre dossier de renouvellement d'agrément",
      to: email,
    };
    log.d("sendStatutACorrigerMail post email", { params });
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
    const urlAgrement = config.frontUsagersDomain + "/mon-agrement";
    const html = sendTemplate.getBody(
      "Portail VAO - Refus de votre agrément",
      [
        {
          p: [
            "Bonjour,",
            `La DREETS ${regionDreets} a terminé l'instruction de votre demande d'agrément.`,
            "Après examen de votre dossier, votre demande d'agrément a été refusée.",
            "Vous pouvez consulter le détail de cette décision depuis votre espace personnel sur le portail VAO :",
            `<a href='${urlAgrement}'>Consulter le dossier directement dans mon espace personnel</a>`,
            "Cordialement.",
          ],
          type: "p",
        },
      ],
      `L'équipe du SI VAO<BR><a href=${config.frontUsagersDomain}>Portail VAO</a>`,
      { includeSecurityNotice: true },
    );
    const params = {
      from: config.senderEmail,
      html,
      replyTo: config.senderEmail,
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
    typeDepot,
  }: {
    email: string;
    date: string;
    regionDreets: string;
    typeDepot: AGREMENT_TYPE_DEPOT;
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
    const regionPhrase = !regionDreets
      ? `Votre demande d’agrément a bien été transmise le ${date} à la DREETS compétente.`
      : `Votre demande d’agrément a bien été transmise le ${date} à la DREETS ${regionDreets}.`;
    const title = `Portail VAO – Confirmation de transmission de votre ${typeDepot === AGREMENT_TYPE_DEPOT.PREMIER ? "demande de premier agrément" : "demande de renouvellement d’agrément"}`;
    const html = sendTemplate.getBody(
      title,
      [
        {
          p: [
            "Bonjour,",
            regionPhrase,
            "Vous pouvez suivre l’avancement de votre dossier à tout moment depuis votre espace personnel sur le portail VAO :",
            `<a href='${config.frontUsagersDomain}/mon-agrement'>Consulter le dossier directement dans mon espace personnel</a>`,
            "Un email vous sera envoyé à chaque évolution du traitement de votre demande.",
          ],
          type: "p",
        },
      ],
      `<br>L’équipe du SI VAO<br><a href='${config.frontUsagersDomain}'>Portail VAO</a>`,
      { includeSecurityNotice: true },
    );
    const params = {
      from: config.senderEmail,
      html,
      replyTo: config.senderEmail,
      subject: title,
      to: email,
    };
    log.d("sendStatutTransmisMail post email", { params });
    return params;
  },
  sendStatutValideMail: ({
    email,
    regionDreets,
    numeroAgrement,
    dateObtention,
    dateFinValidite,
  }: {
    email: string[];
    regionDreets: string;
    numeroAgrement: string;
    dateObtention: Date;
    dateFinValidite: Date;
  }) => {
    log.i("sendStatutValideMail - In", { email });
    if (!email) {
      throw new AppError(
        "Email manquant pour l'envoi du mail de validation d'agrément",
      );
    }
    const urlAgrement = config.frontUsagersDomain + "/mon-agrement";
    const html = sendTemplate.getBody(
      "Portail VAO - Validation de votre demande d’agrément",
      [
        {
          p: [
            "Bonjour,",
            `La DREETS ${regionDreets} a terminé l'instruction de votre demande d'agrément.`,
            `Nous avons le plaisir de vous informer que votre demande d'agrément a été validée sous le N°${numeroAgrement}.`,
            `Votre agrément est valable à partir du ${formatFR(dateObtention)} et jusqu'au ${formatFR(dateFinValidite)}.`,
            "Vous pouvez consulter votre agrément depuis votre espace personnel sur le portail VAO :",
            `<a href='${urlAgrement}'>Consulter le dossier directement dans mon espace personnel</a>`,
            "Cordialement.",
          ],
          type: "p",
        },
      ],
      `L'équipe du SI VAO<BR><a href=${config.frontUsagersDomain}>Portail VAO</a>`,
      { includeSecurityNotice: true },
    );
    const params = {
      from: config.senderEmail,
      html,
      replyTo: config.senderEmail,
      subject: "Portail VAO - Validation de votre demande d’agrément",
      to: email,
    };
    log.d("sendStatutValideMail post email", { params });
    return params;
  },
};
