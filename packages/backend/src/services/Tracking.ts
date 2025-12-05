import { Action, Entity, UserType } from "@vao/shared-bridge";

import { getPool } from "../utils/pgpool";

interface AddHistoricParams {
  entity: Entity;
  entityId: number | string | null;
  action: Action;
  data?: any | null;
  userId?: number | string | null;
  userType: UserType;
}

const query = {
  add: `
    INSERT INTO tracking_actions (entity, entity_id, action, data, user_id, user_type)
    VALUES ($1, $2, $3, $4, $5 ,$6)
  `,
};

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

  await getPool().query(query.add, [
    entity,
    entityId,
    action,
    data,
    userId,
    userType,
  ]);
};
