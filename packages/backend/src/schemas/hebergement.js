const yup = require("yup");

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
  { id: "blanchisseries", label: "Blanchisserie", name: "blanchisseries" },
  {
    id: "entretien_locaux",
    label: "Entretien des locaux",
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
  { label: "Commentaires", value: "commentaires" },
  { label: "Non renseigné", value: "non_renseigne" },
];

const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;

const coordonneesSchema = {
  adresse: yup.object().required(),
  email: yup.string().email().nullable(),
  nomGestionnaire: yup.string().required(),
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
};
const informationsLocauxSchema = {
  accessibilite: yup
    .string()
    .required("Le choix d'un niveau d'accessibilté est obligatoire"),
  descriptionLieuHebergement: yup
    .string()
    .required("Une description du lieu d'hébergement est obligatoire"),
  litsDessus: yup
    .boolean()
    .required(
      "Il est impératif de renseigner si les lits du dessus seront utilisés",
    ),
  couchageIndividuel: yup
    .boolean()
    .required("Il est impératif de renseigner l'individualité des couchages'"),
  nombreLits: yup
    .number()
    .required("Il est impératif de renseigner le nombre de lits"),
  chambresUnisexes: yup
    .boolean()
    .required("Il est impératif de renseigner si les chambres sont unisexes"),
  pension: yup
    .string()
    .required("Le choix d'un type de pension est obligatoire"),
  amenagementsSpecifiques: yup.boolean().required(),
  type: yup
    .string()
    .required("Il est impératif de renseigner le type d'hébergement"),
  chambresDoubles: yup
    .boolean()
    .required(
      "Il est impératif de renseigner si les couples sont dans des chambres séparés",
    ),
  visiteLocaux: yup
    .boolean()
    .required("Il est impératif de renseigner si vous avez visité les locaux"),
  nombreLitsSuperposes: yup
    .number()
    .required("Il est impératif de renseigner le nombre de lits superposés"),
  visiteLocauxAt: yup
    .date("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .typeError("date invalide")
    .when("visiteLocaux", {
      is: (visiteLocaux) => !!visiteLocaux,
      then: (schema) =>
        schema.required(
          "Il est impératif de renseigner la date de votre dernière visite",
        ),
      otherwise: (schema) => schema.nullable().strip(),
    }),
  nombreMaxPersonnesCouchage: yup
    .number()
    .required(
      "Il est impératif de renseigner le nombre de maximal de personnes par espace de couchage",
    ),
  precisionAmenagementsSpecifiques: yup
    .string()
    .when("amenagementsSpecifiques", {
      is: (amenagementsSpecifiques) => !!amenagementsSpecifiques,
      otherwise: (schema) => schema.nullable().strip(),
      then: (schema) =>
        schema
          .min(
            1,
            "Il est impératif de préciser ce que les aménagements ont de spécifiques",
          )
          .required(),
    }),
  prestationsHotelieres: yup.array().required(),
  rangementIndividuel: yup
    .boolean()
    .required(
      "Il est impératif de renseigner si des rangements individuels sont à disposition",
    ),
};
const informationsTransportSchema = {
  deplacementProximite: yup
    .string()
    .min(
      1,
      "Il est impératif de préciser le mode de transport utilisé pour les déplacements à proximité",
    )
    .required(),
  excursion: yup
    .string()
    .min(
      1,
      "Il est impératif de préciser le mode de transport utilisé pour les excursions",
    )
    .required(),
  vehiculesAdaptes: yup
    .boolean()
    .required("Il est impératif de renseigner si les véhicules sont adaptés"),
};

const schema = {
  coordonnees: yup.object(coordonneesSchema),
  informationsLocaux: yup.object(informationsLocauxSchema),
  informationsTransport: yup.object(informationsTransportSchema),
  nom: yup.string().required(),
};

module.exports = {
  accessibiliteOptions,
  coordonneesSchema,
  informationsLocauxSchema,
  informationsTransportSchema,
  pensionOptions,
  prestationsHotelieresOptions,
  schema,
  typeOptions,
};
