import { senderEmail, domains } from "../config";
import constructMail from "../utils/mails";
import { transportEmails } from "../utils/transporter";

import type { BlocageTemporaire3mRow } from "./blocageTemporaire3mtype";

const RESET_PASSWORD_URL = `${domains.frontUsagersDomain}/connexion/mot-de-passe-oublie`;

const generateEmail = ({ mail }: { mail: string }) => {
	const html = constructMail(
		"Blocage temporaire de votre compte VAO",
		[
			{
				p: [
					`Bonjour,<br><br>Votre compte VAO n’a pas été utilisé depuis 3 mois.<br>Pour des raisons de sécurité, il a été désactivé provisoirement.<br><br>Pour réactiver votre compte, vous devez réinitialiser votre mot de passe en cliquant sur le lien ci-dessous :<br><a href=\"${RESET_PASSWORD_URL}\">${RESET_PASSWORD_URL}</a>`
				],
				type: "p",
			},
		],
		`L’équipe du SI VAO<BR><a href=${domains.frontUsagersDomain}>Portail VAO</a><br><br><i>Ce courriel est un message automatique, merci de ne pas répondre.</i>`
	);
	return {
		from: senderEmail,
		replyTo: senderEmail,
		html,
		subject: `Portail VAO - Désactivation provisoire de votre compte VAO`,
		to: [mail],
	};
};

export const sendBlocageTemporaire3mRow = async (
	rows: (BlocageTemporaire3mRow & { mail: string })[]
) => {
	const mails = rows.map(({ mail }) => generateEmail({ mail }));
	return await transportEmails(mails);
};
