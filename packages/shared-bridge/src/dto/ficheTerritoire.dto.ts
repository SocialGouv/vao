export interface FicheTerritoireDto {
  id: number;
  ter_code: string;
  service_mail: string | null;
  service_telephone: string | null;
  service_vao_nom: string | null;
  service_vao_prenom: string | null;
  editedAt: Date | null;
}
