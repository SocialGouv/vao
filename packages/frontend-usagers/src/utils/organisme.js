import * as yup from "yup";
import dayjs from "dayjs";
import regex from "./regex";
import adresse from "./adresse";
import personne from "./personne";
import { useRegionStore } from "@/stores/referentiels";

const types = [
  {
    label: "Personne physique",
    value: "personne_physique",
  },
  {
    label: "Personne morale",
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

const schema = {
  typeOrganisme: yup
    .string()
    .required()
    .oneOf(["personne_morale", "personne_physique"]),
  personneMorale: {
    siret: yup
      .string()
      .test(
        "siret",
        "Le numéro SIRET doit faire exactement 14 chiffres, sans espace",
        (siret) => regex.siretRegex.test(siret),
      )
      .required(),
    email: yup
      .string()
      .email("le format de l'email n'est pas valide")
      .required("L'email de contact est obligatoire"),
    telephone: yup
      .string()
      .test(
        "telephone",
        "Format de numéro de téléphone invalide",
        (telephone) => regex.numTelephoneRegex.test(telephone),
      )
      .required("Le numéro de téléphone de l'établissement est obligatoire"),
    representantsLegaux: yup
      .array()
      .min(1, "Au moins un représentant légal est recquis")
      .required(),
    etablissements: yup
      .array()
      .min(1, "Vous devez sélectionner au moins un établissement")
      .required(),
    responsableSejour: yup.object({
      ...personne.schema({
        showAdresse: true,
        showTelephone: false,
        showEmail: true,
      }),
    }),
  },
  personnePhysique: {
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
    adresseIdentique: yup.boolean().required(),
    adresseDomicile: yup.object({ ...adresse.schema(true) }).required(),
    adresseSiege: yup.object({ ...adresse.schema(true) }).required(),
  },
  agrement: {
    file: yup.object().required(),
    numero: yup.string().required(),
    regionObtention: yup
      .string()
      .test(
        "acceptedReferentiels",
        "Valeur non présente dans le référentiel",
        (regionObtention) =>
          !useRegionStore().regions.includes(regionObtention),
      )
      .required(),
    dateObtention: yup
      .date()
      .max(new Date(), "La date doit être inférieure à la date du jour.")
      .min(
        dayjs().add(-5, "year"),
        "La date de validité de votre agrément a expiré",
      )
      .required(),
  },
};

export default {
  types,
  professionOptions,
  schema,
};
