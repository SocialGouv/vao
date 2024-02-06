const axios = require("axios");
const dayjs = require("dayjs");
const logger = require("../../utils/logger");
const getToken = require("./getToken");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  const { siret } = req.params;
  log.i("In", siret);
  const dateJour = dayjs().format("YYYY-MM-DD");
  const siren = siret.substring(0, 9);
  try {
    const token = await getToken();
    const displayedFields = `siren,nic,denominationUniteLegale,statutDiffusionEtablissement,numeroVoieEtablissement,typeVoieEtablissement,complementAdresseEtablissement,libelleVoieEtablissement,codePostalEtablissement,libelleCommuneEtablissement`;
    // const params = `date=${dateJour}`;
    try {
      const { data: reponse } = await axios.get(
        `https://api.insee.fr/entreprises/sirene/V3/siret/${siret}?date=${dateJour}&champs=${displayedFields}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.status(200).json({ etablissements: [reponse.etablissement] });
    } catch (err) {
      try {
        const { data: liste } = await axios.get(
          `https://api.insee.fr/entreprises/sirene/V3/siret?q=siren:${siren}&champs=${displayedFields}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.status(200).json({ etablissements: liste.etablissements });
      } catch (error) {
        log.w("non existing SIREN");
        return res
          .status(400)
          .json({ message: "erreur sur la génération du token insse" });
      }
    }
  } catch (err) {
    log.w(err);
    return res
      .status(400)
      .json({ message: "erreur sur la génération du token insse" });
  }
};
