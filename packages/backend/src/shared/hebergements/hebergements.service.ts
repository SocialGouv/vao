import {
  CheckSiteSimilaritesBody,
  FUNCTIONAL_ERRORS,
  FunctionalException,
  InformationsLocauxDto,
  SiteDto,
  SiteOrganismeDto,
  SiteSimilariteResult,
  UniteHebergementDto,
  UniteHebergementPayloadDto,
} from "@vao/shared-bridge";
import { PoolClient } from "pg";

import { getByIds as getAddresses, saveAdresse } from "../../services/adresse";
import { LegacyUniteContextEntity } from "./hebergements.entity";
import { buildUniteWriteData } from "./hebergements.mapping";
import { HebergementsRepositoryShared } from "./hebergements.repository";
import { classifySiteSimilarite } from "./hebergements.similarites";
import { SitesRepositoryShared } from "./hebergementsSite.repository";

type CreateSiteInput = Pick<
  SiteDto,
  | "adresseId"
  | "createdBy"
  | "descriptif"
  | "hebergementTypeId"
  | "nomSiteOfficiel"
  | "organismeId"
> &
  Partial<Pick<SiteDto, "adresse">> &
  Partial<
    Pick<
      SiteOrganismeDto,
      | "deplacementProximiteDescription"
      | "excursionDescription"
      | "respEmail"
      | "respNomPrenom"
      | "respTelephone"
      | "vehiculesAdaptes"
    >
  > & { hebergementTypeValue?: string | null };

type UpdateSiteInput = Omit<CreateSiteInput, "createdBy" | "adresseId"> & {
  editedBy: number;
  adresseId: number | null;
};

type CreateUniteHebergementInput = Pick<
  UniteHebergementDto,
  "id" | "hebergementId" | "organismeId" | "siteId" | "statutId"
> & {
  createdBy: number;
  informationsLocaux: InformationsLocauxDto;
  typePensions: string[];
  uniteData?: UniteHebergementPayloadDto;
};

type UpdateUniteHebergementInput = Pick<
  UniteHebergementDto,
  "id" | "hebergementId" | "statutId"
> & {
  editedBy: number;
  informationsLocaux: InformationsLocauxDto;
  typePensions: string[];
  uniteData?: UniteHebergementPayloadDto;
};

type UpdateUniteHebergementInPlaceInput = Pick<
  UniteHebergementDto,
  "statutId"
> & {
  editedBy: number;
  informationsLocaux: InformationsLocauxDto;
  typePensions: string[];
  uniteData?: UniteHebergementPayloadDto;
};

