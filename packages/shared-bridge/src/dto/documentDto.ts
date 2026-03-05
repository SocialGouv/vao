export interface DocumentDto {
  uuid: string;
  category: string;
  filename: string;
  mimeType: string;
  userId: string | number;
  file: Buffer;
}

export interface FileMetaDataDto {
  uuid: string;
  name: string;
  userId: string | number;
  createdAt: Date;
}
