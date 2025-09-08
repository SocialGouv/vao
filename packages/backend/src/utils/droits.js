//const demandeSejour = require("../services/DemandeSejour");
const BoUser = require("../services/BoUser");
// imaginons que tu aies plusieurs handlers
async function handleHebergement(id, userId) {
  console.log("Traitement pour HEBERGEMENT", id);
  const isAllowed = await BoUser.isAllowToAccessHebergement(id, userId);
  console.log("isAllowed", isAllowed);
  return isAllowed;
}

async function handleDemandeSejour(id, userId) {
  const isAllowed = await BoUser.isAllowToAccessDemandeSejour(id, userId);
  console.log("isAllowed", isAllowed);
  return isAllowed;
}

async function handleAgrement(id, userId) {
  console.log("Traitement pour AGREMENT", id);
  const isAllowed = await BoUser.isAllowToAccessAgrement(id, userId);
  console.log("isAllowed", isAllowed);
  return isAllowed;
}

async function handleOrganisme(id, userId) {
  console.log("Traitement pour AGREMENT", id);
  const isAllowed = await BoUser.isAllowToAccessOrganisme(id, userId);
  console.log("isAllowed", isAllowed);
  return isAllowed;
}

// mapping table -> handler
const droitHandlers = {
  agrement: handleAgrement,
  demande_sejour: handleDemandeSejour,
  hebergement: handleHebergement,
  //  organisme: handleOrganisme,
};

function isUserAllowedForDroit(droit, userId, id) {
  console.log("isUserAllowedForDroit", droit, userId, id);
  if (!droit) {
    console.warn("Aucune table associée à cette catégorie de document");
    return false;
  }
  console.log("isUserAllowedForDroit categoryDoc.droit :", droit);
  const handler = droitHandlers[droit];
  console.log("isUserAllowedForDroit handler :", handler);
  if (handler) {
    return handler(userId, id);
  } else {
    console.warn("Aucun handler pour cette table :", droit);
  }
}

module.exports = {
  isUserAllowedForDroit,
};
