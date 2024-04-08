const yup = require("yup");

const schema = () => ({
  accordCabinetMedical: yup.boolean().required(),
  conservationMedicamentThermosensible: yup.boolean().required(),
  constitutionEquipe: yup.array(),
  dispositionsSpecifiques: yup.boolean().required(),
  ficheSuiviMedicaments: yup.boolean().required(),
  files: yup.array(),
  gestionBudgetPersonnel: yup.string().required(),
  individualisationMedicaments: yup.boolean().required(),
  precisionAccordCabinetMedical: yup.string().when("accordCabinetMedical", {
    is: (accordCabinetMedical) => !!accordCabinetMedical,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.min(5, "Vous devez préciser votre réponse précédente").required(),
  }),
  precisionConstitutionEquipe: yup.string().when("constitutionEquipe", {
    is: (constitutionEquipe) =>
      constitutionEquipe && constitutionEquipe.length > 0,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.min(5, "Vous devez préciser votre réponse précédente").required(),
  }),
  precisionDispositionsSpecifiques: yup
    .string()
    .when("dispositionsSpecifiques", {
      is: (dispositionsSpecifiques) => !!dispositionsSpecifiques,
      otherwise: (schema) => schema.nullable().strip(),
      then: (schema) =>
        schema
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
    }),
  precisionIndividualisationMedicaments: yup
    .string()
    .when("individualisationMedicaments", {
      is: (individualisationMedicaments) => !!individualisationMedicaments,
      otherwise: (schema) => schema.nullable().strip(),
      then: (schema) =>
        schema
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
    }),
  precisionPreparationPilluliers: yup.string().when("preparationPilluliers", {
    is: (preparationPilluliers) =>
      preparationPilluliers === "prepares_prealablement" ||
      preparationPilluliers === "au_fur_et_a_mesure",

    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.min(5, "Vous devez préciser votre réponse précédente").required(),
  }),
  precisionProtocoleAccident: yup.string().when("protocoleAccident", {
    is: (protocoleAccident) => !!protocoleAccident,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.min(5, "Vous devez préciser votre réponse précédente").required(),
  }),
  precisionProtocoleCanicule: yup.string().when("protocoleCanicule", {
    is: (protocoleCanicule) => !!protocoleCanicule,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.min(5, "Vous devez préciser votre réponse précédente").required(),
  }),
  precisionProtocoleEvacuation: yup.string().when("protocoleEvacuation", {
    is: (protocoleEvacuation) => !!protocoleEvacuation,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.min(5, "Vous devez préciser votre réponse précédente").required(),
  }),
  precisionProtocoleModificationTraitement: yup
    .string()
    .when("protocoleModificationTraitement", {
      is: (protocoleModificationTraitement) =>
        !!protocoleModificationTraitement,
      otherwise: (schema) => schema.nullable().strip(),
      then: (schema) =>
        schema
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
    }),
  precisionProtocoleReorientation: yup.string().when("protocoleReorientation", {
    is: (protocoleReorientation) => !!protocoleReorientation,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.min(5, "Vous devez préciser votre réponse précédente").required(),
  }),
  precisionResponsableAdministrationMedicament: yup
    .string()
    .when("responsableAdministrationMedicament", {
      is: (responsableAdministrationMedicament) =>
        responsableAdministrationMedicament &&
        responsableAdministrationMedicament.length > 0,
      otherwise: (schema) => schema.nullable().strip(),
      then: (schema) =>
        schema
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
    }),
  precisionStockageMedicamentSecurise: yup
    .string()
    .when("stockageMedicamentSecurise", {
      is: (stockageMedicamentSecurise) => !!stockageMedicamentSecurise,
      otherwise: (schema) => schema.nullable().strip(),
      then: (schema) =>
        schema
          .min(5, "Vous devez préciser votre réponse précédente")
          .required(),
    }),
  preparationPilluliers: yup.string().required(),
  prescriptionMedicaleJointe: yup.boolean().required(),
  protocoleAccident: yup.boolean().required(),
  protocoleCanicule: yup.boolean().required(),
  protocoleEvacuation: yup.boolean().required(),
  protocoleModificationTraitement: yup.boolean().required(),
  protocoleReorientation: yup.boolean().required(),
  responsableAdministrationMedicament: yup.array().required(),
  stockageMedicamentSecurise: yup.boolean().required(),
  troussePharmacie: yup.boolean().required(),
});

module.exports = schema;
