import * as yup from "yup";

import type { BasicRoute, RouteSchema } from "../..";

export const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;

export type WriteUsagerHebergementRouteSchema<T extends BasicRoute> = {
  legacy: RouteSchema<T>;
  unite: RouteSchema<T>;
};

/** @internal réservé à la construction des schémas de validation yup */
export type HebergementBodySchema = Record<string, yup.AnySchema>;

const telephoneSchema = (): yup.StringSchema<string> =>
  yup
    .string()
    .test(
      "telephone",
      "Format de numéro de téléphone invalide",
      (telephone) => {
        return !telephone || numTelephoneRegex.test(telephone ?? "");
      },
    )
    .required();

const adresseSchema = ({
  isFromAPIAdresse = false,
}: { isFromAPIAdresse?: boolean } = {}): Record<string, yup.AnySchema> => {
  return isFromAPIAdresse
    ? {
        cleInsee: yup.string().nullable(),
        codeInsee: yup.string().required("ce champ est obligatoire"),
        codePostal: yup.string().required("ce champ est obligatoire"),
        coordinates: yup.array().required("ce champ est obligatoire"),
        departement: yup.string().required("ce champ est obligatoire"),
        label: yup.string().required("ce champ est obligatoire"),
      }
    : {
        label: yup.string().required(),
      };
};

const coordonneesSchema = (
  isBrouillon = false,
): Record<string, yup.AnySchema> => ({
  adresse: yup.object(adresseSchema({ isFromAPIAdresse: true })).when([], {
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

const informationsLocauxSchema = (
  isBrouillon = false,
): Record<string, yup.AnySchema> => ({
  accessibilite: yup.string().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required("Le choix d'un niveau d'accessibilté est obligatoire"),
    then: (schema) => schema.notRequired(),
  }),
  accessibilitePrecision: yup
    .string()
    .nullable()
    .when("accessibilite", {
      is: (accessibilite: string) => {
        return accessibilite !== "commentaires";
      },
      then: (schema) => schema.strip(),
    }),
  amenagementsSpecifiques: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si les aménagements spécifiques",
      ),
    then: (schema) => schema.notRequired(),
  }),
  chambresDoubles: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si les couples sont dans des chambres séparés",
      ),
    then: (schema) => schema.notRequired(),
  }),
  chambresUnisexes: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si les chambres sont unisexes",
      ),
    then: (schema) => schema.notRequired(),
  }),
  couchageIndividuel: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner l'individualité des couchages",
      ),
    then: (schema) => schema.notRequired(),
  }),
  descriptionLieuHebergement: yup.string().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required("Une description du lieu d'hébergement est obligatoire"),
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
        is: () => isBrouillon,
        otherwise: (schema) =>
          schema.required(
            "Il est impératif de télécharger la réponse de l'exploitant ou du propriétaire",
          ),
        then: (schema) => schema.notRequired(),
      }),
  }),
  litsDessus: yup.boolean().when("nombreLitsSuperposes", {
    is: (nombreLitsSuperposes: number) => !!nombreLitsSuperposes,
    otherwise: (schema) => schema.nullable().strip(),
    then: (schema) =>
      schema.when([], {
        is: () => isBrouillon,
        otherwise: (schema) =>
          schema.required(
            "Il est nécessaire de renseigner si les lits du dessus seront utilisés",
          ),
        then: (schema) => schema.notRequired(),
      }),
  }),
  nombreLits: yup.number().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required("Il est impératif de renseigner le nombre de lits"),
    then: (schema) => schema.notRequired(),
  }),
  nombreLitsSuperposes: yup.number().nullable(),
  nombreMaxPersonnesCouchage: yup.number().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner le nombre de maximal de personnes par espace de couchage",
      ),
    then: (schema) => schema.notRequired(),
  }),
  pension: yup.string().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required("Le choix d'un type de pension est obligatoire"),
    then: (schema) => schema.notRequired(),
  }),
  precisionAmenagementsSpecifiques: yup
    .string()
    .when("amenagementsSpecifiques", {
      is: (amenagementsSpecifiques: boolean | null | undefined) =>
        !!amenagementsSpecifiques,
      otherwise: (schema) => schema.nullable().strip(),
      then: (schema) =>
        schema.when([], {
          is: () => isBrouillon,
          otherwise: (schema) =>
            schema
              .min(
                1,
                "Il est impératif de préciser ce que les aménagements ont de spécifiques",
              )
              .required(),
          then: (schema) => schema.notRequired(),
        }),
    }),
  prestationsHotelieres: yup.array().when([], {
    is: () => isBrouillon,
    otherwise: (schema) => schema.required(),
    then: (schema) => schema.notRequired(),
  }),
  rangementIndividuel: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si des rangements individuels sont à disposition",
      ),
    then: (schema) => schema.notRequired(),
  }),
  reglementationErp: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si vous le local est soumis à la réglementation ERP (établissement recevant du public)",
      ),
    then: (schema) => schema.notRequired(),
  }),
  type: yup.string().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required("Il est impératif de renseigner le type d'hébergement)"),
    then: (schema) => schema.notRequired(),
  }),
  visiteLocaux: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si vous avez visité les locaux)",
      ),
    then: (schema) => schema.notRequired(),
  }),
  visiteLocauxAt: yup
    .date()
    .typeError("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .typeError("date invalide")
    .test(
      "max-today",
      "La date doit être inférieure ou égale à la date du jour.",
      (value) => !value || value <= new Date(),
    )
    .nullable(),
});

