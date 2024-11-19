const { CronJob } = require("cron");
const AppError = require("../../utils/error");

const run = require("../run");
const logger = require("../../utils/logger");
const pool = require("../../utils/pgpool").getPool();
const { statuts } = require("../../helpers/ds-statuts");
const Send = require("../../services/mail").mailService.send;
const sendTemplate = require("../../helpers/mail");

const {
  senderEmail,
  frontUsagersDomain,
  frontBODomain,
} = require("../../config");

const { name, cron } = require("../../config").crons.request.notifyactionsbo;

const log = logger(module.filename);

const generateRappelQuery = (
  statutsArray,
  additionalColumns = "",
  additionalJoins = "",
  additionalGroupBy = "",
  additionalOrderBy = "",
) => `
  WITH hebergement_exploded AS (
    SELECT
      DS.ID as "id",
      DSTH.DATE_DEBUT as "date_debut_hebergement",
      A.CODE_INSEE as "code_insee"
    FROM
      FRONT.DEMANDE_SEJOUR DS
      INNER JOIN FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT DSTH ON DSTH.DEMANDE_SEJOUR_ID = DS.ID
      INNER JOIN FRONT.HEBERGEMENT H ON H.ID = DSTH.HEBERGEMENT_ID
      INNER JOIN FRONT.ADRESSE A ON A.ID = H.ADRESSE_ID
    )
    SELECT
      ds.id,
      ds.id_fonctionnelle,
      ds.date_debut,
      ds.statut,
      ds.libelle as titre,
      TO_CHAR(ds.date_debut, 'DD/MM/YYYY') as date_debut,
      use.mail,
      ${additionalColumns}
      ((ds.date_debut - ((10) * INTERVAL '1 day'))::date <= now()::date) as isalerte,
      string_agg(com.label, ', ' ORDER BY he.date_debut_hebergement::date ASC) AS Communes
    FROM
      hebergement_exploded he
      INNER JOIN front.demande_sejour ds ON ds.id = he.id
      INNER JOIN geo.communes com ON com.code_insee = he.code_insee AND com.date_fin is null
      ${additionalJoins}
    WHERE (ds.date_debut)::date>=now()::date
      AND ds.statut IN (${statutsArray})
    GROUP BY
      ds.id,
      ds.id_fonctionnelle,
      ds.date_debut,
      ds.statut,
      ds.libelle,
      use.mail,
      ${additionalGroupBy}
      isalerte
    ORDER BY
      ${additionalOrderBy}
      isalerte DESC,
      ds.date_debut ASC;
`;

const query = {
  fetchRappelDSBO: generateRappelQuery(
    `'${statuts.TRANSMISE}','${statuts.EN_COURS}','${statuts.TRANSMISE_8J}','${statuts.EN_COURS_8J}'`,
    ``,
    ` INNER JOIN geo.territoires ter ON ter.code = ds.departement_suivi INNER JOIN back.users use ON ter.code = use.ter_code `,
    ``,
    `use.mail,`,
  ),
  fetchRappelDSFUsager: generateRappelQuery(
    `'${statuts.ATTENTE_8_JOUR}','${statuts.A_MODIFIER}','${statuts.A_MODIFIER_8J}'`,
    `((ds.responsable_sejour::jsonb)->>'email')::text as mailresp, mail || ';' || ((ds.responsable_sejour::jsonb)->>'email')::text as mails,`,
    ` INNER JOIN front.user_organisme uso ON uso.org_id = ds.organisme_id INNER JOIN front.users use ON use.id = uso.use_id `,
    `mailresp,`,
    `mail,`,
  ),
};

const action = async () => {
  log.i(`notifyRappelActionsBO - IN`);
  // Création des contenus pour les envoies BackOffice
  const { rowCount: countRappelActionsBO, rows: rowsRappelActionsBO } =
    await pool.query(query.fetchRappelDSBO);
  createContent({
    isBO: true,
    rowCount: countRappelActionsBO,
    rows: rowsRappelActionsBO,
  });
  // Création des contenus pour les envoies FrontUsagers
  const {
    rowCount: countRappelActionsFUsager,
    rows: rowsRappelActionsFUsager,
  } = await pool.query(query.fetchRappelDSFUsager);
  createContent({
    isBO: false,
    rowCount: countRappelActionsFUsager,
    rows: rowsRappelActionsFUsager,
  });

  log.i(`notifyRappelds8j15j - DONE`);
};
async function createContent({ isBO, rowCount, rows }) {
  if (rowCount === 0) return;
  const mails = getUniqueMails({ isBO, rows });
  for (const mail of mails) {
    const emailContent = [];
    emailContent.push(...generateInitialEmailContent());
    const listeDsAvecAlerte = filterRowsWithAlert({ isBO, mail, rows });
    emailContent.push(...appendContentForAlert({ listeDsAvecAlerte }));
    const listeDsSansAlerte = filterRowsWithoutAlert({ isBO, mail, rows });
    emailContent.push(...appendContentForNonAlert({ listeDsSansAlerte }));
    try {
      await sendMail({ emailContent, isBO, mail });
    } catch (error) {
      log.w(error);
    }
  }
}

