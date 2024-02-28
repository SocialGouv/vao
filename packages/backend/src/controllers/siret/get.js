const axios = require("axios");
const logger = require("../../utils/logger");
const config = require("../../config");
const dayjs = require("dayjs");
const getToken = require("./getToken");
const Referentiel = require("../../services/Referentiel");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  const { apiInsee } = config;
  // const { apiEntreprise } = config;
  const { siret } = req.params;
  log.i("In", siret);

  const siren = siret.length === 14 && siret.substring(0, 9);
  if (!siren) {
    log.w("siret isn't properly set");
    return res.status(400).json({ message: "parametre d'appel incorrect" });
  }
  try {
    const token = await getToken();
    const dateDuJour = dayjs().format("YYYY-MM-DD");
    const { data: reponse } = await axios.get(
      `${apiInsee.URL}/entreprises/sirene/V3/siret/${siret}?date=${dateDuJour}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const uniteLegale = reponse.etablissement;
    if (uniteLegale.uniteLegale.categorieJuridiqueUniteLegale) {
      uniteLegale.uniteLegale.categorieJuridiqueUniteLegale =
        (await Referentiel.getLibelle(
          uniteLegale.uniteLegale.categorieJuridiqueUniteLegale,
        )) ?? "statut indéterminé";
    }

    let etablissements = [];
    if (uniteLegale.etablissementSiege) {
      const { data: liste } = await axios.get(
        `${apiInsee.URL}/entreprises/sirene/V3/siret?q=siren:${siren}&nombre=50&champs=numeroVoieEtablissement,typeVoieEtablissement,libelleVoieEtablissement,codePostalEtablissement,libelleCommuneEtablissement,nic`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      etablissements = liste.etablissements ?? [];
    }
    // const url = `${apiEntreprise.uri}/insee/sirene/etablissements/${siret}?context=${apiEntreprise.context}&recipient=${apiEntreprise.recipient}&object=${apiEntreprise.object}`;
    // const { data: mandataires } = await axios.get(url, {
    //   headers: { Authorization: `Bearer ${config.apiEntreprise.token}` },
    // });
    // log.i(mandataires);

    return res.status(200).json({ etablissements, uniteLegale });
  } catch (err) {
    log.w(err);
    return res
      .status(400)
      .json({ message: "erreur sur l'appel de l'api INSEE" });
  }
};
