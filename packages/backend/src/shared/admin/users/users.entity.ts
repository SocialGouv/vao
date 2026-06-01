export interface UserAdminEntity {
  id: string;
  cgu_at: boolean | null;
  validated: boolean | null;
  deleted: boolean | null;
  mail: string;
  prenom: string;
  nom: string;
  pwd: string;
  enddate: Date | null;
  created_at: Date;
  edited_at: Date | null;
  blocked: boolean | null;
  ter_code: string;
  deleted_use_id: number | null;
  deleted_date: Date | null;
  validated_at: Date | null;
  lastconnection_at: Date | null;
  cgu_accepted_at: Date | null;
  cgu_accepted: boolean;
  otp_code: number | null;
  otp_code_expires_at: Date | null;
}
