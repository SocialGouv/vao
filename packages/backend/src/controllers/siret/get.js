const axios = require("axios");
const config = require("../../config");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  const { siret } = req.params;
  log.i("In", siret);
  try {
    const { apiEntreprise } = config;
    log.i(apiEntreprise);
    // const displayedFields = `siren,nic,denominationUniteLegale,statutDiffusionEtablissement,numeroVoieEtablissement,typeVoieEtablissement,complementAdresseEtablissement,libelleVoieEtablissement,codePostalEtablissement,libelleCommuneEtablissement`;
    // const params = `date=${dateJour}`;

    const url = `${apiEntreprise.uri}/insee/sirene/etablissements/${siret}?context=${apiEntreprise.context}&recipient=${apiEntreprise.recipient}&object=${apiEntreprise.object}`;
    const { data: reponse } = await axios.get(url, {
      headers: { Authorization: `Bearer ${config.apiEntreprise.token}` },
    });
    log.i(reponse.data);
    return res.status(200).json({ uniteLegale: [reponse.data] });
  } catch (err) {
    log.w(err);
    return res
      .status(400)
      .json({ message: "erreur sur l'appel de l'api entreprise" });
  }
};
