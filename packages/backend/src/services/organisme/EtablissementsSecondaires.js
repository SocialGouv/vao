const {
  EtablissementsSecondairesRepository,
} = require("../../repositories/usagers/EtablissementsSecondaires");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports.createOrUpdate = async (client, personneMoraleId, parametre) => {
  log.i("createOrUpdate - IN");

  await EtablissementsSecondairesRepository.removeEtablissements({
    client,
    personneMoraleId,
  });
  const etablissements = parametre.etablissements;
  await EtablissementsSecondairesRepository.associateEtablissement({
    client,
    etablissements,
    personneMoraleId,
  });

  log.i("createOrUpdate - DONE");
};
