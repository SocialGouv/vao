const yup = require("yup");

const telephoneSchema = require("./parts/telephone");
const adresseSchema = require("./parts/adresse.js")({ isFromAPIAdresse: true });

const coordonneesSchema = () => ({
  adresse: yup.object(adresseSchema).required(),
  email: yup.string().email().nullable(),
  nomGestionnaire: yup.string().required(),
  numTelephone1: telephoneSchema(),
  numTelephone2: telephoneSchema().notRequired(),
});

const informationsLocauxSchema = () => ({
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
  amenagementsSpecifiques: yup.boolean().required(),
  chambresDoubles: yup
    .boolean()
    .required(
      "Il est impératif de renseigner si les couples sont dans des chambres séparés",
    ),
  chambresUnisexes: yup
    .boolean()
    .required("Il est impératif de renseigner si les chambres sont unisexes"),
  couchageIndividuel: yup
    .boolean()
    .required("Il est impératif de renseigner l'individualité des couchages'"),
  descriptionLieuHebergement: yup
    .string()
    .required("Une description du lieu d'hébergement est obligatoire"),
  fileDernierArreteAutorisationMaire: yup.mixed().when("reglementationErp", {
    is: true,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.nullable().test({
        message: "Il est impératif de télécharger au moins une attestation ",
        test: (fileDernierArreteAutorisationMaire, context) => {
          return (
            !!fileDernierArreteAutorisationMaire ||
            !!context.parent.fileDerniereAttestationSecurite
          );
        },
      }),
  }),
  // Fichier Dernier arrếté du Maire si réglementation Erp = Oui
  fileDerniereAttestationSecurite: yup.mixed().when("reglementationErp", {
    is: true,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.nullable().test({
        message: "Il est impératif de télécharger au moins une attestation ",
        test: (fileDerniereAttestationSecurite, context) => {
          return (
            !!fileDerniereAttestationSecurite ||
            !!context.parent.fileDernierArreteAutorisationMaire
          );
        },
      }),
  }),
  fileReponseExploitantOuProprietaire: yup.mixed().when("reglementationErp", {
    is: false,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.required(
        "Il est impératif de télécharger la réponse de l'exploitant ou du propriétaire",
      ),
  }),
  litsDessus: yup
    .boolean()
    .required(
      "Il est impératif de renseigner si les lits du dessus seront utilisés",
    ),
  nombreLits: yup
    .number()
    .required("Il est impératif de renseigner le nombre de lits"),
  nombreLitsSuperposes: yup
    .number()
    .required("Il est impératif de renseigner le nombre de lits superposés"),
  nombreMaxPersonnesCouchage: yup
    .number()
    .required(
      "Il est impératif de renseigner le nombre de maximal de personnes par espace de couchage",
    ),
  pension: yup
    .string()
    .required("Le choix d'un type de pension est obligatoire"),
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

  reglementationErp: yup
    .boolean()
    .required(
      "Il est impératif de renseigner si vous le local est soumis à la réglementation ERP (établissement recevant du public)",
    ),
  type: yup
    .string()
    .required("Il est impératif de renseigner le type d'hébergement"),
  visiteLocaux: yup
    .boolean()
    .required("Il est impératif de renseigner si vous avez visité les locaux"),
  visiteLocauxAt: yup
    .date("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .typeError("date invalide")
    .when("visiteLocaux", {
      is: (visiteLocaux) => !!visiteLocaux,
      otherwise: (schema) => schema.nullable().strip(),
      then: (schema) =>
        schema.required(
          "Il est impératif de renseigner la date de votre dernière visite",
        ),
    }),
});

const informationsTransportSchema = () => ({
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
});

const schema = () => ({
  coordonnees: yup.object(coordonneesSchema()),
  informationsLocaux: yup.object(informationsLocauxSchema()),
  informationsTransport: yup.object(informationsTransportSchema()),
  nom: yup.string().required(),
});

module.exports = {
  coordonneesSchema,
  informationsLocauxSchema,
  informationsTransportSchema,
  schema,
};
