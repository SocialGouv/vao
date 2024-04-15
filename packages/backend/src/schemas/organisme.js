const yup = require("yup");
const dayjs = require("dayjs");

const regex = require("../utils/regex");

const adresseSchema = require("./parts/adresse");
const personneSchema = require("./parts/personne");
const protocoleTransportSchema = require("./parts/protocoleTransport");
const protocoleSanitaireSchema = require("./parts/protocoleSanitaire");

const professionOptions = [
  {
    text: "Agriculture, sylviculture et pêche",
    value: "Agriculture, sylviculture et pêche",
  },
  { text: "Industries extractives", value: "Industries extractives" },
  { text: "Industries manufacturières", value: "Industries manufacturières" },
  {
    text: "Production et distribution d’électricité, de gaz, de vapeur et d’air conditionné",
    value:
      "Production et distribution d’électricité, de gaz, de vapeur et d’air conditionné",
  },
  {
    text: "Production et distribution d’eau ; assainissement, gestion des déchets et dépollution",
    value:
      "Production et distribution d’eau ; assainissement, gestion des déchets et dépollution",
  },
  { text: "Construction", value: "Construction" },
  {
    text: "Commerce ; réparation d’automobiles et de motocycles",
    value: "Commerce ; réparation d’automobiles et de motocycles",
  },
  { text: "Transports et entreposage", value: "Transports et entreposage" },
  { text: "Hébergement et restauration", value: "Hébergement et restauration" },
  {
    text: "Information et communication",
    value: "Information et communication",
  },
  {
    text: "Activités financières et d’assurances",
    value: "Activités financières et d’assurances",
  },
  { text: "Activités immobilières", value: "Activités immobilières" },
  {
    text: "Activités spécialisées, scientifiques et techniques",
    value: "Activités spécialisées, scientifiques et techniques",
  },
  {
    text: "Activités de services administratifs et de soutien",
    value: "Activités de services administratifs et de soutien",
  },
  { text: "Administration publique", value: "Administration publique" },
  { text: "Enseignement", value: "Enseignement" },
  {
    text: "Santé humaine et action sociale",
    value: "Santé humaine et action sociale",
  },
  {
    text: "Arts, spectacles et activités récréatives",
    value: "Arts, spectacles et activités récréatives",
  },
  {
    text: "Autres activités de services",
    value: "Autres activités de services",
  },
  {
    text: "Activités des ménages en tant qu’employeur ; activités indifférenciées des ménages en tant que",
    value:
      "Activités des ménages en tant qu’employeur ; activités indifférenciées des ménages en tant que",
  },
  {
    text: "producteur de biens et services pour usage propre",
    value: "producteur de biens et services pour usage propre",
  },
  {
    text: "Activités extraterritoriales. ",
    value: "Activités extraterritoriales. ",
  },
];

yup.setLocale({
  mixed: {
    required: "Le champs est obligatoire.",
  },
});

