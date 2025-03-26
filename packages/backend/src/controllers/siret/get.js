const axios = require("axios");
const logger = require("../../utils/logger");
const config = require("../../config");
const dayjs = require("dayjs");
const proj4 = require("proj4");
const { getToken } = require("../../services/Insee");
const Organisme = require("../../services/Organisme");
const Referentiel = require("../../services/Referentiel");
const AppError = require("../../utils/error");

const log = logger(module.filename);

const NB_ELEMENTS_TO_GET = 1000;

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
    const elements = [];
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
      uniteLegale.uniteLegale.categorieJuridiqueUniteLegale === "1000"
        ? true
        : false;
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
        `${apiInsee.URL}${apiInsee.URI}/siret?q=siren:${siren}&nombre=${NB_ELEMENTS_TO_GET}&tri=siret`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      elements.push(...(liste.etablissements ?? []));

      const total = liste?.header?.total;
      if (total) {
        for (
          let k = NB_ELEMENTS_TO_GET;
          k < total;
          k = k + NB_ELEMENTS_TO_GET
        ) {
          const { data: liste } = await axios.get(
            `${apiInsee.URL}${apiInsee.URI}/siret?q=siren:${siren}&nombre=${NB_ELEMENTS_TO_GET}&debut=${k}&tri=siret`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          elements.push(...(liste.etablissements ?? []));
        }
      }
    } else {
      siege = await Organisme.getSiege(siren);
    }
    const etablissements = elements
      .filter((e) => e.uniteLegale.etatAdministratifUniteLegale === "A")
      .filter((e) => e.nic !== uniteLegale.nic)
      .map((e) => {
        return {
          adresse: `${e.adresseEtablissement.numeroVoieEtablissement ? e.adresseEtablissement.numeroVoieEtablissement : ""} ${e.adresseEtablissement.typeVoieEtablissement ? e.adresseEtablissement.typeVoieEtablissement : ""} ${e.adresseEtablissement.libelleVoieEtablissement ? e.adresseEtablissement.libelleVoieEtablissement : ""}`,
          codePostal: e.adresseEtablissement.codePostalEtablissement ?? "",
          commune: e.adresseEtablissement.libelleCommuneEtablissement ?? "",
          denomination: uniteLegale.uniteLegale.denominationUniteLegale,
          enabled: false,
          etatAdministratif:
            e.periodesEtablissement[0].etatAdministratifEtablissement === "A"
              ? "En activité"
              : e.periodesEtablissement[0].etatAdministratifEtablissement ===
                  "F"
                ? "Fermé"
                : "",
          nic: e.nic,
          siret: e.siret,
        };
      });
    if (!isPersonnePhysique) {
      try {
        const url = `${apiEntreprise.uri}/infogreffe/rcs/unites_legales/${siren}/extrait_kbis?context=${apiEntreprise.context}&object=${apiEntreprise.object}&recipient=${apiEntreprise.recipient}`;
        const { data: response } = await axios.get(url, {
          headers: { Authorization: `Bearer ${config.apiEntreprise.token}` },
        });
        const mandatairesSociaux = response.data.mandataires_sociaux ?? [];
        nomCommercial = response.data.nom_commercial ?? nomCommercial;
        representantsLegaux = mandatairesSociaux.map((m) => {
          if (m.type === "personne_physique") {
            return {
              fonction: m.fonction ?? "",
              nom: m.nom ?? "",
              prenom: m.prenom,
            };
          } else {
            return {
              fonction: m.fonction ?? "",
              nom: m.raison_sociale ?? "",
              prenom: "",
            };
          }
        });
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
          parseFloat(
            uniteLegale.adresseEtablissement
              .coordonneeLambertAbscisseEtablissement,
          ),
          parseFloat(
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
