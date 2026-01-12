import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import { AGREMENT_STATUT } from "../../../constantes/agrement";
import { FILE_CATEGORY } from "../../../constantes/file";
import type { AgrementDto } from "../../../dto";

export interface PostAgrementRoute extends BasicRoute {
  method: "POST";
  path: "/agrements/";
  body: AgrementDto;
  response: RouteResponseBody<{ id: number | null }>;
}

const requiredUnlessBrouillon = (field: yup.AnySchema) =>
  field.when("statut", {
    is: (val: string) => val !== AGREMENT_STATUT.BROUILLON,
    otherwise: (schema) => schema.nullable(),
    then: (schema) => schema.required("Champ obligatoire"),
  });

const currentYear = new Date().getFullYear();

const adresseSchema = yup.object({
  cleInsee: yup.string().nullable(),
  codeInsee: yup.string().nullable(),
  codePostal: yup.string().nullable(),
  coordinates: yup.array(yup.number().nullable()),
  departement: yup.string().nullable(),
  id: yup.number().nullable(),
  label: yup.string().nullable(),
});
export const PostAgrementRouteSchema: RouteSchema<PostAgrementRoute> = {
  body: yup.object({
    accompRespAttestHono: requiredUnlessBrouillon(yup.boolean().nullable()),
    accompRespCompExp: requiredUnlessBrouillon(yup.string().nullable()),
    accompRespNb: requiredUnlessBrouillon(yup.number().nullable()),
    accompRespRecruteUrg: requiredUnlessBrouillon(yup.string().nullable()),
    agrementAnimation: requiredUnlessBrouillon(
      yup
        .array(
          yup.object({
            activiteId: requiredUnlessBrouillon(yup.number().nullable()),
          }),
        )
        .nullable(),
    ),
    agrementBilanAnnuel: requiredUnlessBrouillon(
      yup
        .array()
        .of(
          yup.object({
            annee: requiredUnlessBrouillon(
              yup
                .number()
                .typeError("L'année doit être un nombre")
                .integer("L'année doit être un entier")
                .min(
                  currentYear - 5,
                  `L'année ne doit pas être antérieure à ${currentYear - 5}`,
                )
                .max(
                  currentYear,
                  `L'année ne doit pas être ultérieure à ${currentYear}`,
                )
                .nullable(),
            ),

            // ✅ Correction ici : tableau d’objets
            bilanHebergement: requiredUnlessBrouillon(
              yup
                .array()
                .of(
                  yup.object({
                    adresse: requiredUnlessBrouillon(adresseSchema),
                    agrBilanAnnuelId: yup.number().nullable(),
                    mois: requiredUnlessBrouillon(
                      yup.array(yup.number()).nullable(),
                    ),
                    nbJours: requiredUnlessBrouillon(yup.number().nullable()),
                    nomHebergement: requiredUnlessBrouillon(
                      yup.string().nullable(),
                    ),
                  }),
                )
                .nullable(),
            ),

            nbFemmes: requiredUnlessBrouillon(yup.number().nullable()),
            nbGlobalVacanciers: requiredUnlessBrouillon(
              yup.number().nullable(),
            ),
            nbHommes: requiredUnlessBrouillon(yup.number().nullable()),
            nbTotalJoursVacances: requiredUnlessBrouillon(
              yup.number().nullable(),
            ),
            trancheAge: requiredUnlessBrouillon(
              yup.array(yup.string()).nullable(),
            ),
            typeHandicap: requiredUnlessBrouillon(
              yup.array(yup.string()).nullable(),
            ),
          }),
        )
        .nullable(),
    ),
    agrementFiles: requiredUnlessBrouillon(
      yup
        .array(
          yup.object({
            category: requiredUnlessBrouillon(
              yup
                .mixed<FILE_CATEGORY>()
                .oneOf(Object.values(FILE_CATEGORY))
                .nullable(),
            ),
            fileUuid: requiredUnlessBrouillon(yup.string().uuid().nullable()),
          }),
        )
        .nullable(),
    ),
    agrementSejours: requiredUnlessBrouillon(
      yup
        .array(
          yup.object({
            //adresseId: requiredUnlessBrouillon(yup.number().nullable()),
            adresse: requiredUnlessBrouillon(adresseSchema),
            mois: requiredUnlessBrouillon(
              yup
                .array()
                .of(
                  yup
                    .number()
                    .typeError("Chaque mois doit être un nombre")
                    .min(1, "Le mois doit être ≥ 1")
                    .max(12, "Le mois doit être ≤ 12"),
                )
                .nullable(),
            ),
            nbVacanciers: requiredUnlessBrouillon(yup.number().nullable()),
            nomHebergement: requiredUnlessBrouillon(yup.string().nullable()),
          }),
        )
        .nullable(),
    ),
    animationAutre: requiredUnlessBrouillon(yup.string().nullable()),
    bilanAucunChangementEvolution: requiredUnlessBrouillon(
      yup.boolean().nullable(),
    ),
    bilanChangementEvolution: requiredUnlessBrouillon(yup.string().nullable()),
    bilanFinancierCommentaire: requiredUnlessBrouillon(yup.string().nullable()),
    bilanFinancierComparatif: requiredUnlessBrouillon(yup.string().nullable()),
    bilanFinancierComptabilite: requiredUnlessBrouillon(
      yup.string().nullable(),
    ),
    bilanFinancierRessourcesHumaines: requiredUnlessBrouillon(
      yup.string().nullable(),
    ),
    bilanQualElementsMarquants: requiredUnlessBrouillon(
      yup.string().nullable(),
    ),
    bilanQualPerceptionSensibilite: requiredUnlessBrouillon(
      yup.string().nullable(),
    ),
    bilanQualPerspectiveEvol: requiredUnlessBrouillon(yup.string().nullable()),
    budgetComplement: requiredUnlessBrouillon(yup.string().nullable()),
    budgetGestionPerso: requiredUnlessBrouillon(yup.string().nullable()),
    budgetPaiementSecurise: requiredUnlessBrouillon(yup.string().nullable()),
    budgetPersoGestionComplementaire: requiredUnlessBrouillon(
      yup.string().nullable(),
    ),
    commentaire: requiredUnlessBrouillon(yup.string().nullable()),

    dateConfirmCompletude: requiredUnlessBrouillon(yup.date().nullable()),
    dateDepot: requiredUnlessBrouillon(yup.date().nullable()),
    dateObtentionCertificat: requiredUnlessBrouillon(yup.date().nullable()),
    dateVerifCompleture: requiredUnlessBrouillon(yup.date().nullable()),
    id: requiredUnlessBrouillon(yup.number().nullable()),
    immatriculation: requiredUnlessBrouillon(yup.string().nullable()),
    motivations: requiredUnlessBrouillon(yup.string().nullable()),
    organismeId: requiredUnlessBrouillon(yup.number().required()),
    protocoleEvacUrg: requiredUnlessBrouillon(yup.string().nullable()),
    protocoleInfoFamille: requiredUnlessBrouillon(yup.string().nullable()),
    protocoleMateriel: requiredUnlessBrouillon(yup.string().nullable()),
    protocoleRapatEtranger: requiredUnlessBrouillon(yup.string().nullable()),
    protocoleRapatUrg: requiredUnlessBrouillon(yup.string().nullable()),
    protocoleRemboursement: requiredUnlessBrouillon(yup.string().nullable()),
    sejourCommentaire: requiredUnlessBrouillon(yup.string().nullable()),
    sejourNbEnvisage: requiredUnlessBrouillon(yup.number().nullable()),
    statut: yup
      .mixed<AGREMENT_STATUT>()
      .oneOf(Object.values(AGREMENT_STATUT))
      .required(),
    suiviMedAccordSejour: requiredUnlessBrouillon(yup.string().nullable()),
    suiviMedDistribution: requiredUnlessBrouillon(yup.string().nullable()),
    transportAllerRetour: requiredUnlessBrouillon(yup.string().nullable()),
    transportSejour: requiredUnlessBrouillon(yup.string().nullable()),
    updatedAt: requiredUnlessBrouillon(yup.date().nullable()),
    vacanciersNbEnvisage: requiredUnlessBrouillon(yup.number().nullable()),
  }) as yup.ObjectSchema<AgrementDto>,
};
