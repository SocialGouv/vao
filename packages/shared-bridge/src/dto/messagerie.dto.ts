export interface GenericMessage {
  id: number;
  message: string;
  createdAt: string;
  name: string;
  isAnswer: boolean;
  file?: { name: string; uuid: string; createdAt: string } | null;
  cdnUrl?: string;
  frontUserId?: number | null;
  backUserId?: number | null;
  frontUserPrenom?: string | null;
  backUserPrenom?: string | null;
}
