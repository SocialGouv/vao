import * as yup from "yup";
import dayjs from "dayjs";
import regex from "./regex";
import personne from "./personne";
import protocoleTransport from "./protocoleTransport";
import protocoleSanitaire from "./protocoleSanitaire";
import { adresseSchema } from "@vao/shared/src/schema/adresse";

const types = [
  {
    label:
      "Personne physique (forme juridique Entreprise individuelle, EIRL, micro entreprise)",
    value: "personne_physique",
  },
  {
    label: "Personne morale (forme juridique Association, SAS, SARL…)",
    value: "personne_morale",
  },
];

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
    text: "Activités des ménages en tant qu’employeur ; activités indifférenciées des ménages en tant que producteur de biens et services pour usage propre",
    value:
      "Activités des ménages en tant qu’employeur ; activités indifférenciées des ménages en tant que producteur de biens et services pour usage propre",
  },
  {
    text: "Activités extraterritoriales. ",
    value: "Activités extraterritoriales. ",
  },
];

yup.setLocale({
  mixed: {
    required: "Le champ est obligatoire.",
  },
});
const etablissementPrincipalSchema = () => ({
  adresse: yup.string().required(),
  email: yup
    .string()
    .email("le format de l'adresse courriel n'est pas valide")
    .required("L'adresse de courriel de contact est obligatoire"),

  nomCommercial: yup.string().nullable().default(null),
  pays: yup.string().required(),
  raisonSociale: yup.string().required(),
  siret: yup
    .string()
    .test(
      "siret",
      "Le numéro SIRET doit faire exactement 14 chiffres, sans espace",
      (siret) => regex.siretRegex.test(siret),
    )
    .required(),
  telephone: yup
    .string()
    .test("telephone", "Format de numéro de téléphone invalide", (telephone) =>
      regex.numTelephoneRegex.test(telephone),
    )
    .required("Le numéro de téléphone de l'établissement est obligatoire"),
});

const personneMoraleSchema = {
  siret: yup
    .string()
    .test(
      "siret",
      "Le numéro SIRET doit faire exactement 14 chiffres, sans espace",
      (siret) => regex.siretRegex.test(siret),
    )
    .required(),
  siren: yup
    .string()
    .test(
      "siret",
      "Le numéro SIREN doit faire exactement 9 chiffres, sans espace",
      (siren) => regex.sirenRegex.test(siren),
    )
    .required(),
  siegeSocial: yup.boolean().required(),
  porteurAgrement: yup
    .boolean()
    .required(
      "vous devez préciser si vous êtes titualire d'un agrément VAO ou non",
    ),
  raisonSociale: yup.string().required(),
  nomCommercial: yup.string().nullable().default(null),
  statut: yup.string().required(),
  adresse: yup.string().required(),
  pays: yup.string().required(),
  email: yup
    .string()
    .email("le format de l'adresse courriel n'est pas valide")
    .required("L'adresse courriel de contact est obligatoire"),
  telephone: yup
    .string()
    .test("telephone", "Format de numéro de téléphone invalide", (telephone) =>
      regex.numTelephoneRegex.test(telephone),
    )
    .required("Le numéro de téléphone de l'établissement est obligatoire"),
  representantsLegaux: yup
    .array()
    .min(1, "Au moins un représentant légal est requis")
    .required(),
  etablissementPrincipal: yup.object().when("porteurAgrement", {
    is: (val) => !val,
    otherwise: (val) => val.nullable(),
    then: (schema) => schema.shape(etablissementPrincipalSchema()),
  }),
  responsableSejour: yup.object({
    ...personne.schema({
      showAdresse: true,
      showTelephone: true,
      showEmail: true,
      showFonction: true,
    }),
  }),
};
const etablissementsSecondaireSchema = {
  etablissements: yup.array().required(),
};

const personnePhysiqueSchema = {
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
  siret: yup
    .string()
    .nullable(true)
    .test(
      "siret",
      "Le numéro SIRET doit faire exactement 14 chiffres, sans espace",
      (siret) => regex.siretRegex.test(siret),
    ),
  adresseIdentique: yup.boolean().required(),
  adresseDomicile: yup.object({ ...adresseSchema(true) }).required(),
  adresseSiege: yup.object({ ...adresseSchema(true) }).required(),
};
const agrementSchema = (regions) => ({
  file: yup.mixed().required(),
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
  dateObtention: yup
    .date("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .typeError("date invalide")
    .max(new Date(), "La date doit être inférieure à la date du jour.")
    .min(
      dayjs().add(-5, "year"),
      "L'agrément ne peut pas avoir été délivré il y a plus de 5 ans",
    )
    .required("la date d'obtention est obligatoire"),
});

const schema = (regions) => ({
  organismeId: yup.number().required(),
  typeOrganisme: yup
    .string()
    .required()
    .oneOf(["personne_morale", "personne_physique"]),
  personneMorale: yup
    .object()
    .required("Aucune information renseignée")
    .when("typeOrganisme", {
      is: (typeOrganisme) => typeOrganisme === "personne_morale",
      then: (schema) => schema.shape(personneMoraleSchema),
    }),
  personnePhysique: yup
    .object()
    .required("Aucune information renseignée")
    .when("typeOrganisme", {
      is: (typeOrganisme) => typeOrganisme === "personne_physique",
      then: (schema) => schema.shape(personnePhysiqueSchema),
    }),
  agrement: yup.object().when(["typeOrganisme", "personneMorale.siegeSocial"], {
    is: (typeOrganisme, siegeSocial) => {
      return typeOrganisme === "personne_physique" || siegeSocial === true;
    },
    then: (schema) =>
      schema
        .shape(agrementSchema(regions))
        .required("Aucune information renseignée"),
    otherwise: (schema) => schema.shape(agrementSchema(regions)).nullable(),
  }),
  protocoleTransport: yup
    .object(protocoleTransport.schema)
    .required("Aucune information renseignée"),
  protocoleSanitaire: yup
    .object(protocoleSanitaire.schema)
    .required("Aucune information renseignée"),
});

export default {
  types,
  professionOptions,
  personneMoraleSchema,
  personnePhysiqueSchema,
  agrementSchema,
  schema,
  etablissementsSecondaireSchema,
};
