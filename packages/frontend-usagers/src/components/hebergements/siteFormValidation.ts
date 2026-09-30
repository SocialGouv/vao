import { HEBERGEMENT_STATUT, type AdresseDto } from "@vao/shared-bridge";
import * as yup from "yup";

export interface SiteFormValidationValues {
  nomSiteOfficiel: string;
  nomSiteOrganisme: string;
  adresse: AdresseDto | null;
  statut?: string | null;
}

export const DESCRIPTION_MAX = 500;

export interface InformationsSiteFormValues {
  typeHebergement: string;
  description: string;
  responsable: {
    nomPrenom: string;
    telephone: string;
    email: string;
  };
}

const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;

export const buildInformationsSiteFormValidationSchema = () =>
  yup.object({
    typeHebergement: yup
      .string()
      .required("Le type d’hébergement est obligatoire."),
    description: yup
      .string()
      .max(
        DESCRIPTION_MAX,
        `La description ne doit pas dépasser ${DESCRIPTION_MAX} caractères.`,
      )
      .required("La description est obligatoire."),
    responsable: yup.object({
      nomPrenom: yup
        .string()
        .required("Le nom et prénom du responsable est obligatoire."),
      telephone: yup
        .string()
        .required("Le téléphone est obligatoire.")
        .matches(numTelephoneRegex, "Format de numéro de téléphone invalide."),
      email: yup
        .string()
        .required("L’e-mail est obligatoire.")
        .email("Format de l’adresse e-mail invalide."),
    }),
  });

const requiredUnlessBrouillon = (
  field: yup.AnySchema,
  requiredMessage: string,
) =>
  field.when("statut", {
    is: (val?: string | null) =>
      (val ?? "").trim().toUpperCase() !== HEBERGEMENT_STATUT.BROUILLON,
    otherwise: (schema) => schema.nullable(),
    then: (schema) => schema.required(requiredMessage),
  });

export const requiresAddressConfirmation = (
  adresse: { coordinates?: unknown; label?: string | null } | null | undefined,
): boolean => {
  if (!adresse) {
    return true;
  }

  return !Array.isArray(adresse.coordinates) || adresse.coordinates.length === 0;
};

export const buildSiteFormValidationSchema = (
  statut: string | null | undefined = HEBERGEMENT_STATUT.BROUILLON,
) =>
  yup.object({
    statut: yup.string().default(statut ?? HEBERGEMENT_STATUT.BROUILLON),
    nomSiteOfficiel: requiredUnlessBrouillon(
      yup
        .string()
        .max(
          120,
          "Le nom officiel du lieu ne doit pas dépasser 120 caractères. Veuillez supprimer les caractères excédentaires.",
        )
        .nullable(),
      "Le nom officiel du lieu est obligatoire. Veuillez le remplir.",
    ),
    nomSiteOrganisme: yup
      .string()
      .optional()
      .max(
        120,
        "Le nom du site de l'organisme ne doit pas dépasser 120 caractères. Veuillez supprimer les caractères excédentaires.",
      ),
    adresse: requiredUnlessBrouillon(
      yup
        .object({
          label: yup.string().nullable(),
          coordinates: yup.array(yup.number().nullable()).nullable(),
        })
        .nullable(),
      "L’adresse du lieu est obligatoire. Veuillez la remplir.",
    ),
  });
