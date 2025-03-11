import { z } from "zod";

export const UUIDSchema = z.string().uuid();
