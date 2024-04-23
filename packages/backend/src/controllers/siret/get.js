const axios = require("axios");
const logger = require("../../utils/logger");
const config = require("../../config");
const dayjs = require("dayjs");
const { getToken } = require("../../services/Insee");
const Organisme = require("../../services/Organisme");
const Referentiel = require("../../services/Referentiel");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  const { apiInsee } = config;
  const { apiEntreprise } = config;
  const { siret } = req.params;
  log.i("IN", siret);

  const siren = siret.length === 14 && siret.substring(0, 9);
  if (!siren) {
    log.w("siret isn't properly set");

    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }
  try {
    let token;
    let nomCommercial;
    let elements = [];
    let representantsLegaux = [];
    let siege = {};
    let uniteLegale;

    try {
      token = await getToken();
      const dateDuJour = dayjs().format("YYYY-MM-DD");
      const { data: reponse } = await axios.get(
        `${apiInsee.URL}${apiInsee.URI}/siret/${siret}?date=${dateDuJour}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      uniteLegale = reponse.etablissement;
    } catch (e) {
      log.w("DONE with error");
      return next(
        new AppError("Ce numéro SIRET semble ne pas exister", {
          cause: e,
          name: "SIRET_NOT_FOUND",
          statusCode: 404,
        }),
      );
    }
    if (uniteLegale.uniteLegale.categorieJuridiqueUniteLegale) {
      uniteLegale.uniteLegale.categorieJuridiqueUniteLegale =
        (await Referentiel.getLibelle(
          uniteLegale.uniteLegale.categorieJuridiqueUniteLegale,
        )) ?? "statut indéterminé";
    }
    nomCommercial =
      uniteLegale.uniteLegale.denominationUsuelle1UniteLegale ?? null;

    if (uniteLegale.etablissementSiege) {
      const { data: liste } = await axios.get(
        `${apiInsee.URL}${apiInsee.URI}/siret?q=siren:${siren}&nombre=100`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      elements = liste.etablissements ?? [];
    } else {
      siege = await Organisme.getSiege(siren);
    }

    const etablissements = elements
      .filter((e) => e.uniteLegale.etatAdministratifUniteLegale === "A")
      .filter(
        (e) =>
          e.periodesEtablissement[0].etatAdministratifEtablissement === "A",
      )
      .filter((e) => e.nic !== uniteLegale.nic)
      .map((e) => {
        return {
          adresse: `${e.adresseEtablissement.numeroVoieEtablissement ? e.adresseEtablissement.numeroVoieEtablissement : ""} ${e.adresseEtablissement.typeVoieEtablissement} ${e.adresseEtablissement.libelleVoieEtablissement}`,
          codePostal: e.adresseEtablissement.codePostalEtablissement,
          commune: e.adresseEtablissement.libelleCommuneEtablissement,
          enabled: false,
          nic: e.nic,
        };
      });

    try {
      const url = `${apiEntreprise.uri}/infogreffe/rcs/unites_legales/${siren}/extrait_kbis?context=${apiEntreprise.context}&object=${apiEntreprise.object}&recipient=${apiEntreprise.recipient}`;
      const { data: response } = await axios.get(url, {
        headers: { Authorization: `Bearer ${config.apiEntreprise.token}` },
      });
      const mandatairesSociaux = response.data.mandataires_sociaux ?? [];
      nomCommercial = response.data.nom_commercial ?? nomCommercial;
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
    log.i("DONE", {
      etablissements,
      nomCommercial,
      representantsLegaux,
      siege,
      uniteLegale,
    });

    return res.status(200).json({
      etablissements,
      nomCommercial,
      representantsLegaux,
      siege,
      uniteLegale,
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
