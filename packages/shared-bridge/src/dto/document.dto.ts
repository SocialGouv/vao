import { FILE_CATEGORY } from "../constantes/file";

export interface DocumentDto {
  file: File | null;
  category: FILE_CATEGORY | null;
}
