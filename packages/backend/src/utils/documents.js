const demandeSejour = require("../services/DemandeSejour");
const agrement = require("../services/Agrement");

// imaginons que tu aies plusieurs handlers
async function handleAgrements(uuid) {
  console.log("Traitement pour AGREMENTS", uuid);
  const { id } = await agrement.getByUuid(uuid);
  console.log("Après Récupération de l'organisme associée...", id);
  return id;
}

async function handleDemandeSejour(uuid) {
  console.log("Traitement pour DEMANDE_SEJOUR", uuid);
  console.log("Récupération de la demande de séjour associée...", uuid);
  const { id } = await demandeSejour.getByUuid(uuid);
  console.log("Après Récupération de la demande de séjour associée...", id);
  return id;
}

async function handleHebergement(doc) {
  console.log("Traitement pour HEBERGEMENT", doc);
}

async function handleMessage(doc) {
  console.log("Traitement pour MESSAGE", doc);
}

// mapping table -> handler
const tableHandlers = {
  agrements: handleAgrements,
  demande_sejour: handleDemandeSejour,
  hebergement: handleHebergement,
  message: handleMessage,
  // ... tu ajoutes les autres si besoin
};

/**
 * Exécute la fonction associée à une table
 */
function processCategoryDoc(categoryDoc, uuid) {
  const handler = tableHandlers[categoryDoc.table];
  if (handler) {
    return handler(uuid);
  } else {
    console.warn("Aucun handler pour cette table :", categoryDoc.table);
  }
}

module.exports = {
  processCategoryDoc,
};
