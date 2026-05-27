import { config } from "../../config";
import * as sendTemplate from "../../helpers/mail";

export const UserMailUsagers = {
  getOtpCode: ({ mail, otpCode }: { mail: string; otpCode: number }) => {
    const html = sendTemplate.getBody(
      "Portail VAO - Votre code de vérification pour accéder à votre compte",
      [
        {
          p: [
            "Bonjour,",
            "Vous tentez de vous connecter à votre compte sur le portail <strong>VAO</strong>.",
            "Veuillez saisir le code de vérification ci-dessous pour confirmer votre identité :",
            "<strong>Votre code de vérification :</strong>",
            `<div style="
              font-family: monospace;
              font-size: 22px;
              text-align: center;
              margin: 12px 0;
            ">
              <strong>${otpCode}</strong>
            </div>`,
            "Ce code est <strong>valable pendant 15 minutes</strong> et à <strong>usage unique</strong>.",
            "Si vous ne parvenez pas à le saisir à temps, vous pourrez en demander un nouveau depuis l’écran de connexion.",
            "⚠️ <strong>Important</strong>",
            `<ul style="padding-left:20px; margin:8px 0;">
              <li style="font-size:14px; line-height:22px;">
                Ne partagez jamais ce code.
              </li>
              <li style="font-size:14px; line-height:22px;">
                Si vous n’êtes pas à l’origine de cette tentative de connexion, ignorez simplement cet email.
              </li>
              <li style="font-size:14px; line-height:22px;">
                Votre compte restera protégé et aucune action ne sera effectuée sans ce code.
              </li>
            </ul>`,
          ],
          type: "p",
        },
      ],
      `L'équipe du SI VAO<BR><a href=${config.frontUsagersDomain}>Portail VAO</a>`,
    );

    return {
      from: config.senderEmail,
      html,
      replyTo: config.senderEmail,
      subject:
        "Portail VAO - Votre code de vérification pour accéder à votre compte",
      to: mail,
    };
  },
};
