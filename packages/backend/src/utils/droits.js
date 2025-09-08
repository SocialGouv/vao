//const demandeSejour = require("../services/DemandeSejour");
const BoUser = require("../services/BoUser");
// imaginons que tu aies plusieurs handlers
function handleHebergement(doc) {
  console.log("Traitement pour AGREMENTS", doc);
}

async function handleDemandeSejour(id, userId) {
  const isAllowed = await BoUser.isAllowToAccessDemandeSejour(userId, id);
  console.log("isAllowed", isAllowed);

  //console.log("Traitement pour DEMANDE_SEJOUR", uuid);
  //console.log("Récupération de la demande de séjour associée...", uuid);
  //const { id } = await demandeSejour.getByUuid(uuid);
  //console.log("Après Récupération de la demande de séjour associée...", id);
  return isAllowed;
}

async function handleAgrement(id, userId) {
  console.log("Traitement pour AGREMENT", id);
  const isAllowed = await BoUser.isAllowToAccessAgrement(userId, id);
  console.log("isAllowed", isAllowed);

  //console.log("Traitement pour DEMANDE_SEJOUR", uuid);
  //console.log("Récupération de la demande de séjour associée...", uuid);
  //const { id } = await demandeSejour.getByUuid(uuid);
  //console.log("Après Récupération de la demande de séjour associée...", id);
  return isAllowed;
}

function handleMessage(doc) {
  console.log("Traitement pour MESSAGE", doc);
}

// mapping table -> handler
const droitHandlers = {
  agrement: handleAgrement,
  demande_sejour: handleDemandeSejour,
  hebergement: handleHebergement,
  message: handleMessage,
  // ... tu ajoutes les autres si besoin
};

/**
 * Exécute la fonction associée à une table
 */
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
