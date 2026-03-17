import type { FicheTerritoireDto } from "./ficheTerritoire.dto";

export interface TerritoireDto extends FicheTerritoireDto {
  id: number;
  code: string;
  parentCode: string | null;
  label: string;
}
