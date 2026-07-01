import AppError from "../utils/error";
import { logger } from "../utils/logger";
import { getPool } from "../utils/pgpool";

const log = logger(module.filename);

const query = {
  create: `INSERT INTO front.demande_sejour_message (declaration_id,front_user_id,back_user_id,message, file, created_at)
    VALUES ($1,$2,$3,$4,$5, NOW() )
    RETURNING id as id;
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
      m.created_at as "createdAt",
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

export const post = async (
  declarationId: string,
  userId: string | undefined,
  message: string | null | undefined,
  file: any | null | undefined,
  sender: string,
) => {
  log.i("create - IN");
  const response =
    sender === "back"
      ? await getPool().query(query.create, [
          declarationId,
          null,
          userId,
          message,
          file,
        ])
      : await getPool().query(query.create, [
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

export const select = async (declarationId: string) => {
  log.i("select - IN");
  const messages = await getPool().query(query.select, [declarationId]);
  if (!messages) throw new AppError("erreur sur la récupération des messages'");
  log.i("select - DONE");
  return messages.rows;
};

export const markAsRead = async (declarationId: string, origin: string) => {
  log.i("markAsRead - IN");
  const messages = await getPool().query(query.markAsRead, [
    declarationId,
    origin,
  ]);
  if (!messages) throw new AppError("erreur sur la lecture des messages'");
  log.i(messages.rowCount?.toString() + " messages marqués comme lus");
  log.i("markAsRead - DONE");
  return messages.rowCount;
};

export default {
  markAsRead,
  post,
  select,
};
