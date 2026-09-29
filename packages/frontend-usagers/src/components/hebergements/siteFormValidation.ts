import { HEBERGEMENT_STATUT, type AdresseDto } from "@vao/shared-bridge";
import * as yup from "yup";

export interface SiteFormValidationValues {
  nomSiteOfficiel: string;
  nomSiteOrganisme: string;
  adresse: AdresseDto | null;
  statut?: string | null;
}

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
