import {
  AdresseDto,
  InformationsLocauxDto,
  SiteDto,
  SiteOrganismeDto,
  UniteHebergementDto,
  UniteHebergementPayloadDto,
} from "@vao/shared-bridge";
import { PoolClient } from "pg";

import { saveAdresse } from "../../services/adresse";
import { withTransaction } from "../../utils/pgpool";
import { LegacyUniteContextEntity } from "./hebergements.entity";
import { buildUniteWriteData } from "./hebergements.mapping";
import { HebergementsRepositoryShared } from "./hebergements.repository";

const getHebergementTypeId = async (
  client: PoolClient,
  hebergementTypeValue: string | null,
): Promise<number | null> => {
  if (!hebergementTypeValue) {
    return null;
  }
  const { rows } = await client.query<{ id: number }>(
    `SELECT id FROM front.hebergement_type WHERE value = $1`,
    [hebergementTypeValue],
  );
  return rows?.[0]?.id ?? null;
};

const withTx = async <T>(
  tx: PoolClient | undefined,
  // eslint-disable-next-line no-unused-vars -- paramètre typé d'une fonction-callback
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  if (tx) {
    return callback(tx);
  }
  return withTransaction(callback);
};

export const HebergementServiceShared = {
  async createSite(
    {
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
    }: {
      adresse?: AdresseDto | null;
      adresseId: number | null;
      createdBy: number;
      deplacementProximiteDescription?: string | null;
      descriptif: string | null;
      excursionDescription?: string | null;
      hebergementTypeId: number | null;
      hebergementTypeValue?: string | null;
      nomSiteOfficiel: string | null;
      organismeId: number;
      respEmail?: string | null;
      respNomPrenom?: string | null;
      respTelephone?: string | null;
      vehiculesAdaptes?: boolean | null;
    },
    tx?: PoolClient,
  ): Promise<string> {
    return withTx(tx, async (client) => {
      const resolvedAdresseId = adresse
        ? await saveAdresse(client, adresse)
        : adresseId;
      const resolvedTypeId = hebergementTypeValue
        ? await getHebergementTypeId(client, hebergementTypeValue)
        : hebergementTypeId;
      const siteId = await HebergementsRepositoryShared.createSite(client, {
        adresseId: resolvedAdresseId,
        createdBy,
        descriptif,
        hebergementTypeId: resolvedTypeId,
        nomSiteOfficiel,
      });
      await HebergementsRepositoryShared.createSiteOrganisme(client, {
        deplacementProximiteDescription:
          deplacementProximiteDescription ?? null,
        excursionDescription: excursionDescription ?? null,
        nomSite: nomSiteOfficiel,
        organismeId,
        respEmail: respEmail ?? null,
        respNomPrenom: respNomPrenom ?? null,
        respTelephone: respTelephone ?? null,
        siteId,
        vehiculesAdaptes: vehiculesAdaptes ?? null,
      });
      return siteId;
    });
  },

  async createUniteHebergement(
    {
      createdBy,
      hebergementId,
      id,
      informationsLocaux,
      organismeId,
      siteId,
      statutId,
      typePensions,
      uniteData,
    }: {
      createdBy: number;
      hebergementId: string;
      id: number;
      informationsLocaux: InformationsLocauxDto;
      organismeId: number;
      siteId: string;
      statutId: number | null;
      typePensions: string[];
      uniteData?: UniteHebergementPayloadDto;
    },
    tx?: PoolClient,
  ): Promise<number> {
    return withTx(tx, async (client) => {
      const data =
        uniteData ??
        buildUniteWriteData({
          informationsLocaux,
        });
      const uniteId = await HebergementsRepositoryShared.createUniteHebergement(
        client,
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
        client,
        uniteId,
        typePensions,
      );
      return uniteId;
    });
  },

  async getLegacyUniteContext(
    hebergementId: number,
    tx?: PoolClient,
  ): Promise<LegacyUniteContextEntity> {
    return withTx(tx, (client) =>
      HebergementsRepositoryShared.getLegacyUniteContext(client, hebergementId),
    );
  },

  async getSiteById(siteId: string): Promise<SiteDto | null> {
    return HebergementsRepositoryShared.getSiteById(siteId);
  },

  async getSiteOrganisme(
    siteId: string,
    organismeId: number,
  ): Promise<SiteOrganismeDto | null> {
    return HebergementsRepositoryShared.getSiteOrganisme(siteId, organismeId);
  },

  async getSitesByOrganismeId(organismeId: number): Promise<SiteDto[]> {
    return HebergementsRepositoryShared.getSitesByOrganismeId(organismeId);
  },

  async getStatutId(
    statutValue: string,
    tx?: PoolClient,
  ): Promise<number | null> {
    return withTx(tx, (client) =>
      HebergementsRepositoryShared.getStatutId(client, statutValue),
    );
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
    tx?: PoolClient,
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
    tx: PoolClient | undefined,
    hebergementId: number,
    siteId: string,
  ): Promise<void> {
    return withTx(tx, async (client) => {
      await HebergementsRepositoryShared.linkHebergementToSite(
        client,
        hebergementId,
        siteId,
      );
    });
  },

  async setUniteHebergementStatut(
    uniteHebergementId: number,
    statutId: number,
    editedBy: number,
    tx?: PoolClient,
  ): Promise<void> {
    return withTx(tx, (client) =>
      HebergementsRepositoryShared.setUniteHebergementStatut(
        client,
        uniteHebergementId,
        statutId,
        editedBy,
      ),
    );
  },

  async updateSite(
    siteId: string,
    {
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
    }: {
      adresse?: AdresseDto | null;
      adresseId: number | null;
      deplacementProximiteDescription?: string | null;
      descriptif: string | null;
      editedBy: number;
      excursionDescription?: string | null;
      hebergementTypeId: number | null;
      hebergementTypeValue?: string | null;
      nomSiteOfficiel: string | null;
      organismeId: number;
      respEmail?: string | null;
      respNomPrenom?: string | null;
      respTelephone?: string | null;
      vehiculesAdaptes?: boolean | null;
    },
    tx?: PoolClient,
  ): Promise<void> {
    return withTx(tx, async (client) => {
      const resolvedAdresseId = adresse
        ? await saveAdresse(client, adresse)
        : adresseId;
      const resolvedTypeId = hebergementTypeValue
        ? await getHebergementTypeId(client, hebergementTypeValue)
        : hebergementTypeId;
      await HebergementsRepositoryShared.updateSite(client, siteId, {
        adresseId: resolvedAdresseId,
        descriptif,
        editedBy,
        hebergementTypeId: resolvedTypeId,
        nomSiteOfficiel,
      });
      await HebergementsRepositoryShared.createSiteOrganisme(client, {
        deplacementProximiteDescription:
          deplacementProximiteDescription ?? null,
        excursionDescription: excursionDescription ?? null,
        nomSite: nomSiteOfficiel,
        organismeId,
        respEmail: respEmail ?? null,
        respNomPrenom: respNomPrenom ?? null,
        respTelephone: respTelephone ?? null,
        siteId,
        vehiculesAdaptes: vehiculesAdaptes ?? null,
      });
    });
  },

  async updateUniteHebergement(
    uniteHebergementId: number,
    {
      editedBy,
      hebergementId,
      id,
      informationsLocaux,
      statutId,
      typePensions,
      uniteData,
    }: {
      editedBy: number;
      hebergementId: string;
      id: number;
      informationsLocaux: InformationsLocauxDto;
      statutId: number | null;
      typePensions: string[];
      uniteData?: UniteHebergementPayloadDto;
    },
    tx?: PoolClient,
  ): Promise<void> {
    return withTx(tx, async (client) => {
      const currentUnit =
        await HebergementsRepositoryShared.getUniteHebergementById(
          uniteHebergementId,
          client,
        );
      if (!currentUnit) {
        return;
      }
      const data =
        uniteData ??
        buildUniteWriteData({
          informationsLocaux,
        });
      await HebergementsRepositoryShared.setUniteHebergementCurrent(
        client,
        uniteHebergementId,
      );
      await HebergementsRepositoryShared.createUniteHebergement(client, {
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
        client,
        id,
        typePensions,
      );
    });
  },

  async updateUniteHebergementInPlace(
    uniteHebergementId: number,
    {
      editedBy,
      informationsLocaux,
      statutId,
      typePensions,
      uniteData,
    }: {
      editedBy: number;
      informationsLocaux: InformationsLocauxDto;
      statutId: number | null;
      typePensions: string[];
      uniteData?: UniteHebergementPayloadDto;
    },
    tx?: PoolClient,
  ): Promise<void> {
    return withTx(tx, async (client) => {
      const data =
        uniteData ??
        buildUniteWriteData({
          informationsLocaux,
        });
      await HebergementsRepositoryShared.updateUniteHebergement(
        client,
        uniteHebergementId,
        {
          ...data,
          editedBy,
          statutId,
        },
      );
      await HebergementsRepositoryShared.setUniteHebergementTypePensions(
        client,
        uniteHebergementId,
        typePensions,
      );
    });
  },
};
