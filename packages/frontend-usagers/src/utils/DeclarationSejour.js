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

import { hebergement as hebergementUtils } from "@vao/shared";

const statuts = {
  BROUILLON: "BROUILLON",
  TRANSMISE: "TRANSMISE",
  EN_COURS: "EN COURS",
  A_MODIFIER: "A MODIFIER",
  REFUSEE: "REFUSEE",
  ATTENTE_8_JOUR: "EN ATTENTE DECLARATION 8 JOURS",
  TRANSMISE_8J: "TRANSMISE 8J",
  EN_COURS_8J: "EN COURS 8J",
  A_MODIFIER_8J: "A MODIFIER 8J",
  VALIDEE_8J: "VALIDEE 8J",
  REFUSEE_8J: "REFUSEE 8J",
  ANNULEE: "ANNULEE",
  ABANDONNEE: "ABANDONNEE",
  SEJOUR_EN_COURS: "SEJOUR EN COURS",
  TERMINEE: "TERMINEE",
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
  ].includes(statut);

const isUpdate8Jour = (statut) =>
  [statuts.ATTENTE_8_JOUR, statuts.A_MODIFIER_8J].includes(statut);

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
    .max(50, "Le libellé ne doit pas dépasser 50 caractères ")
    .typeError("le libellé est requis")
    .required(),
  dateDebut: yup
    .date("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .typeError("date invalide")
    .min(new Date(), "La date doit être supérieure à la date du jour.")
    .required("La saisie de ce champ est obligatoire"),
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

const statusTagStates = {
  [statuts.EN_COURS]: "new",
  [statuts.EN_COURS_8J]: "new",
  [statuts.TRANSMISE]: "new",
  [statuts.ATTENTE_8_JOUR]: "new",
  [statuts.TRANSMISE_8J]: "new",
  [statuts.VALIDEE_8J]: "success",
  [statuts.A_MODIFIER]: "warning",
  [statuts.A_MODIFIER_8J]: "warning",
  [statuts.REFUSEE]: "error",
  [statuts.REFUSEE_8J]: "error",
  [statuts.SEJOUR_EN_COURS]: "success",
};

const saisons = ["Hiver", "Printemps", "Été", "Automne"];

const getSaison = (date) =>
  saisons.flatMap((season) => Array(4).fill(season))[new Date(date).getMonth()];

const getOrganismeName = (demande) =>
  demande.organisme.typeOrganisme === "personne_morale"
    ? demande.organisme.personneMorale.raisonSociale
    : `${demande.organisme.personnePhysique.prenom} ${demande.organisme.personnePhysique.nomUsage ?? demande.organisme.personnePhysique.nomNaissance}`;

export default {
  isSejourComplet,
  baseSchema,
  hebergementDetailsSchema,
  hebergementSchema,
  schema,
  saisons,
  statuts,
  statusTagStates,
  getSaison,
  getOrganismeName,
  isPost8Jour,
  isUpdate8Jour,
};
