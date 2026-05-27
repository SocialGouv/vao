export interface UserUsagersEntity {
  id: string;
  cgu_at: boolean | null;
  validated: boolean | null;
  deleted: boolean | null;
  mail: string;
  prenom: string;
  nom: string;
  pwd: string;
  enddate: Date | null;
  created_at: Date | null;
  edited_at: Date | null;
  blocked: boolean | null;
  deleted_use_id: number | null;
  deleted_date: Date | null;
  validated_at: Date | null;
  lastconnection_at: Date | null;
  cgu_accepted_at: Date | null;
  cgu_accepted: boolean;
  otp_code: number | null;
  otp_code_expires_at: Date | null;
}
