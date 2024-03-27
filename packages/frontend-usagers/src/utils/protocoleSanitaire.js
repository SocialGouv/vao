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
  { label: "Sans objet", id: "aucune", value: "aucune" },
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
  files: yup.array(),
  dispositionsSpecifiques: yup.boolean().required(),
  precisionDispositionsSpecifiques: yup
    .string()
    .when("dispositionsSpecifiques", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(
            5,
            "Vous devez préciser quelles dispositions spécifiques ont été mises en place",
          )
          .required(),
      otherwise: (precision) => precision.nullable().strip(),
    }),
  constitutionEquipe: yup.array(),
  precisionConstitutionEquipe: yup.string().when("constitutionEquipe", {
    is: (val) => val && val.length > 0,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser la constitution de l'équipe")
        .required(),
    otherwise: (precision) => precision.nullable().strip(),
  }),
  troussePharmacie: yup.boolean().required(),
  accordCabinetMedical: yup.boolean().required(),
  precisionAccordCabinetMedical: yup.string().when("accordCabinetMedical", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(
          5,
          "Vous devez préciser avec qui et quel type d'accord a été passé",
        )
        .required(),
    otherwise: (precision) => precision.nullable().strip(),
  }),
  responsableAdministrationMedicament: yup.array().required(),
  precisionResponsableAdministrationMedicament: yup
    .string()
    .when("responsableAdministrationMedicament", {
      is: (val) => val && val.length > 0,
      then: (precision) =>
        precision
          .min(
            5,
            "Vous devez préciser les responsabilités liées à l'administration des médicaments",
          )
          .required(),
      otherwise: (precision) => precision.nullable().strip(),
    }),
  stockageMedicamentSecurise: yup.boolean().required(),
  precisionStockageMedicamentSecurise: yup
    .string()
    .when("stockageMedicamentSecurise", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(
            5,
            "Vous devez préciser la sécurisation apportée concernant le stockage des médicaments",
          )
          .required(),
      otherwise: (precision) => precision.nullable().strip(),
    }),
  conservationMedicamentThermosensible: yup.boolean().required(),
  precisionConservationMedicament: yup
    .string()
    .when("conservationMedicamentThermosensible", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(
            5,
            "Vous devez préciser le dispositif de conservation des médicaments thermosensibles",
          )
          .required(),
      otherwise: (precision) => precision.nullable().strip(),
    }),
  individualisationMedicaments: yup.boolean().required(),
  precisionIndividualisationMedicaments: yup
    .string()
    .when("individualisationMedicaments", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(
            5,
            "Vous devez préciser le protocole d'individualisation des médicaments",
          )
          .required(),
      otherwise: (precision) => precision.nullable().strip(),
    }),
  preparationPilluliers: yup.string().required(),
  precisionPreparationPilluliers: yup.string().when("preparationPilluliers", {
    is: (preparationPilluliers) =>
      preparationPilluliers === "prepares_prealablement" ||
      preparationPilluliers === "au_fur_et_a_mesure",

    then: (precision) =>
      precision
        .min(
          5,
          "Vous devez préciser la mthéodologie de préparation des pilluliers",
        )
        .required(),
    otherwise: (precision) => precision.nullable().strip(),
  }),
  prescriptionMedicaleJointe: yup.boolean().required(),
  protocoleModificationTraitement: yup.boolean().required(),
  precisionProtocoleModificationTraitement: yup
    .string()
    .when("protocoleModificationTraitement", {
      is: (val) => !!val,
      then: (precision) =>
        precision
          .min(
            5,
            "Vous devez préciser le protocole relatif à la modification d'un traitement durant le séjour",
          )
          .required(),
      otherwise: (precision) => precision.nullable().strip(),
    }),
  ficheSuiviMedicaments: yup.boolean().required(),
  protocoleEvacuation: yup.boolean().required(),
  precisionProtocoleEvacuation: yup.string().when("protocoleEvacuation", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser le protocole d'évacuation")
        .required(),
    otherwise: (precision) => precision.nullable().strip(),
  }),
  protocoleAccident: yup.boolean().required(),
  precisionProtocoleAccident: yup.string().when("protocoleAccident", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser le protocole en cas d'accident")
        .required(),
    otherwise: (precision) => precision.nullable().strip(),
  }),
  protocoleReorientation: yup.boolean().required(),
  precisionProtocoleReorientation: yup.string().when("protocoleReorientation", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser le protocole de réorientation")
        .required(),
    otherwise: (precision) => precision.nullable().strip(),
  }),
  //
  protocoleCanicule: yup.boolean().required(),
  precisionProtocoleCanicule: yup.string().when("protocoleCanicule", {
    is: (val) => !!val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser le protcole en cas de canicule")
        .required(),
    otherwise: (precision) => precision.nullable().strip(),
  }),
  gestionBudgetPersonnel: yup.string().required(),
};

export default {
  constitutionEquipeOptions,
  preparationPilluliersOptions,
  responsableAdministrationMedicamentOptions,
  schema,
};
