import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const phoneNumberRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;
const type = [
  "hotel",
  "meuble_tourisme",
  "residence_tourisme",
  "camping",
  "autre",
] as const;
const accommodationType = [
  "hebergement_seul",
  "petit_dejeuner",
  "demi_pension",
  "pension_complete",
] as const;

const AccomodationInfoSchema = z
  .object({
    accessibility: z.enum(["accessible", "non_adapte", "commentaires"]), // accessibilite
    accessibilityDetails: z.string().nullable().optional(), // accessibilitePrecision
    accommodationDescription: z.string().min(1), // descriptionLieuHebergement
    accommodationType: z.enum(accommodationType), // pension
    bunkBeds: z.boolean(), // litsDessus
    doubleRooms: z.boolean(), // chambresDoubles
    erpRegulations: z.boolean(), // reglementationErp
    hotelServices: z.array(z.enum(["blanchisseries", "entretien_locaux"])), // prestationsHotelieres
    individualBeds: z.boolean(), // couchageIndividuel
    individualStorage: z.boolean(), // rangementIndividuel
    localInspection: z.boolean(), // visiteLocaux
    // responseFromOwnerOrOperatorFile: null,
    localInspectionDate: z
      .string()
      .date()
      .nullable()
      .optional()
      .default("2024-01-01"), // visiteLocauxAt
    maxSleepingCapacity: z.number().min(1), // nombreMaxPersonnesCouchage
    numberOfBeds: z.number(), // nombreLits
    numberOfBunkBeds: z.number().nullable().optional(), // nombreLitsSuperposes
    singleSexRooms: z.boolean(), // chambresUnisexes
    specificAdaptations: z.boolean(), // amenagementsSpecifiques
    // lastMayorAuthorizationFile: null,
    // lastSafetyCertificateFile: null
    specificAdaptationsDetails: z.string().nullable().optional(), // precisionAmenagementsSpecifiques
    type: z.enum(type),
  })
  .required()
  .refine(
    (val) =>
      !val.localInspection ||
      (val.localInspectionDate &&
        new Date(val.localInspectionDate) <= new Date()),
    {
      message:
        "If `localInspection` is set to `true`, `localInspectionDate` needs to be set and should be earlier than today.",
      path: ["accommodationInfo.localInspectionDate"],
    },
  )
  .refine(
    (val) =>
      !val.specificAdaptations ||
      (val.specificAdaptationsDetails &&
        val.specificAdaptationsDetails.trim().length > 0),
    {
      message:
        "If `specificAdaptations` is set to `true`, `specificAdaptationsDetails` needs to be filled.",
      path: ["accommodationInfo.specificAdaptationsDetails"],
    },
  )
  .refine(
    (val) =>
      val.accessibility !== "commentaires" ||
      (val.accessibilityDetails && val.accessibilityDetails.trim().length > 0),
    {
      message:
        "If `accessibility` is set to `commentaires`, `accessibilityDetails` needs to be filled.",
      path: ["accommodationInfo.accessibilityDetails"],
    },
  )
  .refine(
    (val) => val.numberOfBunkBeds === 0 || typeof val.bunkBeds === "boolean",
    {
      message:
        "If `numberOfBunkBeds` is greater than 0, `bunkBeds` needs to be true or false.",
      path: ["accommodationInfo.bunkBeds"],
    },
  );

const CoordinatesDtoSchema = z.object({
  address: z.string(), // adresse
  email: z.string().email(),
  managerName: z.string(), // nomGestionnaire
  phoneNumber1: z
    .string()
    .regex(phoneNumberRegex, { message: "Invalid phone number" }), // numTelephone1
  phoneNumber2: z
    .string()
    .regex(phoneNumberRegex, { message: "Invalid phone number" }), // numTelephone2
});

const TransportInfoSchema = z.object({
  adaptedVehicles: z.boolean(), // vehiculesAdaptes
  excursion: z.string().min(1),
  nearbyTravel: z.string().min(1), // deplacementProximite
});

export const CreateAccomodationDtoSchema = z.object({
  accommodationInfo: AccomodationInfoSchema, // informationsLocaux
  coordinates: CoordinatesDtoSchema,
  name: z.string(), // nom
  transportInfo: TransportInfoSchema, // informationsTransport
});

export class CreateAccomodationDto extends createZodDto(
  CreateAccomodationDtoSchema,
) {}

export const AdresseSchema = z.object({
  codeInsee: z.string().regex(/^\d{1,5}$/),
  codePostal: z.string().regex(/^\d{1,5}$/),
  coordinates: z.tuple([z.number(), z.number()]),
  departement: z.string().regex(/^\d{1,3}$/),
  label: z.string(),
});

export const AccomodationSchema = z.object({
  accommodationInfo: AccomodationInfoSchema, // informationsLocaux
  coordinates: CoordinatesDtoSchema.merge(
    z
      .object({
        address: AdresseSchema,
      })
      .required(),
  ),
  id: z.number(),
  name: z.string(), // nom
  transportInfo: TransportInfoSchema,
});

export const CreateAccomodationSchema = AccomodationSchema.omit({ id: true });

export type CreateAccomodation = z.infer<typeof CreateAccomodationSchema>;
export type Accomodation = z.infer<typeof AccomodationSchema>;

export class CreateAccomodationResult extends createZodDto(
  AccomodationSchema,
) {}
