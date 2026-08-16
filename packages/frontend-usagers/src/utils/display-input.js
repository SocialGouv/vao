import dayjs from "dayjs";

const InputTypes = {
  RAW: "raw",
  TEXT: "text",
  RADIO: "radio",
  SELECT: "select",
  MULTISELECT: "multiselect",
  NUMBER: "number",
  TO_FORMAT: "to_format",
  TABLE: "table",
};

// Shared options and helper factories to avoid duplication
const AGE_RANGE_OPTIONS = [
  { label: "de 18 à 39 ans", value: "18_39", name: "trancheAge" },
  { label: "de 40 à 59 ans", value: "40_59", name: "trancheAge" },
  { label: "plus de 59 ans", value: "59_et_plus", name: "trancheAge" },
];

const HANDICAP_OPTIONS = [
  { label: "Sensoriel", value: "auditif", name: "typeHandicap" },
  { label: "Visuel", value: "visuel", name: "typeHandicap" },
  { label: "Cognitif", value: "cognitif", name: "typeHandicap" },
  { label: "Mental/Psychique", value: "mental", name: "typeHandicap" },
  { label: "Moteur", value: "moteur", name: "typeHandicap" },
  { label: "Polyhandicap", value: "polyhandicap", name: "typeHandicap" },
];

const multi = (label, options) => ({
  inputType: InputTypes.MULTISELECT,
  label,
  options,
});
const IUser = {
  email: {
    inputType: InputTypes.TEXT,
    label: "Adresse courriel",
  },
  nom: {
    inputType: InputTypes.TEXT,
    label: "Nom",
  },
  prenom: {
    inputType: InputTypes.TEXT,
    label: "Prénom",
  },
  createdAt: {
    inputType: InputTypes.TO_FORMAT,
    label: "Date de création du compte",
    formatter: (value) => dayjs(value).format("DD/MM/YYYY"),
  },
  telephone: {
    inputType: InputTypes.TEXT,
    label: "Numéro de téléphone",
  },
  lastConnectionAt: {
    inputType: InputTypes.TO_FORMAT,
    label: "Date de dernière connexion",
    formatter: (value) => dayjs(value).format("DD/MM/YYYY"),
  },
  statutLabel: {
    inputType: InputTypes.TO_FORMAT,
    label: "StatutLabel",
    formatter: (value) => value,
  },
  organisme: {
    inputType: InputTypes.TEXT,
    label: "Organisme",
    formatter: (value) => value,
  },
};

const AgrementInput = {
  numero: {
    inputType: InputTypes.TEXT,
    label: "Numéro d'agrément \"Vacances adaptées organisées",
  },
  dateObtention: {
    inputType: InputTypes.TO_FORMAT,
    label: "Date d'obtention de l'agrément",
    formatter: (value) => dayjs(value).format("DD/MM/YYYY"),
  },
  regionObtention: {
    inputType: InputTypes.TEXT,
    label: "Région d´obtention de l´agrément",
  },
  file: {
    inputType: InputTypes.RAW,
    label: "Copie de l´agrément",
  },
  commentaire: {
    inputType: InputTypes.TEXT,
    label: "Commentaire",
  },
  motivations: {
    inputType: InputTypes.TEXT,
    label: "Motivations, compétences et expériences",
  },
  dateObtentionCertificat: {
    inputType: InputTypes.TEXT,
    label: "Date d’obtention du certificat",
  },
};

