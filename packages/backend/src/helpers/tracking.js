const actions = {
  creation: "CREATION",
  deactivation: "DEACTIVATION",
  deletion: "DELETION",
  modification: "MODIFICATION",
};

module.exports.actions = actions;

const entities = {
  demandeSejour: "DEMANDE_SEJOUR",
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