const informationsTransportSchema = (
  isBrouillon = false,
): Record<string, yup.AnySchema> => ({
  deplacementProximite: yup.string().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema
        .min(
          1,
          "Il est impératif de préciser le mode de transport utilisé pour les déplacements à proximité",
        )
        .required(),
    then: (schema) => schema.notRequired(),
  }),
  excursion: yup.string().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema
        .min(
          1,
          "Il est impératif de préciser le mode de transport utilisé pour les excursions",
        )
        .required(),
    then: (schema) => schema.notRequired(),
  }),
  vehiculesAdaptes: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si les véhicules sont adaptés",
      ),
    then: (schema) => schema.notRequired(),
  }),
});

const uniteDataSchema = (
  isBrouillon = false,
): Record<string, yup.AnySchema> => ({
  accessibilitePmr: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required("Le choix d'un niveau d'accessibilté est obligatoire"),
    then: (schema) => schema.notRequired(),
  }),
  accessibilitePrecision: yup.string().nullable(),
  amenagementsSpecifiques: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si les aménagements spécifiques",
      ),
    then: (schema) => schema.notRequired(),
  }),
  amenagementsSpecifiquesPrecision: yup
    .string()
    .nullable()
    .when("amenagementsSpecifiques", {
      is: (amenagementsSpecifiques: boolean | null | undefined) =>
        !!amenagementsSpecifiques,
      otherwise: (schema) => schema.nullable().strip(),
      then: (schema) =>
        schema.when([], {
          is: () => isBrouillon,
          otherwise: (schema) =>
            schema
              .min(
                1,
                "Il est impératif de préciser ce que les aménagements ont de spécifiques",
              )
              .required(),
          then: (schema) => schema.notRequired(),
        }),
    }),
  chambresDoubles: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si les couples sont dans des chambres séparés",
      ),
    then: (schema) => schema.notRequired(),
  }),
  couchageIndividuel: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner l'individualité des couchages",
      ),
    then: (schema) => schema.notRequired(),
  }),
  deplacementProximiteDescription: yup.string().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema
        .min(
          1,
          "Il est impératif de préciser le mode de transport utilisé pour les déplacements à proximité",
        )
        .required(),
    then: (schema) => schema.notRequired().nullable(),
  }),
  excursionDescription: yup.string().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema
        .min(
          1,
          "Il est impératif de préciser le mode de transport utilisé pour les excursions",
        )
        .required(),
    then: (schema) => schema.notRequired().nullable(),
  }),
  fileDernierArreteAutorisationMaire: yup
    .string()
    .nullable()
    .when("reglementationErp", {
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
  fileDerniereAttestationSecurite: yup
    .string()
    .nullable()
    .when("reglementationErp", {
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
  fileReponseExploitantOuProprietaire: yup
    .string()
    .nullable()
    .when("reglementationErp", {
      is: false,
      otherwise: (schema) => schema.nullable().strip(),
      then: (schema) =>
        schema.when([], {
          is: () => isBrouillon,
          otherwise: (schema) =>
            schema.required(
              "Il est impératif de télécharger la réponse de l'exploitant ou du propriétaire",
            ),
          then: (schema) => schema.notRequired(),
        }),
    }),
  litsSuperposes: yup.boolean().nullable(),
  nombreCouchageTotal: yup.number().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner le nombre de couchages total",
      ),
    then: (schema) => schema.notRequired().nullable(),
  }),
  rangementIndividuel: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si des rangements individuels sont à disposition",
      ),
    then: (schema) => schema.notRequired(),
  }),
  reglementationErp: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si vous le local est soumis à la réglementation ERP (établissement recevant du public)",
      ),
    then: (schema) => schema.notRequired(),
  }),
  separationHommeFemme: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si les chambres sont unisexes",
      ),
    then: (schema) => schema.notRequired(),
  }),
  vehiculesAdaptes: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si les véhicules sont adaptés",
      ),
    then: (schema) => schema.notRequired(),
  }),
  visiteLocaux: yup.boolean().when([], {
    is: () => isBrouillon,
    otherwise: (schema) =>
      schema.required(
        "Il est impératif de renseigner si vous avez visité les locaux)",
      ),
    then: (schema) => schema.notRequired(),
  }),
  visiteLocauxAt: yup
    .date()
    .typeError("Vous devez saisir une date valide au format JJ/MM/AAAA")
    .typeError("date invalide")
    .test(
      "max-today",
      "La date doit être inférieure ou égale à la date du jour.",
      (value) => !value || value <= new Date(),
    )
    .nullable(),
});

