import { z } from "zod";

export const OrganismSchema = z.object({
  id: z.number(),
});

export type Organism = z.infer<typeof OrganismSchema>;
