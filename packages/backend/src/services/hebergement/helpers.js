const { getFileMetaData } = require("../Document");

module.exports.queryGetFields = `
  H.NOM AS "nom",
  H.EMAIL AS "email",
  H.ADRESSE_ID AS "adresseId",
  H.TELEPHONE_1 AS "numTelephone1",
  H.TELEPHONE_2 AS "numTelephone2",
  H.NOM_GESTIONNAIRE AS "nomGestionnaire",
  (
    SELECT
      VALUE
    FROM
      FRONT.HEBERGEMENT_TYPE
    WHERE
      ID = H.TYPE_ID
  ) AS "type",
  (
    SELECT
      VALUE
    FROM
      FRONT.HEBERGEMENT_TYPE_PENSION
    WHERE
      ID = H.TYPE_PENSION_ID
  ) AS "typePension",
  H.NOMBRE_LITS AS "nombreLits",
  H.LIT_DESSUS AS "litDessus",
  H.NOMBRE_LITS_SUPERPOSES AS "nombreLitsSuperposes",
  H.NOMBRE_MAX_PERSONNES_COUCHAGE AS "nombreMaxPersonnesCouchage",
  H.VISITE_LOCAUX AS "visiteLocaux",
  H.VISITE_LOCAUX_AT AS "visiteLocauxAt",
  H.ACCESSIBILITE_ID AS "accessibiliteId",
  (
    SELECT
      VALUE
    FROM
      FRONT.HEBERGEMENT_ACCESSIBILITE
    WHERE
      ID = H.ACCESSIBILITE_ID
  ) AS "accessibilite",
  H.ACCESSIBILITE_PRECISION AS "accessibilitePrecision",
  H.CHAMBRES_DOUBLES AS "chambresDoubles",
  H.CHAMBRES_UNISEXES AS "chambresUnisexes",
  H.REGLEMENTATION_ERP AS "reglementationErp",
  H.COUCHAGE_INDIVIDUEL AS "couchageIndividuel",
  H.RANGEMENT_INDIVIDUEL AS "rangementIndividuel",
  H.AMENAGEMENTS_SPECIFIQUES AS "amenagementsSpecifiques",
  H.AMENAGEMENTS_SPECIFIQUES_PRECISION AS "amenagementsSpecifiquesPrecision",
  H.DESCRIPTION_LIEU_HEBERGEMENT AS "descriptionLieuHebergement",
  H.EXCURSION_DESCRIPTION AS "excursionDescription",
  H.DEPLACEMENT_PROXIMITE_DESCRIPTION AS "deplacementProximiteDescription",
  H.VEHICULES_ADAPTES AS "vehiculesAdaptes",
  H.FILE_REPONSE_EXPLOITANT_OU_PROPRIETAIRE AS "fileReponseExploitantOuProprietaire",
  H.FILE_DERNIER_ARRETE_AUTORISATION_MAIRE AS "fileDernierArreteAutorisationMaire",
  H.FILE_DERNIERE_ATTESTATION_SECURITE AS "fileDerniereAttestationSecurite",
  (
    SELECT
      ARRAY_AGG(HPH.VALUE)
    FROM
      FRONT.HEBERGEMENT_TO_PRESTATIONS_HOTELIERES HTPH
      LEFT JOIN FRONT.HEBERGEMENT_PRESTATIONS_HOTELIERES HPH ON HPH.ID = HTPH.PRESTATION_ID
    WHERE
      HEBERGEMENT_ID = H.ID
  ) AS "prestationsHoteliere",
  (select value from front.hebergement_statut where id = h.statut_id) as "statut"
`;

const mapHebergementToCoordonnees = (hebergement, adresse) => {
  return {
    adresse: adresse
      ? {
          codeInsee: adresse?.codeInsee ?? null,
          codePostal: adresse?.codePostal ?? null,
          coordinates: [adresse?.long, adresse?.lat],
          departement: adresse?.departement,
          label: adresse?.label,
        }
      : null,
    email: hebergement.email ?? null,
    nomGestionnaire: hebergement.nomGestionnaire ?? null,
    numTelephone1: hebergement.numTelephone1 ?? null,
    numTelephone2: hebergement.numTelephone2 ?? null,
  };
};

const mapHebergementToInformationsLocaux = async (hebergement) => {
  return {
    accessibilite: hebergement.accessibilite ?? null,
    accessibilitePrecision: hebergement.accessibilitePrecision ?? null,
    amenagementsSpecifiques: hebergement.amenagementsSpecifiques ?? null,
    chambresDoubles: hebergement.chambresDoubles ?? null,
    chambresUnisexes: hebergement.chambresUnisexes ?? null,
    couchageIndividuel: hebergement.couchageIndividuel ?? null,
    descriptionLieuHebergement: hebergement.descriptionLieuHebergement ?? null,
    fileDernierArreteAutorisationMaire:
      (await getFileMetaData(hebergement.fileDernierArreteAutorisationMaire)) ??
      null,
    fileDerniereAttestationSecurite:
      (await getFileMetaData(hebergement.fileDerniereAttestationSecurite)) ??
      null,
    fileReponseExploitantOuProprietaire:
      (await getFileMetaData(
        hebergement.fileReponseExploitantOuProprietaire,
      )) ?? null,
    litsDessus: hebergement.litDessus ?? null,
    nombreLits: hebergement.nombreLits ?? null,
    nombreLitsSuperposes: hebergement.nombreLitsSuperposes ?? null,
    nombreMaxPersonnesCouchage: hebergement.nombreMaxPersonnesCouchage ?? null,
    pension: hebergement.typePension ?? null,
    precisionAmenagementsSpecifiques:
      hebergement.amenagementsSpecifiquesPrecision ?? null,
    prestationsHotelieres: hebergement.prestationsHoteliere ?? [],
    rangementIndividuel: hebergement.rangementIndividuel ?? null,
    reglementationErp: hebergement.reglementationErp ?? null,
    type: hebergement.type ?? null,
    visiteLocaux: hebergement.visiteLocaux ?? null,
    visiteLocauxAt: hebergement.visiteLocauxAt ?? null,
  };
};

const mapHebergementToInformationsTransport = (hebergement) => {
  return {
    deplacementProximite: hebergement.deplacementProximiteDescription ?? null,
    excursion: hebergement.excursionDescription ?? null,
    vehiculesAdaptes: hebergement.vehiculesAdaptes ?? null,
  };
};

const mapDBHebergement = async (hebergement, adresse) => {
  return {
    coordonnees: mapHebergementToCoordonnees(hebergement, adresse),
    id: hebergement.id,
    informationsLocaux: await mapHebergementToInformationsLocaux(hebergement),
    informationsTransport: mapHebergementToInformationsTransport(hebergement),
    nom: hebergement.nom,
    statut: hebergement.statut ?? null,
  };
};

const mapDBHebergementToDSHebergement = async (hebergement, adresse) => {
  return {
    coordonnees: mapHebergementToCoordonnees(hebergement, adresse),
    dateDebut: hebergement.dateDebut,
    dateFin: hebergement.dateFin,
    hebergementId: hebergement.hebergementId,
    informationsLocaux: await mapHebergementToInformationsLocaux(hebergement),
    informationsTransport: mapHebergementToInformationsTransport(hebergement),
    nom: hebergement.nom,
  };
};

module.exports.mapDBHebergement = mapDBHebergement;
module.exports.mapDBHebergementToDSHebergement =
  mapDBHebergementToDSHebergement;
