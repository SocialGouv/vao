export type DocumentToMigrateRow = {
  uuid: string;
  category: string;
  filename: string;
  mime_type: string;
  user_id: number | null;
  created_at: Date;
  file: Buffer;
};

export type MigrateFilesToS3Report = {
  total: number;
  uploaded: number;
  alreadyInS3: number;
  errors: number;
  errorDetails: unknown[];
};
