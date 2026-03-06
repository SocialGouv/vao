import { FILE_CATEGORY } from "../constantes/file";

export interface DocumentDto {
  category: FILE_CATEGORY;
  file: Buffer;
  filename: string;
  uuid?: string | null;
  createdAt?: Date | null;
  mimeType: string;
  userId: string | number;
}
export interface DocumentDtoOptional {
  file?: File | null;
  category?: FILE_CATEGORY | null;
}

export interface FileMetaDataDto {
  uuid: string;
  name: string;
  userId: string | number;
  createdAt: Date;
}
