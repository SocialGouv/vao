import type {
  HebergementDto,
  InformationsLocauxDto,
  SiteOrganismeDto,
  UniteHebergementDto,
  UniteHebergementWriteData,
  UsagerHebergementBodyUniteDto,
} from "@vao/shared-bridge";

export type { UniteHebergementWriteData } from "@vao/shared-bridge";

export type LegacyHebergementPayload = Pick<
  HebergementDto,
  "coordonnees" | "informationsLocaux" | "informationsTransport" | "nom"
>;

const uniteDateToLegacy = (value: string | Date | null): Date | null => {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
};

export const uniteToLegacyPayload = (
  body: UsagerHebergementBodyUniteDto,
): LegacyHebergementPayload => {
  const uniteData = body.uniteData;
  return {
    coordonnees: body.coordonnees,
    informationsLocaux: {
      accessibilite:
        uniteData.accessibilitePmr == null
          ? null
          : uniteData.accessibilitePmr
            ? "accessible"
            : "non_adapte",
      accessibilitePrecision: uniteData.accessibilitePrecision ?? null,
      amenagementsSpecifiques: uniteData.amenagementsSpecifiques ?? null,
      chambresDoubles: uniteData.chambresDoubles ?? null,
      chambresUnisexes: uniteData.separationHommeFemme ?? null,
      couchageIndividuel: uniteData.couchageIndividuel ?? null,
      descriptionLieuHebergement: null,
      fileDernierArreteAutorisationMaire:
        uniteData.fileDernierArreteAutorisationMaire
          ? { uuid: uniteData.fileDernierArreteAutorisationMaire }
          : null,
      fileDerniereAttestationSecurite: uniteData.fileDerniereAttestationSecurite
        ? { uuid: uniteData.fileDerniereAttestationSecurite }
        : null,
      fileReponseExploitantOuProprietaire:
        uniteData.fileReponseExploitantOuProprietaire
          ? { uuid: uniteData.fileReponseExploitantOuProprietaire }
          : null,
      litsDessus: null,
      nombreLits: uniteData.nombreCouchageTotal ?? null,
      nombreLitsSuperposes:
        uniteData.litsSuperposes == null
          ? null
          : uniteData.litsSuperposes
            ? 1
            : 0,
      nombreMaxPersonnesCouchage: uniteData.nombreCouchageTotal ?? null,
      pension: null,
      precisionAmenagementsSpecifiques:
        uniteData.amenagementsSpecifiquesPrecision ?? null,
      prestationsHotelieres: [],
      rangementIndividuel: uniteData.rangementIndividuel ?? null,
      reglementationErp: uniteData.reglementationErp ?? null,
      type: null,
      visiteLocaux: uniteData.visiteLocaux ?? null,
      visiteLocauxAt: uniteDateToLegacy(uniteData.visiteLocauxAt),
    },
    informationsTransport: {
      deplacementProximite: null,
      excursion: null,
      vehiculesAdaptes: null,
    },
    nom: body.nom,
  };
};

const fileUuid = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "uuid" in value) {
    return (value as { uuid?: unknown }).uuid as string;
  }
  return null;
};

const accessibilitePmrToBoolean = (
  accessibilite: string | null,
): boolean | null => {
  if (!accessibilite) return null;
  return accessibilite === "accessible";
};

const toDate = (value: string | Date | null): Date | null => {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
};

export const mapLocauxToUnite = (
  informationsLocaux: InformationsLocauxDto,
  nombreCouchageTotal: number | null = null,
): UniteHebergementWriteData => {
  return {
    accessibilitePmr: accessibilitePmrToBoolean(
      informationsLocaux.accessibilite,
    ),
    accessibilitePrecision: informationsLocaux.accessibilitePrecision ?? null,
    amenagementsSpecifiques: informationsLocaux.amenagementsSpecifiques ?? null,
    amenagementsSpecifiquesPrecision:
      informationsLocaux.precisionAmenagementsSpecifiques ?? null,
    chambresDoubles: informationsLocaux.chambresDoubles ?? null,
    couchageIndividuel: informationsLocaux.couchageIndividuel ?? null,
    fileDernierArreteAutorisationMaire: fileUuid(
      informationsLocaux.fileDernierArreteAutorisationMaire,
    ),
    fileDerniereAttestationSecurite: fileUuid(
      informationsLocaux.fileDerniereAttestationSecurite,
    ),
    fileReponseExploitantOuProprietaire: fileUuid(
      informationsLocaux.fileReponseExploitantOuProprietaire,
    ),
    litsSuperposes:
      informationsLocaux.nombreLitsSuperposes == null
        ? null
        : informationsLocaux.nombreLitsSuperposes > 0,
    nombreCouchageTotal:
      nombreCouchageTotal ??
      informationsLocaux.nombreMaxPersonnesCouchage ??
      null,
    rangementIndividuel: informationsLocaux.rangementIndividuel ?? null,
    reglementationErp: informationsLocaux.reglementationErp ?? null,
    separationHommeFemme: informationsLocaux.chambresUnisexes ?? null,
    statutId: null,
    visiteLocaux: informationsLocaux.visiteLocaux ?? null,
    visiteLocauxAt: toDate(informationsLocaux.visiteLocauxAt),
  };
};

