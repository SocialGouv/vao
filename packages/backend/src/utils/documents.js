const demandeSejour = require("../services/DemandeSejour");
const agrement = require("../services/Agrement");
const hebergement = require("../services/hebergement/Hebergement");
const message = require("../services/Message");
const protocole_transport = require("../services/organisme/ProtocoleTransport");
const protocole_sanitaire = require("../services/organisme/ProtocoleSanitaire");
const organisme = require("../services/Organisme");
const AppError = require("../utils/error");

// imaginons que tu aies plusieurs handlers
async function handleAgrements(uuid) {
  try {
    const { id } = await agrement.getByUuid(uuid);
    return id;
  } catch (err) {
    throw new AppError("Récupération de l'agrément associé a échoué", {
      cause: err,
    });
  }
}

async function handleDemandeSejour(uuid) {
  const { id } = await demandeSejour.getByUuid(uuid);
  return id;
}

async function handleHebergement(uuid) {
  const { id } = await hebergement.getByUuid(uuid);
  return id;
}

async function handleMessage(uuid) {
  const { declarationId: id } = await message.getDsIdByUuid(uuid);
  return id;
}

// TODO : Le protocole sanitaire et transport peuvent être rattaché à un organisme ou à une demande de séjour
// Il faut gérer les deux cas ici
async function handleOrgProtocoleTransportFiles(uuid) {
  const result = await protocole_transport.getOrgIdByUuid(uuid);

  // Récupération de l'agrément via l'organisme
  const agrementId = await organisme.getAgrementById(result?.organismeId);
  console.log("agrement", agrementId);

  //const { declarationId: id } = await message.getDsIdByUuid(uuid);
  //console.log("Après Récupération de la demande de séjour associé...", id);
  return agrementId;
}

async function handleOrgProtocoleSanitaireFiles(uuid) {
  console.log("Traitement pour ORG_PROTOCOLE_SANITAIRE_FILES", uuid);
  //const { organismeId: id } = await protocole_transport.getOrgIdByUuid(uuid);
  const result = await protocole_sanitaire.getOrgIdByUuid(uuid);
  console.log("result", result);
  // Récupération de l'agrément via l'organisme
  const agrementId = await organisme.getAgrementById(result?.organismeId);
  console.log("agrement", agrementId);

  //const { declarationId: id } = await message.getDsIdByUuid(uuid);
  //console.log("Après Récupération de la demande de séjour associé...", id);
  return agrementId;
}

// mapping table -> handler
const tableHandlers = {
  agrements: handleAgrements,
  demande_sejour: handleDemandeSejour,
  hebergement: handleHebergement,
  message: handleMessage,
  org_protocole_sanitaire_files: handleOrgProtocoleSanitaireFiles,
  org_protocole_transport_files: handleOrgProtocoleTransportFiles,
};

/**
 * Exécute la fonction associée à une table
 */
function processCategoryDoc(categoryDoc, uuid) {
  console.log("processCategoryDoc", categoryDoc, uuid);
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
