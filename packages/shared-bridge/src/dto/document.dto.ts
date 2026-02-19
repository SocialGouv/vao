import { FILE_CATEGORY } from "../constantes/file";

export interface DocumentDto {
  name: string;
  file: File;
  category: FILE_CATEGORY;
  uuid?: string | null;
  createdAt?: Date | null;
}
export interface DocumentDtoOptional {
  file?: File | null;
  category?: FILE_CATEGORY | null;
}