export const HebergementServiceShared = {
  async checkSiteSimilarites(
    site: CheckSiteSimilaritesBody,
  ): Promise<SiteSimilariteResult[]> {
    const siteSimilaires =
      await SitesRepositoryShared.findSiteSimilaritesCandidates({
        adresse: {
          codePostal: site.adresse?.codePostal ?? "",
          label: site.adresse?.label ?? "",
        },
        nomSiteOfficiel: site.nomSiteOfficiel ?? "",
      });

    const adresseIds = siteSimilaires
      .map(({ adresseId }) => adresseId)
      .filter((adresseId): adresseId is number => adresseId !== null);
    const adressesById = new Map(
      (await getAddresses(adresseIds)).map((adresse) => [adresse.id, adresse]),
    );

    return siteSimilaires.map((siteDetail) => {
      const adresse = siteDetail.adresseId
        ? (adressesById.get(siteDetail.adresseId) ?? null)
        : null;

      return {
        ...siteDetail,
        adresse,
        similarite: classifySiteSimilarite(
          {
            adresse: site.adresse,
            nomSiteOfficiel: site.nomSiteOfficiel,
          },
          {
            adresse,
            nomSite: siteDetail.nomSite,
            nomSiteOfficiel: siteDetail.nomSiteOfficiel,
          },
        ),
      } satisfies SiteSimilariteResult;
    });
  },

  async createSite(
    { ...input }: CreateSiteInput,
    tx: PoolClient,
  ): Promise<Pick<SiteDto, "siteId">> {
    const {
      adresse,
      adresseId,
      createdBy,
      deplacementProximiteDescription,
      descriptif,
      excursionDescription,
      hebergementTypeId,
      hebergementTypeValue,
      nomSiteOfficiel,
      organismeId,
      respEmail,
      respNomPrenom,
      respTelephone,
      vehiculesAdaptes,
    } = input;
    const resolvedAdresseId = adresse
      ? await saveAdresse(tx, adresse)
      : adresseId;
    const resolvedTypeId = hebergementTypeValue
      ? await HebergementsRepositoryShared.getHebergementTypeId(
          tx,
          hebergementTypeValue,
        )
      : hebergementTypeId;
    const siteId = await SitesRepositoryShared.create(tx, {
      adresseId: resolvedAdresseId,
      createdBy,
      descriptif,
      hebergementTypeId: resolvedTypeId,
      nomSiteOfficiel,
    });
    await SitesRepositoryShared.createSiteOrganisme(tx, {
      deplacementProximiteDescription: deplacementProximiteDescription ?? null,
      excursionDescription: excursionDescription ?? null,
      nomSite: nomSiteOfficiel,
      organismeId,
      respEmail: respEmail ?? null,
      respNomPrenom: respNomPrenom ?? null,
      respTelephone: respTelephone ?? null,
      siteId,
      vehiculesAdaptes: vehiculesAdaptes ?? null,
    });
    return { siteId };
  },

  async createUniteHebergement(
    { ...input }: CreateUniteHebergementInput,
    tx: PoolClient,
  ): Promise<Pick<UniteHebergementDto, "id">> {
    const {
      createdBy,
      hebergementId,
      id,
      informationsLocaux,
      organismeId,
      siteId,
      statutId,
      typePensions,
      uniteData,
    } = input;
    const data =
      uniteData ??
      buildUniteWriteData({
        informationsLocaux,
      });
    const uniteId = await HebergementsRepositoryShared.createUniteHebergement(
      tx,
      {
        ...data,
        createdBy,
        editedBy: createdBy,
        hebergementId,
        id,
        organismeId,
        siteId,
        statutId,
      },
    );
    await HebergementsRepositoryShared.setUniteHebergementTypePensions(
      tx,
      uniteId,
      typePensions,
    );
    return { id: uniteId };
  },

  async getLegacyUniteContext(
    hebergementId: number,
    tx: PoolClient,
  ): Promise<LegacyUniteContextEntity> {
    return HebergementsRepositoryShared.getLegacyUniteContext(
      tx,
      hebergementId,
    );
  },

  async getSiteById(siteId: string): Promise<SiteDto | null> {
    return SitesRepositoryShared.getSiteById(siteId);
  },

  async getSiteOrganisme(
    siteId: string,
    organismeId: number,
  ): Promise<SiteOrganismeDto | null> {
    return SitesRepositoryShared.getSiteOrganisme(siteId, organismeId);
  },

  async getSitesByOrganismeId(organismeId: number): Promise<SiteDto[]> {
    return SitesRepositoryShared.getSitesByOrganismeId(organismeId);
  },

  async getStatutId(
    statutValue: string,
    tx: PoolClient,
  ): Promise<number | null> {
    return HebergementsRepositoryShared.getStatutId(tx, statutValue);
  },

  async getUniteHebergementByHebergementId(
    hebergementId: string,
  ): Promise<UniteHebergementDto | null> {
    return HebergementsRepositoryShared.getUniteHebergementsByHebergementId(
      hebergementId,
    );
  },

  async getUniteHebergementById(
    uniteHebergementId: number,
    tx: PoolClient,
  ): Promise<UniteHebergementDto | null> {
    return HebergementsRepositoryShared.getUniteHebergementById(
      uniteHebergementId,
      tx,
    );
  },

  async getUniteHebergementsBySiteId(
    siteId: string,
  ): Promise<UniteHebergementDto[]> {
    return HebergementsRepositoryShared.getUniteHebergementsBySiteId(siteId);
  },

  async linkHebergementToSite(
    tx: PoolClient,
    hebergementId: number,
    siteId: string,
  ): Promise<void> {
    await HebergementsRepositoryShared.linkHebergementToSite(
      tx,
      hebergementId,
      siteId,
    );
  },

  async setUniteHebergementStatut(
    uniteHebergementId: number,
    statutId: number,
    editedBy: number,
    tx: PoolClient,
  ): Promise<void> {
    await HebergementsRepositoryShared.setUniteHebergementStatut(
      tx,
      uniteHebergementId,
      statutId,
      editedBy,
    );
  },

  async updateSite(
    siteId: string,
    { ...input }: UpdateSiteInput,
    tx: PoolClient,
  ): Promise<void> {
    const {
      adresse,
      adresseId,
      deplacementProximiteDescription,
      descriptif,
      editedBy,
      excursionDescription,
      hebergementTypeId,
      hebergementTypeValue,
      nomSiteOfficiel,
      organismeId,
      respEmail,
      respNomPrenom,
      respTelephone,
      vehiculesAdaptes,
    } = input;
    const resolvedAdresseId = adresse
      ? await saveAdresse(tx, adresse)
      : adresseId;
    const resolvedTypeId = hebergementTypeValue
      ? await HebergementsRepositoryShared.getHebergementTypeId(
          tx,
          hebergementTypeValue,
        )
      : hebergementTypeId;
    await SitesRepositoryShared.update(tx, siteId, {
      adresseId: resolvedAdresseId,
      descriptif,
      editedBy,
      hebergementTypeId: resolvedTypeId,
      nomSiteOfficiel,
    });
    await SitesRepositoryShared.createSiteOrganisme(tx, {
      deplacementProximiteDescription: deplacementProximiteDescription ?? null,
      excursionDescription: excursionDescription ?? null,
      nomSite: nomSiteOfficiel,
      organismeId,
      respEmail: respEmail ?? null,
      respNomPrenom: respNomPrenom ?? null,
      respTelephone: respTelephone ?? null,
      siteId,
      vehiculesAdaptes: vehiculesAdaptes ?? null,
    });
  },

  async updateUniteHebergement(
    uniteHebergementId: number,
    { ...input }: UpdateUniteHebergementInput,
    tx: PoolClient,
  ): Promise<void> {
    const {
      editedBy,
      hebergementId,
      id,
      informationsLocaux,
      statutId,
      typePensions,
      uniteData,
    } = input;
    const currentUnit =
      await HebergementsRepositoryShared.getUniteHebergementById(
        uniteHebergementId,
        tx,
      );
    if (!currentUnit) {
      throw new FunctionalException(
        FUNCTIONAL_ERRORS.HEBERGEMENT_CURRENT_NOT_FOUND,
        { hebergementId },
      );
    }
    const data =
      uniteData ??
      buildUniteWriteData({
        informationsLocaux,
      });
    await HebergementsRepositoryShared.unsetUniteHebergementCurrent(
      tx,
      uniteHebergementId,
    );
    await HebergementsRepositoryShared.createUniteHebergement(tx, {
      ...data,
      createdBy: currentUnit.createdBy ?? editedBy,
      editedBy,
      hebergementId,
      id,
      organismeId: currentUnit.organismeId,
      siteId: currentUnit.siteId,
      statutId,
    });
    await HebergementsRepositoryShared.setUniteHebergementTypePensions(
      tx,
      id,
      typePensions,
    );
  },

  async updateUniteHebergementInPlace(
    uniteHebergementId: number,
    { ...input }: UpdateUniteHebergementInPlaceInput,
    tx: PoolClient,
  ): Promise<void> {
    const { editedBy, informationsLocaux, statutId, typePensions, uniteData } =
      input;
    const data =
      uniteData ??
      buildUniteWriteData({
        informationsLocaux,
      });
    await HebergementsRepositoryShared.updateUniteHebergement(
      tx,
      uniteHebergementId,
      {
        ...data,
        editedBy,
        statutId,
      },
    );
    await HebergementsRepositoryShared.setUniteHebergementTypePensions(
      tx,
      uniteHebergementId,
      typePensions,
    );
  },
};
