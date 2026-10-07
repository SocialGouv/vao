import {
  FUNCTIONAL_ERRORS,
  FunctionalException,
  InformationsLocauxDto,
  PostSiteResponse,
  SiteDto,
  SiteOrganismeDto,
  UniteHebergementDto,
  UniteHebergementPayloadDto,
} from "@vao/shared-bridge";
import { PoolClient } from "pg";

import { saveAdresse } from "../../services/adresse";
import { LegacyUniteContextEntity } from "./hebergements.entity";
import { buildUniteWriteData } from "./hebergements.mapping";
import { HebergementsRepositoryShared } from "./hebergements.repository";
import { SitesRepositoryShared } from "./hebergementsSite.repository";

type CreateSiteInput = Pick<
  SiteDto,
  "adresseId" | "createdBy" | "nomSiteOfficiel"
> &
  Partial<Pick<SiteDto, "adresse" | "descriptif" | "hebergementTypeId">> & {
    hebergementTypeValue?: string | null;
  };

type UpdateSiteInput = Omit<CreateSiteInput, "createdBy" | "adresseId"> &
  Pick<SiteDto, "organismeId"> &
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
  > & {
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
  async createSite(
    { ...input }: CreateSiteInput,
    tx: PoolClient,
  ): Promise<Pick<SiteDto, "siteId">> {
    const { adresse, adresseId, createdBy, nomSiteOfficiel } = input;
    const resolvedAdresseId = adresse
      ? await saveAdresse(tx, adresse)
      : adresseId;
    const siteId = await SitesRepositoryShared.create(tx, {
      adresseId: resolvedAdresseId,
      createdBy,
      nomSiteOfficiel,
    });
    return { siteId };
  },

  async createSiteOrganisme(
    tx: PoolClient,
    input: {
      deplacementProximiteDescription: string | null;
      descriptif?: string | null;
      excursionDescription: string | null;
      hebergementTypeId?: number | null;
      hebergementTypeValue?: string | null;
      nomSite: string | null;
      organismeId: number;
      respEmail: string | null;
      respNomPrenom: string | null;
      respTelephone: string | null;
      siteId: string;
      vehiculesAdaptes: boolean | null;
    },
  ): Promise<void> {
    const { hebergementTypeId, hebergementTypeValue, descriptif, ...rest } =
      input;
    const resolvedTypeId = hebergementTypeValue
      ? await HebergementsRepositoryShared.getHebergementTypeId(
          tx,
          hebergementTypeValue,
        )
      : (hebergementTypeId ?? null);
    return SitesRepositoryShared.createSiteOrganisme(tx, {
      ...rest,
      descriptif: descriptif ?? null,
      hebergementTypeId: resolvedTypeId,
    });
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

  async getHebergementTypesBySite(
    siteId: string,
    organismeId: number,
  ): Promise<string[]> {
    return SitesRepositoryShared.getHebergementTypesBySite(siteId, organismeId);
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

  async getSiteByNomOfficielAndAdresseLabel(
    tx: PoolClient,
    nomSiteOfficiel: string,
    adresseLabel: string,
  ): Promise<SiteDto | null> {
    return SitesRepositoryShared.getSiteByNomOfficielAndAdresseLabel(
      tx,
      nomSiteOfficiel,
      adresseLabel,
    );
  },

  async getSiteOrganisme(
    tx: PoolClient,
    siteId: string,
    organismeId: number,
  ): Promise<SiteOrganismeDto | null> {
    return SitesRepositoryShared.getSiteOrganisme(tx, siteId, organismeId);
  },

  async getSiteWithOrganisme(
    tx: PoolClient,
    siteId: string,
    organismeId: number,
  ): Promise<PostSiteResponse | null> {
    const site = await SitesRepositoryShared.getSiteWithOrganisme(
      tx,
      siteId,
      organismeId,
    );

    if (!site || site.organismeId === null) {
      return null;
    }

    return site as PostSiteResponse;
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

  async updateOrganismeResp(
    tx: PoolClient,
    siteId: string,
    organismeId: number,
    input: {
      respEmail: string | null;
      respNomPrenom: string | null;
      respTelephone: string | null;
    },
  ): Promise<void> {
    return SitesRepositoryShared.updateOrganismeResp(
      tx,
      siteId,
      organismeId,
      input,
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
    await SitesRepositoryShared.update(tx, siteId, {
      adresseId: resolvedAdresseId,
      editedBy,
      nomSiteOfficiel,
    });
    await SitesRepositoryShared.createSiteOrganisme(tx, {
      deplacementProximiteDescription: deplacementProximiteDescription ?? null,
      descriptif: descriptif ?? null,
      excursionDescription: excursionDescription ?? null,
      hebergementTypeId: hebergementTypeValue
        ? await HebergementsRepositoryShared.getHebergementTypeId(
            tx,
            hebergementTypeValue,
          )
        : (hebergementTypeId ?? null),
      nomSite: nomSiteOfficiel,
      organismeId,
      respEmail: respEmail ?? null,
      respNomPrenom: respNomPrenom ?? null,
      respTelephone: respTelephone ?? null,
      siteId,
      vehiculesAdaptes: vehiculesAdaptes ?? null,
    });
  },

  async updateSiteInformation(
    tx: PoolClient,
    siteId: string,
    organismeId: number,
    input: {
      descriptif: string | null;
      hebergementTypeId: number | null;
    },
  ): Promise<void> {
    return SitesRepositoryShared.updateSiteInformation(
      tx,
      siteId,
      organismeId,
      input,
    );
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
