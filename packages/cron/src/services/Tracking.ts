import { pool } from "../db";
import { Actions, Entities, UserTypes } from "../helpers/tracking"; // <-- adapte le chemin si besoin

const query = {
  add: `
    INSERT INTO tracking_actions (entity, entity_id, action, data, user_id, user_type)
    VALUES ($1, $2, $3, $4, $5 ,$6)
  `,
};

interface AddHistoricParams {
  entity: Entities;
  entityId: string | number;
  action: Actions;
  data?: Record<string, unknown> | null;
  userId: string | number;
  userType: UserTypes;
}

export const addHistoric = async ({
  entity,
  entityId,
  action,
  data = null,
  userId,
  userType,
}: AddHistoricParams): Promise<void> => {
  if (!action || !entity || !userType) {
    throw new Error(`${__filename}: Invalid action, entity or user type`);
  }

  await pool.query(query.add, [
    entity,
    entityId,
    action,
    data,
    userId,
    userType,
  ]);
};
