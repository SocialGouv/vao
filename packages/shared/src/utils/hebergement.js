import * as yup from "yup";

const pensionOptions = [
  { label: "Hébergement seul", value: "hebergement_seul" },
  { label: "Petit déjeuner", value: "petit_dejeuner" },
  {
    label: "Demi-pension",
    value: "demi_pension",
  },
  { label: "Pension complète", value: "pension_complete" },
];

const prestationsHotelieresOptions = [
  { label: "Blanchisserie", id: "blanchisseries", name: "blanchisseries" },
  {
    label: "Entretien des locaux",
    id: "entretien_locaux",
    name: "entretien_locaux",
  },
];

const typeOptions = [
  { label: "Hôtel", value: "hotel" },
  { label: "Meublé de tourisme", value: "meuble_tourisme" },
  {
    label: "Résidence de tourisme, chambre d'hôte",
    value: "residence_tourisme",
  },
  {
    label: "Camping, caravaning, mobile home",
    value: "camping",
  },
  { label: "Autre", value: "autre" },
];

const accessibiliteOptions = [
  { label: "Accessible", value: "accessible" },
  { label: "Signalé comme non adapté", value: "non_adapte" },
  { label: "Autre (précisez ci-dessous)", value: "commentaires" },
];

const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;

const coordonneesSchema = {
  nomGestionnaire: yup.string().required(),
  adresse: yup.object().required(),
  numTelephone1: yup
    .string()
    .test(
      "telephone",
      "Format de numéro de téléphone invalide",
      (numTelephone1) => numTelephoneRegex.test(numTelephone1),
    )
    .required(),
  numTelephone2: yup
    .string()
    .test(
      "telephone",
      "Format de numéro de téléphone invalide",
      (numTelephone2) =>
        numTelephone2 == null || numTelephoneRegex.test(numTelephone2),
    )
    .nullable(),
  email: yup.string().email("Format de courriel invalide").nullable(),
};
const informationsLocauxSchema = {
  type: yup
    .string()
    .required("Il est nécessaire de renseigner le type d'hébergement"),
  visiteLocaux: yup
    .boolean()
    .required("Il est nécessaire de renseigner si vous avez visité les locaux"),
  visiteLocauxAt: yup
    .date("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .nullable()
    .typeError("date invalide")
    .when("visiteLocaux", {
      is: (visiteLocaux) => !!visiteLocaux,
      then: (schema) =>
        schema
          .max(new Date(), "La date doit être inférieure à la date du jour.")
          .nullable(),
      otherwise: (schema) => schema.nullable().strip(),
    }),
  reglementationErp: yup
    .boolean()
    .required(
      "Il est nécessaire de renseigner si l'hébergement est soumis à la réglementation ERP",
    ),

  // Fichier Dernière attestation de commité de sécurité si réglementation Erp = Oui
  fileDerniereAttestationSecurite: yup.mixed().when("reglementationErp", {
    is: true,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.nullable().test({
        test: (fileDerniereAttestationSecurite, context) => {
          return (
            !!fileDerniereAttestationSecurite ||
            !!context.parent.fileDernierArreteAutorisationMaire
          );
        },
        message: "Il est nécessaire de télécharger au moins une attestation ",
      }),
  }),
  // Fichier Dernier arrếté du Maire si réglementation Erp = Oui
  fileDernierArreteAutorisationMaire: yup.mixed().when("reglementationErp", {
    is: true,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.nullable().test({
        test: (fileDernierArreteAutorisationMaire, context) => {
          return (
            !!fileDernierArreteAutorisationMaire ||
            !!context.parent.fileDerniereAttestationSecurite
          );
        },
        message: "Il est nécessaire de télécharger au moins une attestation ",
      }),
  }),
  // Fichier Réponse du l'exploitant ou propiétaire si réglementation Erp = Non
  fileReponseExploitantOuProprietaire: yup.mixed().when("reglementationErp", {
    is: false,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.required(
        "Il est nécessaire de télécharger la réponse de l'exploitant ou du propriétaire",
      ),
  }),
  accessibilite: yup
    .string()
    .required("Le choix d'un niveau d'accessibilté est obligatoire"),
  accessibilitePrecision: yup
    .string()
    .nullable()
    .when("accessibilite", {
      is: (accessibilite) => {
        return accessibilite !== "commentaires";
      },
      then: (schema) => schema.strip(),
    }),
  pension: yup
    .string()
    .required("Le choix d'un type de pension est obligatoire"),
  prestationsHotelieres: yup.array().required(),
  descriptionLieuHebergement: yup
    .string()
    .required("Une description du lieu d'hébergement est obligatoire"),
  nombreLits: yup
    .number()
    .required("Il est nécessaire de renseigner le nombre de lits"),
  nombreLitsSuperposes: yup.number().nullable(),
  litsDessus: yup.boolean().when("nombreLitsSuperposes", {
    is: (nombreLitsSuperposes) => !!nombreLitsSuperposes,
    then: (schema) =>
      schema.required(
        "Il est nécessaire de renseigner si les lits du dessus seront utilisés",
      ),
    otherwise: (schema) => schema.nullable().strip(),
  }),
  nombreMaxPersonnesCouchage: yup
    .number()
    .required(
      "Il est nécessaire de renseigner le nombre de maximal de personnes par espace de couchage",
    ),
  couchageIndividuel: yup
    .boolean()
    .required("Il est nécessaire de renseigner l'individualité des couchages'"),
  rangementIndividuel: yup
    .boolean()
    .required(
      "Il est nécessaire de renseigner si des rangements individuels sont à disposition",
    ),
  chambresUnisexes: yup
    .boolean()
    .required("Il est nécessaire de renseigner si les chambres sont unisexes"),
  chambresDoubles: yup
    .boolean()
    .required(
      "Il est nécessaire de renseigner si les couples sont dans des chambres séparés",
    ),
  amenagementsSpecifiques: yup.boolean().required(),
  precisionAmenagementsSpecifiques: yup
    .string()
    .when("amenagementsSpecifiques", {
      is: (amenagementsSpecifiques) => !!amenagementsSpecifiques,
      then: (schema) =>
        schema
          .min(
            1,
            "Il est nécessaire de préciser ce que les aménagements ont de spécifiques",
          )
          .required(),
      otherwise: (schema) => schema.nullable().strip(),
    }),
};
const informationsTransportSchema = {
  vehiculesAdaptes: yup
    .boolean()
    .required("Il est nécessaire de renseigner si les véhicules sont adaptés"),
  deplacementProximite: yup
    .string()
    .min(
      1,
      "Il est nécessaire de préciser le mode de transport utilisé pour les déplacements à proximité",
    )
    .required(),
  excursion: yup
    .string()
    .min(
      1,
      "Il est nécessaire de préciser le mode de transport utilisé pour les excursions",
    )
    .required(),
};

const schema = {
  nom: yup.string().required(),
  coordonnees: yup.object(coordonneesSchema),
  informationsLocaux: yup.object(informationsLocauxSchema),
  informationsTransport: yup.object(informationsTransportSchema),
};

export default {
  pensionOptions,
  prestationsHotelieresOptions,
  accessibiliteOptions,
  typeOptions,
  coordonneesSchema,
  informationsLocauxSchema,
  informationsTransportSchema,
  schema,
};
