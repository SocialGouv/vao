const pool = require("../utils/pgpool").getPool();
const logger = require("../utils/logger");

const AppError = require("../utils/error");

const log = logger(module.filename);

const query = {
  create: `INSERT INTO front.demande_sejour_message (declaration_id,front_user_id,back_user_id,message, file, created_at)
    VALUES ($1,$2,$3,$4,$5, NOW() )
    RETURNING id as id;
    `,
  getDsIdByUuid: `
    SELECT m.declaration_id as "declarationId"
    FROM front.demande_sejour_message m
    WHERE file->>'uuid' = $1
  `,
  markAsRead: `
      UPDATE front.demande_sejour_message
      SET read_at = current_timestamp
      WHERE declaration_id =$1
      AND read_at is NULL
      AND 
        CASE 
          WHEN $2 = 'back' THEN front_user_id IS NOT NULL
          ELSE back_user_id IS NOT NULL
        END
      `,
  select: `
    SELECT
      m.id as id,
      m.front_user_id as "frontUserId",
      m.back_user_id as "backUserId",
      m.message as "message",
      m.created_at as "created",
      m.read_at as "readAt",
      fu.prenom as "frontUserPrenom",
      bu.prenom as "backUserPrenom",
      m.file as file
    FROM front.demande_sejour_message m
    LEFT JOIN front.users fu ON fu.id = m.front_user_id
    LEFT JOIN back.users bu ON bu.id = m.back_user_id
    WHERE m.declaration_id = $1
    ORDER BY m.created_at
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

module.exports.getDsIdByUuid = async (uuid) => {
  log.i("getDsIdByUuid - IN");
  console.log("UUID", uuid);
  const response = await pool.query(query.getDsIdByUuid, [uuid]);
  console.log(response.rows);
  log.d("getDsIdByUuid - DONE");
  return response.rows[0];
};

module.exports.select = async (declarationId) => {
  log.i("select - IN");
  const messages = await pool.query(query.select, [declarationId]);
  if (!messages) throw new AppError("erreur sur la récupération des messages'");
  log.i("select - DONE");
  return messages.rows;
};

module.exports.markAsRead = async (declarationId, origin) => {
  log.i("markAsRead - IN");
  const messages = await pool.query(query.markAsRead, [declarationId, origin]);
  if (!messages) throw new AppError("erreur sur la lecture des messages'");
  log.i(messages.rowCount);
  log.i("markAsRead - DONE");
  return messages.rowCount;
};
