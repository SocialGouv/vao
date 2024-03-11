import * as yup from "yup";

const constitutionEquipeOptions = [
  {
    label:
      "Une personne formée aux gestes et soins d’urgence (PSC 1, SST, AFGSU 1, AFGSU 2, AFSGSU)",
    id: "personne_formee",
    name: "personne_formee",
  },
  {
    label: "Un(e) infirmier(e)",
    id: "infirmier",
    name: "infirmier",
  },
  {
    label: "Un(e) aide soignant(e)",
    id: "aide_soignant",
    name: "aide_soignant",
  },
];

const responsableAdministrationMedicamentOptions = [
  {
    label: "Responsable du séjour",
    id: "responsable_sejour",
    name: "responsable_sejour",
  },
  {
    label: "Accompagnant(s)",
    id: "accompagnant",
    name: "accompagnant",
  },
  {
    label: "Professionnel de santé",
    id: "professionnel_sante",
    name: "professionnel_sante",
  },
];

const preparationPilluliersOptions = [
  { label: "Aucune méthode", id: "aucune", value: "aucune" },
  {
    label:
      "Piluliers préparés préalablement au séjour par le vacancier, sa famille, le représentant légal, l’établissement de résidence habituelle, le médecin",
    id: "prepares_prealablement",
    value: "prepares_prealablement",
  },
  {
    label: "Piluliers préparés durant le séjour",
    id: "au_fur_et_a_mesure",
    value: "au_fur_et_a_mesure",
  },
];

yup.setLocale({
  mixed: {
    required: "Le champs est obligatoire.",
  },
});

const schema = {
  dispositionsSpecifiques: yup.boolean().required(),
  precisionDispositionsSpecifiques: yup
    .string()
    .when("dispositionsSpecifiques", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
      otherwise: (precision) => precision.nullable(),
    }),
  constitutionEquipe: yup.array(),
  precisionConstitutionEquipe: yup.string().when("constitutionEquipe", {
    is: (val) => val && val.length > 0,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser votre réponse précédente")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
  troussePharmacie: yup.boolean().required(),
  responsableAdministrationMedicament: yup.array().required(),
  precisionResponsableAdministrationMedicament: yup
    .string()
    .when("responsableAdministrationMedicament", {
      is: (val) => val && val.length > 0,
      then: (precision) =>
        precision
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
      otherwise: (precision) => precision.nullable(),
    }),
  stockageMedicamentSecurise: yup.boolean().required(),
  precisionStockageMedicamentSecurise: yup
    .string()
    .when("stockageMedicamentSecurise", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
      otherwise: (precision) => precision.nullable(),
    }),
  conservationMedicamentThermosensible: yup.boolean().required(),
  precisionConservationMedicament: yup
    .string()
    .when("conservationMedicamentThermosensible", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
      otherwise: (precision) => precision.nullable(),
    }),
  individualisationMedicaments: yup.boolean().required(),
  precisionIndividualisationMedicaments: yup
    .string()
    .when("individualisationMedicaments", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
      otherwise: (precision) => precision.nullable(),
    }),
  preparationPilluliers: yup.string().required(),
  precisionPreparationPilluliers: yup.string().when("preparationPilluliers", {
    is: (preparationPilluliers) =>
      preparationPilluliers === "prepares_prealablement" ||
      preparationPilluliers === "au_fur_et_a_mesure",

    then: (precision) =>
      precision
        .min(5, "Vous devez préciser votre réponse précédente")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
  prescriptionMedicaleJointe: yup.boolean().required(),
  protocoleModificationTraitement: yup.boolean().required(),
  precisionProtocoleModificationTraitement: yup
    .string()
    .when("protocoleModificationTraitement", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
      otherwise: (precision) => precision.nullable(),
    }),
  ficheSuiviMedicaments: yup.string().required(),
  protocoleEvacuation: yup.boolean().required(),
  precisionProtocoleEvacuation: yup.string().when("protocoleEvacuation", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser votre réponse précédente")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
  protocoleAccident: yup.boolean().required(),
  precisionProtocoleAccident: yup.string().when("protocoleAccident", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser votre réponse précédente")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
  protocoleReorientation: yup.boolean().required(),
  precisionProtocoleReorientation: yup.string().when("protocoleReorientation", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser votre réponse précédente")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
  //
  protocoleCanicule: yup.boolean().required(),
  precisionProtocoleCanicule: yup.string().when("protocoleCanicule", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser votre réponse précédente")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
  gestionBudgetPersonnel: yup.string().required(),
};

export default {
  constitutionEquipeOptions,
  preparationPilluliersOptions,
  responsableAdministrationMedicamentOptions,
  schema,
};
