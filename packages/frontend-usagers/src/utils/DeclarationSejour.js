import * as yup from "yup";
import dayjs from "dayjs";
import {
  informationsPersonnel,
  informationsVacanciers,
  logger,
  personne,
  projetSejour,
  protocoleSanitaire,
  protocoleTransport,
} from "#imports";

import {
  hebergement as hebergementUtils,
  status as statusUtils,
} from "@vao/shared";

import regex from "./regex";

const statuts = {
  ...statusUtils.defaultStatus,
};

const log = logger("utils/DeclarationSejour");

const isPost8Jour = (statut) =>
  [
    statuts.ATTENTE_8_JOUR,
    statuts.TRANSMISE_8J,
    statuts.A_MODIFIER_8J,
    statuts.EN_COURS_8J,
    statuts.REFUSEE_8J,
    statuts.VALIDEE_8J,
    statuts.SEJOUR_EN_COURS,
  ].includes(statut);

const isUpdate8Jour = (statut) =>
  [
    statuts.ATTENTE_8_JOUR,
    statuts.A_MODIFIER_8J,
    statuts.SEJOUR_EN_COURS,
  ].includes(statut);

function isSejourComplet(hebergements, dateDebut, dateFin) {
  log.d("isSejourComplet - IN", { hebergements, dateDebut, dateFin });
  if (hebergements.length === 0) {
    return false;
  }

  let memoDate = dateDebut;

  for (let i = 0; i < hebergements.length; i++) {
    log.d("isSejourComplet", hebergements[i].dateDebut, memoDate);
    const dateDebut = dayjs(hebergements[i].dateDebut).format("YYYY-MM-DD");
    if (dateDebut !== memoDate) {
      return false;
    }
    memoDate = dayjs(hebergements[i].dateFin).format("YYYY-MM-DD");
  }

  log.d("isSejourComplet", memoDate, dateFin);
  if (memoDate !== dateFin) {
    return false;
  }
  return true;
}

const baseSchema = {
  libelle: yup
    .string()
    .max(100, "Le libellé ne doit pas dépasser 100 caractères ")
    .typeError("le libellé est requis")
    .required(),
  dateDebut: yup
    .date()
    .typeError("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .required("La saisie de ce champ est obligatoire")
    .when("statut", {
      is: (statut) => statut !== statusUtils.SEJOUR_EN_COURS,
      then: (schema) =>
        schema.min(
          new Date(),
          "La date doit être supérieure à la date du jour.",
        ),
      otherwise: (schema) => schema,
    }),
  dateFin: yup
    .date("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .typeError("date invalide")
    .when("dateDebut", (dateDebut, schema) => {
      return schema.test({
        test: (dateFin) => !!dateDebut && dayjs(dateFin) > dayjs(dateDebut),
        message: "La date de fin doit être supérieure à la date de début",
      });
    })
    .required("La saisie de ce champ est obligatoire"),
  responsableSejour: yup
    .object(
      personne.schema({
        showAdresse: true,
        showAttestation: false,
        showFonction: true,
        showCompetence: false,
        showDateNaissance: false,
        showEmail: true,
        showListeFonction: false,
        showTelephone: true,
      }),
    )
    .required(),
};

const hebergementDetailsSchema = {
  dateDebut: yup.date().required(),
  dateFin: yup.date().required(),
  hebergementId: yup
    .number()
    .required("le choix d'un hébergement dans la liste est obligatoire"),
  coordonnees: yup.object(hebergementUtils.coordonneesSchema),
  informationsLocaux: yup.object(hebergementUtils.informationsLocauxSchema),
  informationsTransport: yup.object({
    ...hebergementUtils.informationsTransportSchema,
    rejoindreEtape: yup.string().nullable(),
  }),
  nom: yup.string().required(),
};

const attestationSchema = {
  aCertifie: yup
    .boolean()
    .oneOf([true], "Vous devez certifier de ces informations")
    .required(),
  nom: yup.string().min(1, "Il est impératif de préciser votre nom").required(),
  prenom: yup
    .string()
    .min(1, "Il est impératif de préciser votre prénom")
    .required(),
  qualite: yup
    .string()
    .min(1, "Il est impératif de préciser votre qualité")
    .required(),
  at: yup.date().required(),
};

const hebergementSchema = (dateDebut, dateFin) => ({
  sejourItinerant: yup.boolean().required(),
  sejourEtranger: yup.boolean().when("sejourItinerant", {
    is: (sejourItinerant) => !!sejourItinerant,
    then: (sejourEtranger) => sejourEtranger.required(),
    otherwise: (sejourEtranger) => sejourEtranger.nullable().strip(),
  }),
  hebergements: yup
    .array()
    .of(yup.object(hebergementDetailsSchema))
    .when("sejourItinerant", {
      is: true,
      otherwise: (hebergements) =>
        hebergements.length(1, "L'hébergement doit être unique"),
      then: (hebergements) =>
        hebergements.min(2, "Au moins deux hebergements sont attendus"),
    })
    .test(
      "sejourComplet",
      "La liste des hébergements n'est pas complète",
      (hebergements) => isSejourComplet(hebergements, dateDebut, dateFin),
    )
    .required("le choix d'un hébergement dans la liste est obligatoire"),
});
const schema = (dateDebut, dateFin, statut) => ({
  ...baseSchema,
  informationsVacanciers: yup.object(informationsVacanciers.schema),
  informationsPersonnel: yup.object(informationsPersonnel.schema(statut)),
  informationsTransport: yup.object(protocoleTransport.schema),
  informationsSanitaires: yup.object(protocoleSanitaire.schema),
  projetSejour: yup.object(projetSejour.schema),
  hebergement: yup.object(hebergementSchema(dateDebut, dateFin)),
  attestation: yup.object(attestationSchema),
});

const saisons = ["Hiver", "Printemps", "Été", "Automne"];

const getSaison = (date) =>
  saisons.flatMap((season) => Array(3).fill(season))[new Date(date).getMonth()];

const getOrganismeName = (demande) =>
  demande.organisme.typeOrganisme === "personne_morale"
    ? demande.organisme.personneMorale.raisonSociale
    : `${demande.organisme.personnePhysique.prenom} ${demande.organisme.personnePhysique.nomUsage ?? demande.organisme.personnePhysique.nomNaissance}`;

const getOrganismeCommune = (demande) => {
  if (demande.organisme.typeOrganisme === "personne_morale") {
    const decomposeAdresse =
      demande.organisme.personneMorale?.adresse.split(" ");
    const cpIndex = decomposeAdresse.findIndex((mot) =>
      regex.formatCommuneCP.test(mot),
    );
    return cpIndex > 0
      ? `${decomposeAdresse.slice(cpIndex + 1).join(" ")} (${decomposeAdresse[cpIndex]})`
      : null;
  } else {
    return null;
  }
};
export default {
  isSejourComplet,
  baseSchema,
  hebergementDetailsSchema,
  hebergementSchema,
  schema,
  saisons,
  statuts,
  getSaison,
  getOrganismeName,
  getOrganismeCommune,
  isPost8Jour,
  isUpdate8Jour,
};
