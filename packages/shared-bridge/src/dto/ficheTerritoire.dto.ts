export interface FicheTerritoireDto {
  id: number;
  ter_code: string;
  serviceMail: string | null;
  serviceTelephone: string | null;
  serviceVaoNom: string | null;
  serviceVaoPrenom: string | null;
  editedAt: Date | null;
}