const AgrementBilanAnnuelInput = {
  bilanFinancierComptabilite: {
    inputType: InputTypes.TEXT,
    label: "Comptabilité analytique de l’activité",
  },
  bilanFinancierComparatif: {
    inputType: InputTypes.TEXT,
    label: "Comparatif entre les périodes N et N-1",
  },
  bilanFinancierRessourcesHumaines: {
    inputType: InputTypes.TEXT,
    label:
      "Ressources humaines mobilisées et montants financiers engagés pour l’action (optionnel)",
  },
  bilanFinancierCommentaire: {
    inputType: InputTypes.TEXT,
    label: "Commentaire",
  },
  bilanQualPerceptionSensibilite: {
    inputType: InputTypes.TEXT,
    label: "Description",
  },
  bilanQualPerspectiveEvol: {
    inputType: InputTypes.TEXT,
    label: "Description",
  },
  bilanQualElementsMarquants: {
    inputType: InputTypes.TEXT,
    label: "Description",
  },
  bilanChangementEvolution: {
    inputType: InputTypes.TEXT,
    label:
      "Note d'information présentant les éventuelles améliorations ou changements apportés aux séjours (optionnel)",
  },
  nbGlobalVacanciers: {
    inputType: InputTypes.NUMBER,
    label: "Nombre global de vacanciers",
  },
  nbHommes: {
    inputType: InputTypes.NUMBER,
    label: "Nombre d'hommes",
  },
  nbFemmes: {
    inputType: InputTypes.NUMBER,
    label: "Nombre de femmes",
  },
  trancheAge: {
    ...multi("Tranches d’âge", AGE_RANGE_OPTIONS),
  },
  typeHandicap: {
    ...multi("Type de handicaps", HANDICAP_OPTIONS),
  },
};

const AgrementProjetsInput = {
  accompRespNb: {
    inputType: InputTypes.NUMBER,
    label: "Nombre d’accompagnants prévus par lieu de vacances",
  },
  accompRespCompExp: {
    inputType: InputTypes.TEXT,
    label: "Description",
  },
  accompRespRecruteUrg: {
    inputType: InputTypes.TEXT,
    label: "Description",
  },
  animationAutre: {
    inputType: InputTypes.TEXT,
    label: "Autres (optionnel)",
  },
  budgetGestionPerso: {
    inputType: InputTypes.TEXT,
    label:
      "Conditions de gestion sur place et d’usage du budget personnel des personnes accueillies",
  },
  budgetPersoGestionComplementaire: {
    inputType: InputTypes.TEXT,
    label: "Précisions complémentaires (optionnel)",
  },
  transportAllerRetour: {
    inputType: InputTypes.TEXT,
    label:
      "Du lieu habituel de résidence au lieu de vacances de même que lors du retour ",
  },
  transportSejour: {
    inputType: InputTypes.TEXT,
    label: "Durant le séjour du lieu d’hébergement au lieu des activités",
  },
  protocoleEvacUrg: {
    inputType: InputTypes.TEXT,
    label: "Mesures d’anticipation prévues par l’organisateur de séjour",
  },
  protocoleRapatUrg: {
    inputType: InputTypes.TEXT,
    label:
      "Modalités d’information, de transports et de réorientation, évacuation",
  },
  protocoleRapatEtranger: {
    inputType: InputTypes.TEXT,
    label: "Mesures d’anticipation prévues par l’organisateur de séjour",
  },
  protocoleInfoFamille: {
    inputType: InputTypes.TEXT,
    label: "Modalités d’information, de transports et de rapatriement",
  },
  sejourNbEnvisage: {
    inputType: InputTypes.TEXT,
    label: "Nombre de séjours envisagés l'année suivante (optionnel)",
  },
  sejourCommentaire: {
    inputType: InputTypes.TEXT,
    label: "Commentaire (optionnel)",
  },
  suiviMedDistribution: {
    inputType: InputTypes.TEXT,
    label:
      "Mesures prévues pour la distribution et le stockage des médicaments",
  },
  suiviMedAccordSejour: {
    inputType: InputTypes.TEXT,
    label:
      "Accords passés avec un cabinet paramédical ou un médecin à proximité du lieu de séjour",
  },
  activitesSelectionnees: {
    inputType: InputTypes.MULTISELECT,
    label: "",
  },
  nomHebergement: {
    inputType: InputTypes.TEXT,
    label: "Nom de l'hébergement",
  },
  adresseLabel: {
    inputType: InputTypes.TEXT,
    label: "Adresse de l'hébergement",
  },
  selectedMonths: {
    inputType: InputTypes.MULTISELECT,
    label: "",
  },
  nbJours: {
    inputType: InputTypes.NUMBER,
    label: "Nombre de jours",
  },
  nbVacanciers: {
    inputType: InputTypes.NUMBER,
    label: "nombre de vacanciers",
  },
};

export default {
  InputTypes,
  AgrementInput,
  AgrementProjetsInput,
  AgrementBilanAnnuelInput,
  IUser,
};