const personneMoraleSchema = () => ({
  adresse: yup.string().required(),
  email: yup
    .string()
    .email("le format de l'email n'est pas valide")
    .required("L'email de contact est obligatoire"),
  etablissements: yup.array().required(),
  nomCommercial: yup.string().nullable().default(null),
  pays: yup.string().required(),
  raisonSociale: yup.string().required(),
  representantsLegaux: yup
    .array()
    .min(1, "Au moins un représentant légal est requis")
    .required(),
  responsableSejour: yup.object({
    ...personneSchema({
      showAdresse: true,
      showEmail: true,
      showTelephone: false,
    }),
  }),
  siegeSocial: yup.boolean().required(),
  siren: yup
    .string()
    .test(
      "siret",
      "Le numéro SIREN doit faire exactement 9 chiffres, sans espace",
      (siren) => regex.sirenRegex.test(siren),
    )
    .required(),
  siret: yup
    .string()
    .test(
      "siret",
      "Le numéro SIRET doit faire exactement 14 chiffres, sans espace",
      (siret) => regex.siretRegex.test(siret),
    )
    .required(),
  statut: yup.string().required(),
  telephone: yup
    .string()
    .test("telephone", "Format de numéro de téléphone invalide", (telephone) =>
      regex.numTelephoneRegex.test(telephone),
    )
    .required("Le numéro de téléphone de l'établissement est obligatoire"),
});
const personnePhysiqueSchema = () => ({
  adresseDomicile: yup.object({ ...adresseSchema(true) }).required(),
  adresseIdentique: yup.boolean().required(),
  adresseSiege: yup.object({ ...adresseSchema(true) }).required(),
  nomNaissance: yup
    .string()
    .test("acceptedChars", "Caractères non acceptés détectés", (nom) =>
      regex.acceptedCharsRegex.test(nom),
    )
    .test(
      "doubleSpaces",
      "Le nom ne peut contenir deux espaces successifs",
      (nom) => !regex.doubleSpacesRegex.test(nom),
    )
    .test(
      "spaceFollowingDash",
      "Le nom ne peut contenir d'espace suivant un tiret",
      (nom) => !regex.spaceFollowingDashRegex.test(nom),
    )
    .test(
      "tripleDash",
      "Le nom ne peut contenir trois tirets consécutifs",
      (nom) => !regex.tripleDashRegex.test(nom),
    )
    .required(),
  nomUsage: yup.string().nullable(true),
  prenom: yup
    .string()
    .test("acceptedChars", "Caractères non acceptés détectés", (prenom) =>
      regex.acceptedCharsRegex.test(prenom),
    )
    .test(
      "doubleSpaces",
      "Le prénom ne peut contenir deux espaces successifs",
      (prenom) => !regex.doubleSpacesRegex.test(prenom),
    )
    .test(
      "spaceFollowingDash",
      "Le prénom ne peut contenir d'espace suivant un tiret",
      (prenom) => !regex.spaceFollowingDashRegex.test(prenom),
    )
    .test(
      "doubleDash",
      "Le prénom ne peut contenir deux tirets consécutifs",
      (prenom) => !regex.doubleDashRegex.test(prenom),
    )
    .required(),
  profession: yup
    .string()
    .required()
    .oneOf(professionOptions.map((o) => o.value)),
  telephone: yup
    .string()
    .test("telephone", "Format de numéro de téléphone invalide", (tel) =>
      regex.numTelephoneRegex.test(tel),
    ),
});
const agrementSchema = (regions) => ({
  dateObtention: yup
    .date()
    .max(new Date(), "La date doit être inférieure à la date du jour.")
    .min(
      dayjs().add(-5, "year"),
      "La date de validité de votre agrément a expiré",
    )
    .required(),
  file: yup.object().required(),
  numero: yup
    .string()
    .max(30, "Le numéro d'agrément ne peut pas dépasser 30 caractères.")
    .required(),
  regionObtention: yup
    .string()
    .test(
      "acceptedReferentiels",
      "Valeur non présente dans le référentiel",
      (regionObtention) => !regions.includes(regionObtention),
    )
    .required(),
});

const schema = (regions) => ({
  agrement: yup.object().when(["typeOrganisme", "personneMorale.siegeSocial"], {
    is: (typeOrganisme, siegeSocial) => {
      return typeOrganisme === "personne_physique" || siegeSocial === true;
    },
    otherwise: (schema) => schema.nullable(),
    then: (schema) =>
      schema
        .shape(agrementSchema(regions))
        .required("Aucune information renseignée"),
  }),
  organismeId: yup.number().required(),
  personneMorale: yup
    .object()
    .required("Aucune information renseignée")
    .when("typeOrganisme", {
      is: (typeOrganisme) => typeOrganisme === "personne_morale",
      then: (schema) => schema.shape(personneMoraleSchema()),
    }),
  personnePhysique: yup
    .object()
    .required("Aucune information renseignée")
    .when("typeOrganisme", {
      is: (typeOrganisme) => typeOrganisme === "personne_physique",
      then: (schema) => schema.shape(personnePhysiqueSchema()),
    }),
  protocoleSanitaire: yup
    .object()
    .when(["typeOrganisme", "personneMorale.siegeSocial"], {
      is: (typeOrganisme, siegeSocial) => {
        return typeOrganisme === "personne_physique" || siegeSocial === true;
      },
      otherwise: (schema) => schema.nullable(),
      then: (schema) =>
        schema
          .shape(protocoleSanitaireSchema())
          .required("Aucune information renseignée"),
    }),
  protocoleTransport: yup
    .object()
    .when(["typeOrganisme", "personneMorale.siegeSocial"], {
      is: (typeOrganisme, siegeSocial) => {
        return typeOrganisme === "personne_physique" || siegeSocial === true;
      },
      otherwise: (schema) => schema.nullable(),
      then: (schema) =>
        schema
          .shape(protocoleTransportSchema())
          .required("Aucune information renseignée"),
    }),
  typeOrganisme: yup
    .string()
    .required()
    .oneOf(["personne_morale", "personne_physique"]),
});

module.exports = {
  agrementSchema,
  personneMoraleSchema,
  personnePhysiqueSchema,
  schema,
};