const optionalOrRequiredObject = (
  isBrouillon: boolean,
): ((
  schema: yup.ObjectSchema<Record<string, yup.AnySchema>>,
) => yup.AnySchema) => {
  return isBrouillon
    ? (schema) => schema.default({})
    : (schema) => schema.required();
};

export const legacyHebergementBodySchema = (
  isBrouillon = false,
): Record<string, yup.AnySchema> => {
  const optionalOrRequired = optionalOrRequiredObject(isBrouillon);
  return {
    coordonnees: optionalOrRequired(yup.object(coordonneesSchema(isBrouillon))),
    informationsLocaux: optionalOrRequired(
      yup.object(informationsLocauxSchema(isBrouillon)),
    ),
    informationsTransport: optionalOrRequired(
      yup.object(informationsTransportSchema(isBrouillon)),
    ),
    nom: yup.string().required(),
  };
};

export const uniteHebergementBodySchema = (
  isBrouillon = false,
): Record<string, yup.AnySchema> => {
  const optionalOrRequired = optionalOrRequiredObject(isBrouillon);
  return {
    coordonnees: optionalOrRequired(yup.object(coordonneesSchema(isBrouillon))),
    nom: yup.string().required(),
    uniteData: yup
      .object(uniteDataSchema(isBrouillon))
      .test(
        "unite-data-present",
        "Il est impératif de renseigner les informations de l'unité d'hébergement",
        (value) => value !== undefined && value !== null,
      ),
  };
};

export const uniteHebergementBodyObjectSchema = (
  isBrouillon = false,
): yup.ObjectSchema<Record<string, yup.AnySchema>> =>
  yup
    .object(uniteHebergementBodySchema(isBrouillon))
    .test(
      "unite-data-required",
      "Il est impératif de renseigner les informations de l'unité d'hébergement",
      function () {
        const original = this.originalValue as
          | Record<string, unknown>
          | undefined;
        return original === undefined || "uniteData" in original;
      },
    ) as unknown as yup.ObjectSchema<Record<string, yup.AnySchema>>;
