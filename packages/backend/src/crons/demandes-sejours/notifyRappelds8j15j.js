const { CronJob } = require("cron");
const AppError = require("../../utils/error");

const run = require("../run");
const logger = require("../../utils/logger");
const pool = require("../../utils/pgpool").getPool();
const { statuts } = require("../../helpers/ds-statuts");
const Send = require("../../services/mail").mailService.send;
const sendTemplate = require("../../helpers/mail");

const { senderEmail } = require("../../config");

const { name, cron, deadlineRemind } = require("../../config").crons.request.notify;

const log = logger(module.filename);

// Interval 8 Jours avant le début du séjour + 15 jours avant l'échéance de déclaration soit 23 jours avant le début
// date_debut, (date_debut - (23 * interval '1 day'))::date, now()::date>=(date_debut - (23 * interval '1 day'))::date  
// (ds.date_debut - (8 * interval '1 day'))::date  as datelimite,rappel_ds_compl
const query = {
  fetchRappelDeclarationSejour8j15j: `
    select ds.id, ds.date_debut,ds.statut, 
    ds.libelle as titre,
    to_char((ds.date_debut - (('${deadlineRemind}'+8) * interval '1 day'))::date, 'DD/MM/YYYY') as date_debut_alerte,
    use.mail
      from front.demande_sejour ds
      inner join front.user_organisme uso on uso.org_id = ds.organisme_id
      inner join front.users use on use.id = uso.use_id
    where (ds.date_debut - (('${deadlineRemind}'+8) * interval '1 day'))::date<= now()::date
    and now()::date<=(ds.date_debut - (8 * interval '1 day'))::date  
      and ds.statut = '${statuts.ATTENTE_8_JOUR}'
      and ds.rappel_ds_compl = false;    
    `,
  fetchUpdateRappel: `
    update front.demande_sejour 
      set rappel_ds_compl = true 
      where id = $1;    
    `,
};

const action = async () => {
  log.i(`notifyRappelds8j15j - IN`);
  const { rowCount: countRappelDS815, rows: rowsRappelDS815 } =
    await pool.query(query.fetchRappelDeclarationSejour8j15j);
  if (countRappelDS815 > 0) {
    rowsRappelDS815.forEach(async (ds8j) => {
      try {
        await Send(
          await sendNotificationMail({
            date_debut_alerte: ds8j.date_debut_alerte,
            email: ds8j.mail,
            titre: ds8j.titre,
          }),
        );
        await pool.query(query.fetchUpdateRappel, [ds8j.id]);
      } catch (error) {
        log.w(error);
      }
    });
  }
};

async function sendNotificationMail({ date_debut_alerte, email, titre }) {
  log.i("sendNotificationMail - In", {
    email,
  });
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
        <p>Bonjour,</p>
        <p>Il vous reste ${deadlineRemind} jours à compter du ${date_debut_alerte} pour réaliser la déclaration de séjour à 8 jours pour le séjour «${titre}».<br>
        Passé ce délai, il ne vous sera plus possible de constituer le dossier pour votre séjour.</p>
        `,
        ],
        type: "p",
      },
    ],
    "L'équipe du SI VAO<br><br><i>Ce courriel est un message automatique, merci de ne pas répondre.</i>",
  );
  const params = {
    from: senderEmail,
    html: html,
    replyTo: senderEmail,
    subject: `Il vous reste ${deadlineRemind} jours pour réaliser la déclaration de séjour à 8 jours pour le séjour «${titre}»`,
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