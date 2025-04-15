const logger = require("../../utils/logger");
const proj4 = require("proj4");
const {
  getEtablissement,
  sanitizeEtablissements,
  getListeEtablissements,
  getPersonnePhysique,
} = require("../../services/Insee");
const Organisme = require("../../services/Organisme");
const Referentiel = require("../../services/Referentiel");
const AppError = require("../../utils/error");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
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
    let elements = [];
    let representantsLegaux = [];
    let siege = {};
    let uniteLegale;

    try {
      const etablissement = await getEtablissement(siret);
      uniteLegale = etablissement;
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
    if (
      uniteLegale?.periodesEtablissement[0]?.etatAdministratifEtablissement ===
      "F"
    ) {
      return res
        .status(403)
        .json({ message: "Etablissement fermé, opération non autorisée" });
    }
    // https://entreprise.api.gouv.fr/catalogue/insee/unites_legales
    // Pour les personnes physique le code juridique est 1000
    const isPersonnePhysique =
      uniteLegale.uniteLegale.categorieJuridiqueUniteLegale === "1000";
    if (uniteLegale.uniteLegale.categorieJuridiqueUniteLegale) {
      uniteLegale.uniteLegale.categorieJuridiqueUniteLegale =
        (await Referentiel.getLibelle(
          uniteLegale.uniteLegale.categorieJuridiqueUniteLegale,
        )) ?? "statut indéterminé";
    }
    const nomCommercial =
      uniteLegale.uniteLegale.denominationUsuelle1UniteLegale ?? null;
    if (uniteLegale.etablissementSiege) {
      elements = await getListeEtablissements(siren);
    } else {
      siege = await Organisme.getSiege(siren);
    }
    const etablissements = sanitizeEtablissements(elements);
    if (!isPersonnePhysique) {
      try {
        representantsLegaux = await getPersonnePhysique(siren);
      } catch (err) {
        log.w("erreur sur l'appel à l'API entreprise");
        log.d(err);
      }
    }

    if (
      uniteLegale.adresseEtablissement?.coordonneeLambertAbscisseEtablissement
    ) {
      proj4.defs(
        "EPSG:2154",
        "+proj=lcc +lat_1=49.000000 +lat_2=44.000000 +lat_0=46.500000 +lon_0=3.000000 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
      );
      uniteLegale.adresseEtablissement.coordinates = proj4(
        "EPSG:2154",
        "EPSG:4326",
        [
          Number.parseFloat(
            uniteLegale.adresseEtablissement
              .coordonneeLambertAbscisseEtablissement,
          ),
          Number.parseFloat(
            uniteLegale.adresseEtablissement
              .coordonneeLambertOrdonneeEtablissement,
          ),
        ],
      );
    }

    const prefixCodePostal =
      uniteLegale.adresseEtablissement.codePostalEtablissement.substring(0, 2);
    uniteLegale.adresseEtablissement.departement =
      prefixCodePostal === "97" || prefixCodePostal === "98"
        ? uniteLegale.adresseEtablissement.codePostalEtablissement.substring(
            0,
            3,
          )
        : prefixCodePostal;

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
