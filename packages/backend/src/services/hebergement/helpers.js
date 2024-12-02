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
  ) AS "prestationsHoteliere"
`;

const mapHebergementToCoordonnees = (hebergement, adresse) => {
  return {
    adresse: {
      codeInsee: adresse.codeInsee,
      codePostal: adresse.codePostal,
      coordinates: [adresse.long, adresse.lat],
      departement: adresse.departement,
      label: adresse.label,
    },
    email: hebergement.email,
    nomGestionnaire: hebergement.nomGestionnaire,
    numTelephone1: hebergement.numTelephone1,
    numTelephone2: hebergement.numTelephone2,
  };
};

const mapHebergementToInformationsLocaux = async (hebergement) => {
  return {
    accessibilite: hebergement.accessibilite,
    accessibilitePrecision: hebergement.accessibilitePrecision,
    amenagementsSpecifiques: hebergement.amenagementsSpecifiques,
    chambresDoubles: hebergement.chambresDoubles,
    chambresUnisexes: hebergement.chambresUnisexes,
    couchageIndividuel: hebergement.couchageIndividuel,
    descriptionLieuHebergement: hebergement.descriptionLieuHebergement,
    fileDernierArreteAutorisationMaire: await getFileMetaData(
      hebergement.fileDernierArreteAutorisationMaire,
    ),
    fileDerniereAttestationSecurite: await getFileMetaData(
      hebergement.fileDerniereAttestationSecurite,
    ),
    fileReponseExploitantOuProprietaire: await getFileMetaData(
      hebergement.fileReponseExploitantOuProprietaire,
    ),
    litsDessus: hebergement.litDessus,
    nombreLits: hebergement.nombreLits,
    nombreLitsSuperposes: hebergement.nombreLitsSuperposes,
    nombreMaxPersonnesCouchage: hebergement.nombreMaxPersonnesCouchage,
    pension: hebergement.typePension,
    precisionAmenagementsSpecifiques:
      hebergement.amenagementsSpecifiquesPrecision,
    prestationsHotelieres: hebergement.prestationsHoteliere,
    rangementIndividuel: hebergement.rangementIndividuel,
    reglementationErp: hebergement.reglementationErp,
    type: hebergement.type,
    visiteLocaux: hebergement.visiteLocaux,
    visiteLocauxAt: hebergement.visiteLocauxAt,
  };
};

const mapHebergementToInformationsTransport = (hebergement) => {
  return {
    deplacementProximite: hebergement.deplacementProximiteDescription,
    excursion: hebergement.excursionDescription,
    vehiculesAdaptes: hebergement.vehiculesAdaptes,
  };
};

const mapDBHebergement = async (hebergement, adresse) => {
  return {
    coordonnees: mapHebergementToCoordonnees(hebergement, adresse),
    id: hebergement.id,
    informationsLocaux: await mapHebergementToInformationsLocaux(hebergement),
    informationsTransport: mapHebergementToInformationsTransport(hebergement),
    nom: hebergement.nom,
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