export const buildUniteWriteData = ({
  informationsLocaux,
  nombreCouchageTotal = null,
}: {
  informationsLocaux: InformationsLocauxDto;
  nombreCouchageTotal?: number | null;
}): UniteHebergementWriteData => {
  return mapLocauxToUnite(informationsLocaux, nombreCouchageTotal);
};

const majorityToAccessibilite = (
  accessibilitePmr: boolean | null,
): string | null => {
  if (accessibilitePmr == null) return null;
  return accessibilitePmr ? "accessible" : "non_adapte";
};

const booleanToLitsSuperposes = (
  litsSuperposes: boolean | null,
): number | null => {
  if (litsSuperposes == null) return null;
  return litsSuperposes ? 1 : 0;
};

export const applyUniteToHebergement = (
  hebergement: HebergementDto,
  unite: UniteHebergementDto,
): HebergementDto => {
  const legacyLocaux = hebergement.informationsLocaux;
  const accessibilite =
    unite.accessibilitePmr == null
      ? legacyLocaux.accessibilite
      : majorityToAccessibilite(unite.accessibilitePmr);
  const nombreLitsSuperposes =
    unite.litsSuperposes == null
      ? legacyLocaux.nombreLitsSuperposes
      : booleanToLitsSuperposes(unite.litsSuperposes);
  return {
    ...hebergement,
    informationsLocaux: {
      ...legacyLocaux,
      accessibilite,
      accessibilitePrecision:
        unite.accessibilitePrecision ?? legacyLocaux.accessibilitePrecision,
      amenagementsSpecifiques:
        unite.amenagementsSpecifiques ?? legacyLocaux.amenagementsSpecifiques,
      chambresDoubles: unite.chambresDoubles ?? legacyLocaux.chambresDoubles,
      chambresUnisexes:
        unite.separationHommeFemme ?? legacyLocaux.chambresUnisexes,
      couchageIndividuel:
        unite.couchageIndividuel ?? legacyLocaux.couchageIndividuel,
      fileDernierArreteAutorisationMaire:
        unite.fileDernierArreteAutorisationMaire ??
        legacyLocaux.fileDernierArreteAutorisationMaire,
      fileDerniereAttestationSecurite:
        unite.fileDerniereAttestationSecurite ??
        legacyLocaux.fileDerniereAttestationSecurite,
      fileReponseExploitantOuProprietaire:
        unite.fileReponseExploitantOuProprietaire ??
        legacyLocaux.fileReponseExploitantOuProprietaire,
      nombreLitsSuperposes,
      precisionAmenagementsSpecifiques:
        unite.amenagementsSpecifiquesPrecision ??
        legacyLocaux.precisionAmenagementsSpecifiques,
      rangementIndividuel:
        unite.rangementIndividuel ?? legacyLocaux.rangementIndividuel,
      reglementationErp:
        unite.reglementationErp ?? legacyLocaux.reglementationErp,
      visiteLocaux: unite.visiteLocaux ?? legacyLocaux.visiteLocaux,
      visiteLocauxAt: unite.visiteLocauxAt ?? legacyLocaux.visiteLocauxAt,
    },
    siteId: unite.siteId,
  };
};

export const applySiteOrganismeToHebergement = (
  hebergement: HebergementDto,
  siteOrganisme: SiteOrganismeDto,
): HebergementDto => {
  return {
    ...hebergement,
    informationsTransport: {
      ...hebergement.informationsTransport,
      deplacementProximite:
        siteOrganisme.deplacementProximiteDescription ??
        hebergement.informationsTransport.deplacementProximite,
      excursion:
        siteOrganisme.excursionDescription ??
        hebergement.informationsTransport.excursion,
      vehiculesAdaptes:
        siteOrganisme.vehiculesAdaptes ??
        hebergement.informationsTransport.vehiculesAdaptes,
    },
  };
};
