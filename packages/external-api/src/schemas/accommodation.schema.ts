import { createZodDto } from "nestjs-zod";
import { z } from "zod";

import { AddressSchema } from "./address.schema";
import { HotelServicesSchema } from "./hotelService.schema";
import { OrganismSchema } from "./organism.schema";

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

const AccommodationInfoSchema = z
  .object({
    accessibility: z.enum(["accessible", "non_adapte", "commentaires"]), // accessibilite
    accessibilityDetails: z.string().nullable().optional(), // accessibilitePrecision
    accommodationDescription: z.string().min(1), // descriptionLieuHebergement
    accommodationType: z.enum(accommodationType), // pension
    bunkBeds: z.boolean(), // litsDessus
    doubleRooms: z.boolean(), // chambresDoubles
    erpRegulations: z.boolean(), // reglementationErp
    hotelServices: HotelServicesSchema, // prestationsHotelieres
    individualBeds: z.boolean(), // couchageIndividuel
    individualStorage: z.boolean(), // rangementIndividuel
    lastMayorAuthorizationFile: z.string().uuid().nullable().optional(), // fileDernierArreteAutorisationMaire
    lastSafetyCertificateFile: z.string().uuid().nullable().optional(), // fileDerniereAttestationSecurite
    localInspection: z.boolean(), // visiteLocaux
    localInspectionDate: z
      .string()
      .datetime()
      .nullable()
      .optional()
      .default("2024-01-01T00:00:00Z"), // visiteLocauxAt
    maxSleepingCapacity: z.number().min(1), // nombreMaxPersonnesCouchage
    numberOfBeds: z.number(), // nombreLits
    numberOfBunkBeds: z.number().nullable().optional(), // nombreLitsSuperposes
    responseFromOwnerOrOperatorFile: z.string().uuid(), // fileReponseExploitantOuProprietaire
    singleSexRooms: z.boolean(), // chambresUnisexes
    specificAdaptations: z.boolean(), // amenagementsSpecifiques
    specificAdaptationsDetails: z.string().nullable().optional(), // precisionAmenagementsSpecifiques
    type: z.enum(type),
  })
  .refine(
    (val) =>
      !val.localInspection ||
      (val.localInspectionDate &&
        new Date(val.localInspectionDate) <= new Date()),
    {
      message:
        "If `localInspection` is set to `true`, `localInspectionDate` needs to be set and should be earlier than today.",
      path: ["localInspectionDate"],
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
      path: ["specificAdaptationsDetails"],
    },
  )
  .refine(
    (val) =>
      val.accessibility !== "commentaires" ||
      (val.accessibilityDetails && val.accessibilityDetails.trim().length > 0),
    {
      message:
        "If `accessibility` is set to `commentaires`, `accessibilityDetails` needs to be filled.",
      path: ["accessibilityDetails"],
    },
  )
  .refine(
    (val) => val.numberOfBunkBeds === 0 || typeof val.bunkBeds === "boolean",
    {
      message:
        "If `numberOfBunkBeds` is greater than 0, `bunkBeds` needs to be true or false.",
      path: ["bunkBeds"],
    },
  )
  .refine(
    (val) => val.lastMayorAuthorizationFile || val.lastSafetyCertificateFile,
    {
      message: "At least one attestation must be provided",
      path: ["lastMayorAuthorizationFile", "lastSafetyCertificateFile"],
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

export const CreateAccommodationDtoSchema = z.object({
  accommodationInfo: AccommodationInfoSchema, // informationsLocaux
  coordinates: CoordinatesDtoSchema,
  name: z.string(), // nom
  transportInfo: TransportInfoSchema, // informationsTransport
});

export class CreateAccommodationDto extends createZodDto(
  CreateAccommodationDtoSchema,
) {}

export const AccommodationSchema = z.object({
  accommodationInfo: AccommodationInfoSchema,
  // informationsLocaux
  coordinates: CoordinatesDtoSchema.merge(
    z.object({
      address: AddressSchema,
    }),
  ),

  createdAt: z.string().datetime(),
  editedAt: z.string().datetime(),
  id: z.number(),
  name: z.string(),
  // nom
  transportInfo: TransportInfoSchema,
});

export const CreateAccommodationSchema = AccommodationSchema.omit({
  coordinates: true,
  createdAt: true,
  editedAt: true,
  id: true,
}).merge(
  z.object({
    coordinates: CoordinatesDtoSchema.omit({ address: true }).merge(
      z.object({ addressId: z.number() }),
    ),
  }),
);

export type CreateAccommodation = z.infer<typeof CreateAccommodationSchema>;
export type Accommodation = z.infer<typeof AccommodationSchema>;

export class CreateAccommodationResult extends createZodDto(
  AccommodationSchema,
) {}

export const DeleteAccommodationCheckSchema = z.object({
  deleted: z.boolean(),
  organismId: OrganismSchema.shape.id,
  statusId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export type DeleteAccommodationCheck = z.infer<
  typeof DeleteAccommodationCheckSchema
>;
