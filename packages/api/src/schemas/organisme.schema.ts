import { z } from "zod";

export const OrganismeSchema = z.object({
  id: z.string(),
});

export type Organisme = z.infer<typeof OrganismeSchema>;
