const axios = require("axios");
const config = require("../config");
const logger = require("../utils/logger");
const dayjs = require("dayjs");

const log = logger(module.filename);

const NB_ELEMENTS_TO_GET = 1000;

module.exports.checkTokenApiEntreprise = async () => {
  log.i("IN");
  try {
    const params = new URLSearchParams({ token: config.apiEntreprise.token });
    const url = `${config.apiEntreprise.url}/privileges?${params}`;
    const { data } = await axios.get(url);
    log.i("DONE");
    return data;
  } catch (error) {
    log.w("DONE with error");
    throw new Error(`API Entreprise error: ${error.message}`);
  }
};

const getInformations = async () => {
  log.i("IN");
  try {
    const { apiInsee } = config;
    const { data } = await axios.get(
      `${apiInsee.URL}${apiInsee.URI}/informations`,
      { headers: { "X-INSEE-Api-Key-Integration": `${apiInsee.TOKEN}` } },
    );
    log.i("DONE");
    return data;
  } catch (error) {
    log.w("DONE with error");
    throw new Error(`API Insee error: ${error.message}`);
  }
};

module.exports.getInformations = getInformations;

module.exports.getEtablissement = async (siret) => {
  const { apiInsee } = config;
  log.i("getEtablissement", { siret });
  const dateDuJour = dayjs().format("YYYY-MM-DD");
  const { data } = await axios.get(
    `${apiInsee.URL}${apiInsee.URI}/siret/${siret}?date=${dateDuJour}`,
    { headers: { "X-INSEE-Api-Key-Integration": `${apiInsee.TOKEN}` } },
  );
  return data.etablissement;
};

module.exports.getListeEtablissements = async (siren) => {
  const { apiInsee } = config;

  const fetchPage = async (start = 0, accumulated = []) => {
    const { data } = await axios.get(
      `${apiInsee.URL}${apiInsee.URI}/siret?q=siren:${siren}&nombre=${NB_ELEMENTS_TO_GET}&tri=siret&debut=${start}`,
      { headers: { "X-INSEE-Api-Key-Integration": `${apiInsee.TOKEN}` } },
    );
    const etablissements = data.etablissements ?? [];
    const total = data?.header?.total ?? 0;
    const nextAccumulated = [...accumulated, ...etablissements];

    if (nextAccumulated.length >= total) {
      return nextAccumulated;
    }
    return fetchPage(nextAccumulated.length, nextAccumulated);
  };

  return fetchPage();
};

module.exports.getEtablissementSuccesseur = async ({ siret }) => {
  const { apiInsee } = config;
  const { data } = await axios.get(
    `${apiInsee.URL}${apiInsee.URI}/siret/liensSuccession?q=siretEtablissementPredecesseur:${siret}&nombre:1&tri:successeur`,
    { headers: { "X-INSEE-Api-Key-Integration": `${apiInsee.TOKEN}` } },
  );
  return { data };
};

module.exports.sanitizeEtablissements = (etablissements, uniteLegale) =>
  Object.keys(etablissements).length !== 0
    ? etablissements
        .filter(
          (e) =>
            e.uniteLegale.etatAdministratifUniteLegale === "A" &&
            e.nic !== uniteLegale.nic,
        )
        .map((e) => {
          const a = e.adresseEtablissement;
          const etat =
            e.periodesEtablissement[0].etatAdministratifEtablissement;
          return {
            addresse: [
              a.numeroVoieEtablissement,
              a.typeVoieEtablissement,
              a.libelleVoieEtablissement,
            ]
              .filter(Boolean)
              .join(" "),
            codePostal: a.codePostalEtablissement,
            commune: a.libelleCommuneEtablissement,
            denomination: uniteLegale.uniteLegale.denominationUniteLegale,
            enabled: false,
            etatAdministratif:
              etat === "A" ? "En activité" : etat === "F" ? "Fermé" : "",
            nic: e.nic,
            siret: e.siret,
          };
        })
    : null;

module.exports.getPersonnePhysique = async (siren) => {
  const { apiEntreprise } = config;

  const url = `${apiEntreprise.uri}/infogreffe/rcs/unites_legales/${siren}/extrait_kbis?context=${apiEntreprise.context}&object=${apiEntreprise.object}&recipient=${apiEntreprise.recipient}`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${config.apiEntreprise.token}` },
  });
  const mandatairesSociaux = data.data.mandataires_sociaux ?? [];
  const nomCommercial = data.data.nom_commercial;
  const representantsLegaux = mandatairesSociaux.map((m) => {
    const isPersonnePhysique = m.type === "personne_physique";
    return {
      fonction: m.fonction ?? "",
      nom: (isPersonnePhysique ? m.nom : m.raison_sociale) ?? "",
      prenom: (isPersonnePhysique ? m.prenom : "") ?? "",
    };
  });
  return {
    mandatairesSociaux,
    nomCommercial,
    representantsLegaux,
  };
};
