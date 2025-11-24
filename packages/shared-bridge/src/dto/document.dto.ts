import { FILE_CATEGORY } from "../constantes/file";

export interface DocumentDto {
  file: File;
  category: FILE_CATEGORY;
}
export interface DocumentDtoOptional {
  file?: File | null;
  category?: FILE_CATEGORY | null;
}