function getUniqueMails({ isBO, rows }) {
  return [
    ...new Set(
      rows
        .filter((ds) => (isBO ? ds.mail : ds.mails))
        .map((ds) => (isBO ? ds.mail : ds.mails)),
    ),
  ];
}

function generateInitialEmailContent() {
  return [
    "<p>Bonjour,</p>",
    "<p>Vous trouverez ci-dessous la liste des déclarations VAO sur lesquelles une action de votre part est attendue,</p>",
  ];
}

function filterRowsWithAlert({ isBO, rows, mail }) {
  return rows.filter(
    (ds) => ds.isalerte && (isBO ? ds.mail === mail : ds.mails === mail),
  );
}

function filterRowsWithoutAlert({ isBO, rows, mail }) {
  return rows.filter(
    (ds) => !ds.isalerte && (isBO ? ds.mail === mail : ds.mails === mail),
  );
}

function appendContentForAlert({ listeDsAvecAlerte }) {
  const newContent = [];
  if (listeDsAvecAlerte.length > 0) {
    newContent.push(
      "<p><b>DECLARATIONS NECESSITANT UNE ACTION URGENTE DE VOTRE PART dont la date de début de séjour est à moins de 10 jours</b>",
    );
    newContent.push("<ul>");
    for (const ds of listeDsAvecAlerte) {
      const retourliste = createDSContent({ ds });
      newContent.push(...retourliste);
    }
    newContent.push("</ul></p>");
  }
  return newContent;
}

function appendContentForNonAlert({ listeDsSansAlerte }) {
  const newContent = [];
  if (listeDsSansAlerte.length > 0) {
    newContent.push(
      "<p><b>AUTRES DECLARATIONS DE SEJOUR NECESSITANT UNE ACTION DE VOTRE PART</b>",
    );
    newContent.push("<ul>");
    for (const ds of listeDsSansAlerte) {
      const retourliste = createDSContent({ ds });
      newContent.push(...retourliste);
    }
    newContent.push("</ul></p>");
  }
  return newContent;
}

async function sendMail({ emailContent, mail, isBO }) {
  Send(
    await sendNotificationMail({
      content: emailContent.join("\n"),
      email: mail.split(";"),
      isBO,
    }),
  );
}

function createDSContent({ ds }) {
  const content = [];
  content.push(`<p>${ds.id_fonctionnelle} - ${ds.communes}<br>`);
  content.push(`Statut de la déclaration : ${ds.statut}<br>`);
  content.push(`Date de début du séjour :  ${ds.date_debut}<br></p>`);
  return content;
}

async function sendNotificationMail({ content, email, isBO }) {
  log.i("sendNotificationMail - In", {
    email,
  });
  const textDeFin = [];
  let link = "";
  if (isBO) {
    link = frontBODomain + "/sejours";
  } else {
    link = frontUsagersDomain + "/demande-sejour/liste";
    textDeFin.push(
      `<p>Si vous avez des difficultés pour traiter vos déclarations, vous vous rappelons que vous pouvez <a href="https://vao-assistance.atlassian.net/servicedesk/customer/portals">contacter le support utilisateur</a>.</p>`,
    );
    textDeFin.push(
      `<p>De plus, vous avez toujours la possibilité d’annuler des déclarations de séjours qui ne sont plus d’actualité pour garder votre tableau à jour.</p>`,
    );
  }

  if (!email) {
    const message = `Le paramètre email manque à la requête`;
    log.w(`sendNotificationMail - ${message}`);
    throw new AppError(message);
  }
  const html = sendTemplate.getBody(
    ``,
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
  const params = {
    from: senderEmail,
    html: html,
    replyTo: senderEmail,
    subject: `Séjours VAO – Récapitulatif des déclarations de séjour en attente de traitement de votre part`,
    to: email,
  };
  log.d("sendNotificationMail post email", {
    params,
  });
  return params;
}

const job = new CronJob(cron, run(name, action));

module.exports.job = job;
module.exports.action = action;
