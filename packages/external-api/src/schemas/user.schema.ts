import { z } from "zod";

export const UserSchema = z.object({
  apiToken: z.string(),
  email: z.string().email(),
  expiresAt: z.date(),
  id: z.number(),
});

export type User = z.infer<typeof UserSchema>;
