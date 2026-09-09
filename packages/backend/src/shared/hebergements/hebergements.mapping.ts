import type {
  HebergementDto,
  InformationsLocauxDto,
  InformationsTransportDto,
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
        uniteData.fileDernierArreteAutorisationMaire ?? null,
      fileDerniereAttestationSecurite:
        uniteData.fileDerniereAttestationSecurite ?? null,
      fileReponseExploitantOuProprietaire:
        uniteData.fileReponseExploitantOuProprietaire ?? null,
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
      deplacementProximite: uniteData.deplacementProximiteDescription ?? null,
      excursion: uniteData.excursionDescription ?? null,
      vehiculesAdaptes: uniteData.vehiculesAdaptes ?? null,
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
    deplacementProximiteDescription: null,
    excursionDescription: null,
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
    vehiculesAdaptes: null,
    visiteLocaux: informationsLocaux.visiteLocaux ?? null,
    visiteLocauxAt: toDate(informationsLocaux.visiteLocauxAt),
  };
};

export const mapTransportToUnite = (
  informationsTransport: InformationsTransportDto,
): Pick<
  UniteHebergementWriteData,
  | "deplacementProximiteDescription"
  | "excursionDescription"
  | "vehiculesAdaptes"
> => {
  return {
    deplacementProximiteDescription:
      informationsTransport.deplacementProximite ?? null,
    excursionDescription: informationsTransport.excursion ?? null,
    vehiculesAdaptes: informationsTransport.vehiculesAdaptes ?? null,
  };
};

export const mergeUniteWriteData = (
  locaux: UniteHebergementWriteData,
  transport: Pick<
    UniteHebergementWriteData,
    | "deplacementProximiteDescription"
    | "excursionDescription"
    | "vehiculesAdaptes"
  >,
): UniteHebergementWriteData => {
  return {
    ...locaux,
    ...transport,
  };
};

export const buildUniteWriteData = ({
  informationsLocaux,
  informationsTransport,
  nombreCouchageTotal = null,
}: {
  informationsLocaux: InformationsLocauxDto;
  informationsTransport: InformationsTransportDto;
  nombreCouchageTotal?: number | null;
}): UniteHebergementWriteData => {
  return mergeUniteWriteData(
    mapLocauxToUnite(informationsLocaux, nombreCouchageTotal),
    mapTransportToUnite(informationsTransport),
  );
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
    informationsTransport: {
      ...hebergement.informationsTransport,
      deplacementProximite:
        unite.deplacementProximiteDescription ??
        hebergement.informationsTransport.deplacementProximite,
      excursion:
        unite.excursionDescription ??
        hebergement.informationsTransport.excursion,
      vehiculesAdaptes:
        unite.vehiculesAdaptes ??
        hebergement.informationsTransport.vehiculesAdaptes,
    },
    siteId: unite.siteId,
  };
};
