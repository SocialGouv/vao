import { OrganismeDto } from "@vao/shared-bridge";

import { frontBODomain, senderEmail } from "../../config";
import sendTemplate from "../../helpers/mail";
import { partOrganisme } from "../../helpers/org-part";

export const AgrementMailAdmin = {
  sendStatutCompletudeMail: ({
    mailDreets,
    Organisme,
    agrementId,
  }: {
    mailDreets: string[];
    Organisme: OrganismeDto;
    agrementId: number;
  }) => {
    const urlAgrement = frontBODomain + "/agrements/" + agrementId;
    const html = sendTemplate.getBody(
      "Portail VAO – Confirmation de complétude du dossier de renouvellement d’agrément",
      [
        {
          p: [
            "Bonjour,",
            `Vous venez de confirmer la complétude du dossier de renouvellement d’agrément de l’OVA ${Organisme.typeOrganisme === partOrganisme.PERSONNE_MORALE ? Organisme.personneMorale.raisonSociale : (Organisme.personnePhysique?.nomUsage ?? Organisme.personnePhysique?.nomNaissance)}.`,
            "À partir de cette date, un délai légal de <strong>2 mois calendaires</strong> est activé pour instruire la demande et rendre une décision expresse.",
            "Sans décision expresse à l’issue de ce délai, la demande sera automatiquement <strong>validée par tacite accord</strong>. La décision implicite d’acceptation du dossier ne court qu'à compter du moment où l’ensemble des pièces sont fournies par l’OVA. En cas de demande de compléments d’information par la DREETS, le délai est donc suspendu.",
            "Un accusé a été adressé automatiquement à l’OVA concerné.",
            "Vous pouvez consulter le dossier à tout moment via le portail VAO :",
            `<a href="${urlAgrement}">${urlAgrement}</a>`,
          ],
          type: "p",
        },
      ],
      `L'équipe du SI VAO<BR><a href=${frontBODomain}>Portail VAO</a>`,
    );

    return {
      from: senderEmail,
      html,
      replyTo: senderEmail,
      subject:
        "Portail VAO – Confirmation de complétude du dossier de renouvellement d’agrément",
      to: mailDreets,
    };
  },
};
