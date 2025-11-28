const {
  EtablissementsSecondairesRepository,
} = require("../../repositories/usagers/EtablissementsSecondaires");
const logger = require("../../utils/logger");
const PersonneMorale = require("./PersonneMorale");

const log = logger(module.filename);

module.exports.createOrUpdate = async (client, organismeId, parametre) => {
  log.i("createOrUpdate - IN");

  await client.query("BEGIN");

  const { id: personneMoraleId } =
    await PersonneMorale.getIdByOrganismeId(organismeId);
  await EtablissementsSecondairesRepository.removeEtablissements(
    personneMoraleId,
  );
  const etablissements = parametre.etablissements;
  await EtablissementsSecondairesRepository.associateEtablissement({
    client,
    etablissements,
    personneMoraleId,
  });

  log.i("createOrUpdate - DONE");
};
