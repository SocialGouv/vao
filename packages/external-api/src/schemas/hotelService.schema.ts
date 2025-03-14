import { z } from "zod";

const hotelServices = ["blanchisseries", "entretien_locaux"] as const;

export const HotelServicesSchema = z
  .array(z.enum(hotelServices))
  .max(hotelServices.length)
  .refine((services) => new Set(services).size === services.length, {
    message: "No duplicate values are allowed.",
  });

export type HotelsService = z.infer<typeof HotelServicesSchema>;
