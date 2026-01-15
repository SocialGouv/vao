import type { FicheTerritoireDto } from "./ficheTerritoire.dto";

export interface TerritoireDto {
  id: number;
  code: string;
  parentCode: string | null;
  label: string;
  ficheTerritoire: FicheTerritoireDto;
}
