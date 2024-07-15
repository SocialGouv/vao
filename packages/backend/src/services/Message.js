const pool = require("../utils/pgpool").getPool();
const logger = require("../utils/logger");

const AppError = require("../utils/error");

const log = logger(module.filename);

const query = {
  create: `INSERT INTO front.demande_sejour_message (declaration_id,front_user_id,back_user_id,message, file, created_at) 
    VALUES ($1,$2,$3,$4,$5, NOW() )
    RETURNING id as id;
    `,
  // delete: (criterias) => [
  //   `
  //     DELETE FROM front.sessions
  //     WHERE 1=1
  //     ${Object.keys(criterias)
  //       .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
  //       .join(" ")}
  //     `,
  //   Object.values(criterias),
  // ],
  select: `
    SELECT
      m.id as id,
      m.front_user_id as "frontUserId",
      m.back_user_id as "backUserId",
      m.message as "message",
      m.created_at as "created",
      fu.prenom as "frontUserPrenom",
      bu.prenom as "backUserPrenom",
      m.file as file
    FROM front.demande_sejour_message m
    LEFT JOIN front.users fu ON fu.id = m.front_user_id
    LEFT JOIN back.users bu ON bu.id = m.back_user_id
    WHERE m.declaration_id = $1
      `,
};

module.exports.post = async (declarationId, userId, message, file, sender) => {
  log.i("create - IN");
  const response =
    sender === "back"
      ? await pool.query(query.create, [
          declarationId,
          null,
          userId,
          message,
          file,
        ])
      : await pool.query(query.create, [
          declarationId,
          userId,
          null,
          message,
          file,
        ]);
  const { id } = response && response.rows[0];
  if (!id) throw new AppError("erreur sur l'insertion du message'");
  log.i("create - DONE");
  return id;
};

module.exports.select = async (declarationId) => {
  log.i("select - IN");
  const messages = await pool.query(query.select, [declarationId]);
  if (!messages) throw new AppError("erreur sur l'insertion du message'");
  log.i("select - DONE");
  return messages.rows;
};
