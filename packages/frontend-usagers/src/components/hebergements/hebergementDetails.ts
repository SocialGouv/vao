import type {
  FileMetaDataDto,
  UniteHebergementDto,
  UniteHebergementPayloadDto,
} from "@vao/shared-bridge";

export interface HebergementDetailValues {
  complementLocalisation: string;
  nombreCouchagesTotal: number | null;
  nombreChambresTotal: number | null;
  estErp: boolean | null;
  fileDerniereAttestationSecurite: FileMetaDataDto | string | null;
  fileDernierArreteAutorisationMaire: FileMetaDataDto | string | null;
  fileReponseNonAssujettissementErp: FileMetaDataDto | string | null;
  couchageIndividuel: boolean | null;
  litsSuperposes: boolean | null;
  rangementIndividuel: boolean | null;
  chambresUnisexes: boolean | null;
  chambresDoubles: boolean | null;
  amenagementsSpecifiques: boolean | null;
  precisionAmenagementsSpecifiques: string;
  accessibilitePmr: boolean | null;
  pension: string[];
  prestationsHotelieres: string[];
}

export const emptyHebergementDetail = (): HebergementDetailValues => ({
  complementLocalisation: "",
  nombreCouchagesTotal: null,
  nombreChambresTotal: null,
  estErp: null,
  fileDerniereAttestationSecurite: null,
  fileDernierArreteAutorisationMaire: null,
  fileReponseNonAssujettissementErp: null,
  couchageIndividuel: null,
  litsSuperposes: null,
  rangementIndividuel: null,
  chambresUnisexes: null,
  chambresDoubles: null,
  amenagementsSpecifiques: null,
  precisionAmenagementsSpecifiques: "",
  accessibilitePmr: null,
  pension: [],
  prestationsHotelieres: [],
});

export const mapUniteToHebergementDetail = (
  unite: UniteHebergementDto,
): HebergementDetailValues => ({
  complementLocalisation: unite.complementLocalisation ?? "",
  nombreCouchagesTotal: unite.nombreCouchageTotal ?? null,
  nombreChambresTotal: unite.nombreChambreTotal ?? null,
  estErp: unite.reglementationErp ?? null,
  fileDerniereAttestationSecurite: unite.fileDerniereAttestationSecurite,
  fileDernierArreteAutorisationMaire: unite.fileDernierArreteAutorisationMaire,
  fileReponseNonAssujettissementErp: unite.fileReponseExploitantOuProprietaire,
  couchageIndividuel: unite.couchageIndividuel ?? null,
  litsSuperposes: unite.litsSuperposes ?? null,
  rangementIndividuel: unite.rangementIndividuel ?? null,
  chambresUnisexes: unite.separationHommeFemme ?? null,
  chambresDoubles: unite.chambresDoubles ?? null,
  amenagementsSpecifiques: unite.amenagementsSpecifiques ?? null,
  precisionAmenagementsSpecifiques:
    unite.amenagementsSpecifiquesPrecision ?? "",
  accessibilitePmr: unite.accessibilitePmr ?? null,
  pension: unite.typePensions ?? [],
  prestationsHotelieres: unite.prestationsHotelieres ?? [],
});

const fileKeyOf = (value: FileMetaDataDto | string | null): string | null =>
  typeof value === "string" ? value : (value?.uuid ?? null);

export const mapHebergementDetailToUnitePayload = (
  detail: HebergementDetailValues,
): UniteHebergementPayloadDto => ({
  accessibilitePmr: detail.accessibilitePmr ?? null,
  accessibilitePrecision: null,
  amenagementsSpecifiques: detail.amenagementsSpecifiques ?? null,
  amenagementsSpecifiquesPrecision:
    detail.precisionAmenagementsSpecifiques || null,
  chambresDoubles: detail.chambresDoubles ?? null,
  complementLocalisation: detail.complementLocalisation || null,
  couchageIndividuel: detail.couchageIndividuel ?? null,
  fileDernierArreteAutorisationMaire: fileKeyOf(
    detail.fileDernierArreteAutorisationMaire,
  ),
  fileDerniereAttestationSecurite: fileKeyOf(
    detail.fileDerniereAttestationSecurite,
  ),
  fileReponseExploitantOuProprietaire: fileKeyOf(
    detail.fileReponseNonAssujettissementErp,
  ),
  litsSuperposes: detail.litsSuperposes ?? null,
  nombreChambreTotal: detail.nombreChambresTotal ?? null,
  nombreCouchageTotal: detail.nombreCouchagesTotal ?? null,
  rangementIndividuel: detail.rangementIndividuel ?? null,
  reglementationErp: detail.estErp ?? null,
  separationHommeFemme: detail.chambresUnisexes ?? null,
  prestationsHotelieres: detail.prestationsHotelieres ?? [],
  visiteLocaux: null,
  visiteLocauxAt: null,
});
