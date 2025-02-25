import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const MetaDataSchema = z.object({
  category: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  userId: z.number().nullable(),
  uuid: z.string(),
});

export const CreateFileResponseSchema = z.object({
  uuid: z.string(),
});

export class CreateFileResponse extends createZodDto(
  CreateFileResponseSchema,
) {}
