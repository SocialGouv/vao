const axios = require("axios");
const logger = require("../../utils/logger");
const config = require("../../config");
const dayjs = require("dayjs");
const { getToken } = require("../../services/Insee");
const Referentiel = require("../../services/Referentiel");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  const { apiInsee } = config;
  const { apiEntreprise } = config;
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
      `${apiInsee.URL}${apiInsee.URI}/siret/${siret}?date=${dateDuJour}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const uniteLegale = reponse.etablissement;
    if (uniteLegale.uniteLegale.categorieJuridiqueUniteLegale) {
      uniteLegale.uniteLegale.categorieJuridiqueUniteLegale =
        (await Referentiel.getLibelle(
          uniteLegale.uniteLegale.categorieJuridiqueUniteLegale,
        )) ?? "statut indéterminé";
    }
    let elements = [];
    if (uniteLegale.etablissementSiege) {
      const { data: liste } = await axios.get(
        `${apiInsee.URL}${apiInsee.URI}/siret?q=siren:${siren}&nombre=70&champs=numeroVoieEtablissement,typeVoieEtablissement,libelleVoieEtablissement,codePostalEtablissement,libelleCommuneEtablissement,nic,etatAdministratifUniteLegale`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      elements = liste.etablissements ?? [];
    }
    const etablissements = elements
      .filter((e) => e.uniteLegale.etatAdministratifUniteLegale === "A")
      .map((e) => {
        return {
          adresse: `${e.adresseEtablissement.numeroVoieEtablissement ? e.adresseEtablissement.numeroVoieEtablissement : ""} ${e.adresseEtablissement.typeVoieEtablissement} ${e.adresseEtablissement.libelleVoieEtablissement}`,
          codePostal: e.adresseEtablissement.codePostalEtablissement,
          commune: e.adresseEtablissement.libelleCommuneEtablissement,
          enabled: false,
          nic: e.nic,
        };
      });

    let representantsLegaux = [];
    let nomCommercial;
    try {
      const url = `${apiEntreprise.uri}/infogreffe/rcs/unites_legales/${siren}/extrait_kbis?context=${apiEntreprise.context}&object=${apiEntreprise.object}&recipient=${apiEntreprise.recipient}`;
      const { data: response } = await axios.get(url, {
        headers: { Authorization: `Bearer ${config.apiEntreprise.token}` },
      });
      log.d(response);
      const mandatairesSociaux = response.data.mandataires_sociaux ?? [];
      nomCommercial = response.data.nom_commercial ?? null;
      representantsLegaux = mandatairesSociaux.map((m) => {
        if (m.type === "personne_physique") {
          return { fonction: m.fonction, nom: m.nom, prenom: m.prenom };
        } else {
          return { fonction: m.fonction, nom: m.raison_sociale, prenom: "" };
        }
      });
    } catch (err) {
      log.w("erreur sur l'appel à l'API entreprise");
      log.d(err);
    }
    log.d(representantsLegaux);
    log.d(etablissements);
    log.d(uniteLegale);
    log.i("DONE");
    return res.status(200).json({
      etablissements,
      nomCommercial,
      representantsLegaux,
      uniteLegale,
    });
  } catch (err) {
    log.w(err);
    return res
      .status(400)
      .json({ message: "erreur sur l'appel de l'api INSEE" });
  }
};
