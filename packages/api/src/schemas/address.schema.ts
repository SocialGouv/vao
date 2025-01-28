import { z } from "zod";

export const AddressSchema = z.object({
  department: z.string(),
  id: z.number(),
  inseeCode: z.string(),
  inseeKey: z.string(),
  label: z.string(),
  lat: z.number(),
  long: z.number(),
  postalCode: z.string(),
});

export type Address = z.infer<typeof AddressSchema>;

export const SaveAddressSchema = AddressSchema.omit({ id: true });

export type SaveAddress = z.infer<typeof SaveAddressSchema>;
