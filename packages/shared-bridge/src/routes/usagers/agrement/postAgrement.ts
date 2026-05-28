import * as yup from "yup";

import type { BasicRoute, RouteResponseBody, RouteSchema } from "../../..";
import { AGREMENT_STATUT } from "../../../constantes/agrement";
import { FILE_CATEGORY } from "../../../constantes/file";
import type { AgrementDto, AgrementFilesDto } from "../../../dto";

export interface PostAgrementRoute extends BasicRoute {
  method: "POST";
  path: "/agrements/";
  body: AgrementDto;
  response: RouteResponseBody<{ id: number | null }>;
}

const REQUIRED_FILE_CATEGORIES: FILE_CATEGORY[] = [
  FILE_CATEGORY.IMMATRICUL,
  FILE_CATEGORY.ASSURRESP,
  FILE_CATEGORY.ASSURRAPAT,
  FILE_CATEGORY.BILANQUALITPERCEPTION,
  FILE_CATEGORY.BILANQUALITPERSPECTIVE,
  FILE_CATEGORY.BILANQUALITELEMARQ,
  FILE_CATEGORY.PROJETSSEJOURSCOMPETENCESEXPERIENCE,
  FILE_CATEGORY.PROJETSSEJOURSMESURES,
];

const requiredUnlessBrouillon = (field: yup.AnySchema) =>
  field.when("statut", {
    is: (val: string) =>
      val !== AGREMENT_STATUT.BROUILLON && val !== AGREMENT_STATUT.VALIDE,
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
    agrementFiles: yup
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
      .nullable()
      .when("statut", {
        is: (val: string) =>
          val !== AGREMENT_STATUT.BROUILLON && val !== AGREMENT_STATUT.VALIDE,

        otherwise: (schema) => schema.nullable(),

        then: (schema) =>
          schema.test("required-file-categories", function (files) {
            if (!files) {
              return this.createError({
                message: "Des fichiers obligatoires sont manquants",
              });
            }

            const categories = files
              .map((f: Partial<AgrementFilesDto>) => f.category)
              .filter(Boolean);

            const missing = REQUIRED_FILE_CATEGORIES.filter(
              (category) => !categories.includes(category),
            );

            if (missing.length > 0) {
              return this.createError({
                message: `Catégories obligatoires manquantes : ${missing.join(", ")}`,
              });
            }

            return true;
          }),
      }),
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
    animationAutre: yup.string().nullable(),
    bilanAucunChangementEvolution: requiredUnlessBrouillon(
      yup.boolean().nullable(),
    ),
    bilanChangementEvolution: requiredUnlessBrouillon(yup.string().nullable()),
    bilanFinancierCommentaire: yup.string().nullable(),
    bilanFinancierComparatif: requiredUnlessBrouillon(yup.string().nullable()),
    bilanFinancierComptabilite: requiredUnlessBrouillon(
      yup.string().nullable(),
    ),
    bilanFinancierRessourcesHumaines: yup.string().nullable(),
    bilanQualElementsMarquants: requiredUnlessBrouillon(
      yup.string().nullable(),
    ),
    bilanQualPerceptionSensibilite: requiredUnlessBrouillon(
      yup.string().nullable(),
    ),
    bilanQualPerspectiveEvol: requiredUnlessBrouillon(yup.string().nullable()),
    budgetComplement: yup.string().nullable(),
    budgetGestionPerso: requiredUnlessBrouillon(yup.string().nullable()),
    budgetPaiementSecurise: yup.string().nullable(),
    budgetPersoGestionComplementaire: yup.string().nullable(),
    commentaire: yup.string().nullable(),
    dateConfirmCompletude: yup.date().nullable(),
    dateDepot: yup.date().nullable(),
    dateObtention: yup.date().nullable(),
    dateObtentionCertificat: requiredUnlessBrouillon(yup.date().nullable()),
    dateVerifCompleture: yup.date().nullable(),
    file: yup.mixed().nullable(),
    id: requiredUnlessBrouillon(yup.number().nullable()),
    immatriculation: yup.string().nullable(),
    motivations: requiredUnlessBrouillon(yup.string().nullable()),
    numero: yup.string().nullable(),
    organismeId: requiredUnlessBrouillon(yup.number().required()),
    protocoleEvacUrg: requiredUnlessBrouillon(yup.string().nullable()),
    protocoleInfoFamille: requiredUnlessBrouillon(yup.string().nullable()),
    protocoleMateriel: yup.string().nullable(),
    protocoleRapatEtranger: requiredUnlessBrouillon(yup.string().nullable()),
    protocoleRapatUrg: requiredUnlessBrouillon(yup.string().nullable()),
    protocoleRemboursement: yup.string().nullable(),
    regionObtention: requiredUnlessBrouillon(yup.string().nullable()),
    sejourCommentaire: yup.string().nullable(),
    sejourNbEnvisage: yup.number().nullable(),
    sejourTypeHandicap: requiredUnlessBrouillon(
      yup.array(yup.string().nullable()).nullable(),
    ),
    statut: yup
      .mixed<AGREMENT_STATUT>()
      .oneOf(Object.values(AGREMENT_STATUT))
      .required(),
    suiviMedAccordSejour: requiredUnlessBrouillon(yup.string().nullable()),
    suiviMedDistribution: requiredUnlessBrouillon(yup.string().nullable()),
    transportAllerRetour: requiredUnlessBrouillon(yup.string().nullable()),
    transportSejour: requiredUnlessBrouillon(yup.string().nullable()),
    vacanciersNbEnvisage: yup.number().nullable(),
  }) as yup.ObjectSchema<AgrementDto>,
};
