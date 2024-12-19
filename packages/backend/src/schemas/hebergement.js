const yup = require("yup");

const telephoneSchema = require("./parts/telephone");
const adresseSchema = require("./parts/adresse.js")({ isFromAPIAdresse: true });

const coordonneesSchema = (isBrouillon = false) => ({
  adresse: yup.object(adresseSchema).when([], {
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  email: yup.string().email("Format de l'adresse courriel invalide").nullable(),
  nomGestionnaire: yup.string().when([], {
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  numTelephone1: telephoneSchema().when([], {
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  numTelephone2: telephoneSchema().notRequired(),
});

const informationsLocauxSchema = (isBrouillon = false) => ({
  accessibilite: yup.string().when([], {
    else: (schema) =>
      schema.required("Le choix d'un niveau d'accessibilté est obligatoire"),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  accessibilitePrecision: yup
    .string()
    .nullable()
    .when("accessibilite", {
      is: (accessibilite) => {
        return accessibilite !== "commentaires";
      },
      then: (schema) => schema.strip(),
    }),
  amenagementsSpecifiques: yup.boolean().when([], {
    else: (schema) =>
      schema.required(
        "Il est impératif de renseigner si les aménagements spécifiques",
      ),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  chambresDoubles: yup.boolean().when([], {
    else: (schema) =>
      schema.required(
        "Il est impératif de renseigner si les couples sont dans des chambres séparés",
      ),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  chambresUnisexes: yup.boolean().when([], {
    else: (schema) =>
      schema.required(
        "Il est impératif de renseigner si les chambres sont unisexes",
      ),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  couchageIndividuel: yup.boolean().when([], {
    else: (schema) =>
      schema.required(
        "Il est impératif de renseigner l'individualité des couchages",
      ),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  descriptionLieuHebergement: yup.string().when([], {
    else: (schema) =>
      schema.required("Une description du lieu d'hébergement est obligatoire"),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  fileDernierArreteAutorisationMaire: yup.mixed().when("reglementationErp", {
    is: true,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.nullable().test({
        message: "Il est impératif de télécharger au moins une attestation ",
        test: (fileDernierArreteAutorisationMaire, context) => {
          return (
            !!fileDernierArreteAutorisationMaire ||
            !!context.parent.fileDerniereAttestationSecurite ||
            isBrouillon
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
            !!context.parent.fileDernierArreteAutorisationMaire ||
            isBrouillon
          );
        },
      }),
  }),
  fileReponseExploitantOuProprietaire: yup.mixed().when("reglementationErp", {
    is: false,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.when([], {
        else: (schema) =>
          schema.required(
            "Il est impératif de télécharger la réponse de l'exploitant ou du propriétaire",
          ),
        is: () => isBrouillon,
        then: (schema) => schema.notRequired(),
      }),
  }),
  litsDessus: yup.boolean().when("nombreLitsSuperposes", {
    is: (nombreLitsSuperposes) => !!nombreLitsSuperposes,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.when([], {
        else: (schema) =>
          schema.required(
            "Il est nécessaire de renseigner si les lits du dessus seront utilisés",
          ),
        is: () => isBrouillon,
        then: (schema) => schema.notRequired(),
      }),
  }),
  nombreLits: yup.number().when([], {
    else: (schema) =>
      schema.required("Il est impératif de renseigner le nombre de lits"),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  nombreLitsSuperposes: yup.number().nullable(),
  nombreMaxPersonnesCouchage: yup.number().when([], {
    else: (schema) =>
      schema.required(
        "Il est impératif de renseigner le nombre de maximal de personnes par espace de couchage",
      ),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  pension: yup.string().when([], {
    else: (schema) =>
      schema.required("Le choix d'un type de pension est obligatoire"),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  precisionAmenagementsSpecifiques: yup
    .string()
    .when("amenagementsSpecifiques", {
      is: (amenagementsSpecifiques) => !!amenagementsSpecifiques,
      otherwise: (schema) => schema.nullable().strip(),
      then: (schema) =>
        schema.when([], {
          else: (schema) =>
            schema
              .min(
                1,
                "Il est impératif de préciser ce que les aménagements ont de spécifiques",
              )
              .required(),
          is: () => isBrouillon,
          then: (schema) => schema.notRequired(),
        }),
    }),
  prestationsHotelieres: yup.array().when([], {
    else: (schema) => schema.required(),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  rangementIndividuel: yup.boolean().when([], {
    else: (schema) =>
      schema.required(
        "Il est impératif de renseigner si des rangements individuels sont à disposition",
      ),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  reglementationErp: yup.boolean().when([], {
    else: (schema) =>
      schema.required(
        "Il est impératif de renseigner si vous le local est soumis à la réglementation ERP (établissement recevant du public)",
      ),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  type: yup.string().when([], {
    else: (schema) =>
      schema.required("Il est impératif de renseigner le type d'hébergement)"),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  visiteLocaux: yup.boolean().when([], {
    else: (schema) =>
      schema.required(
        "Il est impératif de renseigner si vous avez visité les locaux)",
      ),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  visiteLocauxAt: yup
    .date("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .typeError("date invalide")
    .max(new Date(), "La date doit être inférieure à la date du jour.")
    .nullable(),
});

const informationsTransportSchema = (isBrouillon = false) => ({
  deplacementProximite: yup.string().when([], {
    else: (schema) =>
      schema
        .min(
          1,
          "Il est impératif de préciser le mode de transport utilisé pour les déplacements à proximité",
        )
        .required(),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  excursion: yup.string().when([], {
    else: (schema) =>
      schema
        .min(
          1,
          "Il est impératif de préciser le mode de transport utilisé pour les excursions",
        )
        .required(),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
  vehiculesAdaptes: yup.boolean().when([], {
    else: (schema) =>
      schema.required(
        "Il est impératif de renseigner si les véhicules sont adaptés",
      ),
    is: () => isBrouillon,
    then: (schema) => schema.notRequired(),
  }),
});

const schema = (isBrouillon = false) => ({
  coordonnees: yup.object(coordonneesSchema(isBrouillon)),
  informationsLocaux: yup.object(informationsLocauxSchema(isBrouillon)),
  informationsTransport: yup.object(informationsTransportSchema(isBrouillon)),
  nom: yup.string().required(),
});

module.exports = {
  coordonneesSchema,
  informationsLocauxSchema,
  informationsTransportSchema,
  schema,
};
