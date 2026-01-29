export interface EtablissementDto {
  siret: string | null;
  denomination: string | null;
  adresse?: string | null;
  codePostal?: string | null;
  commune: string | null;
  etatAdministratif: string | null;
  enabled: boolean | null;
}
