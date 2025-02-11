const pool = require("../utils/pgpool").getPool();

const actions = {
  creation: "CREATION",
  deactivation: "DEACTIVATION",
  deletion: "DELETION",
  modification: "MODIFICATION",
};

module.exports.actions = actions;

const entities = {
  eig: "EIG",
  userBack: "USER_BACK",
  userFront: "USER_FRONT",
};

module.exports.entities = entities;

const userTypes = {
  back: "BACK",
  front: "FRONT",
};

module.exports.userTypes = userTypes;

const query = {
  add: `
    INSERT INTO tracking_actions (entity, entity_id, action, data, user_id, user_type)
    VALUES ($1, $2, $3, $4, $5 ,$6)
  `,
};

module.exports.addHistoric = async ({
  entity,
  entityId,
  action,
  data = null,
  userId,
  userType,
}) => {
  if (!action || !entity || !userType) {
    throw new Error(`${module.filename}: Invalid action, entity or user type`, {
      action,
      entity,
      userType,
    });
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
