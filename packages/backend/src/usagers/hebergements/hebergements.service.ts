import type {
  CheckSiteSimilaritesBody,
  CheckTypeHebergementBody,
  CheckTypeHebergementResponse,
  PatchSiteBody,
  PostSiteBody,
  PostSiteResponse,
  SiteSimilariteResult,
  SitesListeResponse,
} from "@vao/shared-bridge";
import type { PoolClient } from "pg";

import { getByIds as getAddresses } from "../../services/adresse";
import Organisme from "../../services/Organisme";
import { HebergementsRepositoryShared } from "../../shared/hebergements/hebergements.repository";
import { HebergementServiceShared } from "../../shared/hebergements/hebergements.service";
import { classifySiteSimilarite } from "../../shared/hebergements/hebergements.similarites";
import AppError from "../../utils/error";
import { logger } from "../../utils/logger";
import { withTransaction } from "../../utils/pgpool";
import { HebergementsRepository } from "./hebergements.repository";

const log = logger(module.filename);

export const HebergementService = {
  async checkSiteSimilarites(
    site: CheckSiteSimilaritesBody,
  ): Promise<SiteSimilariteResult[]> {
    log.i("checkSiteSimilarites - IN");

    const siteSimilaires =
      await HebergementsRepository.findSiteSimilaritesCandidates({
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

  async checkTypeHebergement(
    input: CheckTypeHebergementBody,
  ): Promise<CheckTypeHebergementResponse> {
    log.i("checkTypeHebergement - IN", {
      hebergementTypeValue: input.hebergementTypeValue,
      organismeId: input.organismeId,
      siteId: input.siteId,
    });

    const typesDeclares =
      await HebergementServiceShared.getHebergementTypesBySite(
        input.siteId,
        input.organismeId,
      );

    const typeDeclare =
      typesDeclares.find((type) => type !== input.hebergementTypeValue) ?? null;

    log.i("checkTypeHebergement - DONE", { incoherence: !!typeDeclare });
    return {
      incoherence: typeDeclare !== null,
      typeDeclare,
    };
  },

  async getSitesList({
    userId,
    statut,
    nom,
    adresse,
    limit,
    offset,
    sortBy,
    sortDirection,
  }: {
    userId: string;
    statut?: string;
    nom?: string;
    adresse?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<SitesListeResponse> {
    log.i("getSitesList - IN");

    const organismeUserConnected = await Organisme.getOne({ use_id: userId });
    const siret = organismeUserConnected?.personneMorale?.siret;
    if (!siret) {
      return { rows: [], total: 0 };
    }

    const organismeSiege = await Organisme.getSiege(siret);
    const siren = organismeSiege?.personneMorale?.siren;
    if (!siren) {
      return { rows: [], total: 0 };
    }

    const organismes = await Organisme.getBySiren(siren);
    const organismeIds = organismes
      .map((organisme) => organisme.organismeId)
      .filter((id): id is number => typeof id === "number");

    if (organismeIds.length === 0) {
      return { rows: [], total: 0 };
    }

    return HebergementsRepository.getSitesList({
      adresse,
      limit: limit ?? 10,
      nom,
      offset: offset ?? 0,
      organismeIds,
      sortBy,
      sortDirection,
      statut,
    });
  },

  async postSite(
    site: PostSiteBody,
    usagerUserId: string,
  ): Promise<PostSiteResponse> {
    log.i("postSite - IN");

    return withTransaction(async (tx: PoolClient) => {
      const existingSite =
        await HebergementServiceShared.getSiteByNomOfficielAndAdresseLabel(
          tx,
          site.nomSiteOfficiel ?? "",
          site.adresse.label ?? "",
        );

      let siteId = existingSite?.siteId;
      if (!siteId) {
        ({ siteId } = await HebergementServiceShared.createSite(
          {
            adresse: site.adresse,
            adresseId: site.adresse.id ?? null,
            createdBy: Number(usagerUserId),
            nomSiteOfficiel: site.nomSiteOfficiel,
          },
          tx,
        ));
      } else {
        log.i("postSite - site existant réutilisé", { siteId });
      }

      const existingLink = await HebergementServiceShared.getSiteWithOrganisme(
        tx,
        siteId,
        site.organismeId,
      );
      const hasOrganismeLink = existingLink?.organismeId === site.organismeId;
      if (!hasOrganismeLink) {
        log.i("postSite - création du lien organisme");
        await HebergementServiceShared.createSiteOrganisme(tx, {
          deplacementProximiteDescription:
            site.deplacementProximiteDescription ?? null,
          descriptif: site.descriptif ?? null,
          excursionDescription: site.excursionDescription ?? null,
          hebergementTypeId: site.hebergementTypeId ?? null,
          nomSite: site.nomSite ?? site.nomSiteOfficiel,
          organismeId: site.organismeId,
          respEmail: site.respEmail ?? null,
          respNomPrenom: site.respNomPrenom ?? null,
          respTelephone: site.respTelephone ?? null,
          siteId,
          vehiculesAdaptes: site.vehiculesAdaptes ?? null,
        });
      }

      const result = await HebergementServiceShared.getSiteWithOrganisme(
        tx,
        siteId,
        site.organismeId,
      );
      if (!result) {
        throw new AppError("Le site n'a pas pu être récupéré après création", {
          statusCode: 404,
        });
      }
      log.i("postSite - DONE");
      return result;
    });
  },
  async updateSiteInformation(
    siteId: string,
    site: PatchSiteBody,
  ): Promise<void> {
    log.i("updateSiteInformation - IN", { siteId });

    return withTransaction(async (tx: PoolClient) => {
      const organismeLink = await HebergementServiceShared.getSiteOrganisme(
        tx,
        siteId,
        site.organismeId,
      );
      log.d("updateSiteInformation - organismeLink", organismeLink);
      if (!organismeLink) {
        throw new AppError(
          "Le site est introuvable ou ne dépend pas de l'organisme",
          { statusCode: 404 },
        );
      }

      const hebergementTypeId =
        await HebergementsRepositoryShared.getHebergementTypeId(
          tx,
          site.hebergementTypeValue,
        );

      await HebergementServiceShared.updateSiteInformation(
        tx,
        siteId,
        site.organismeId,
        {
          descriptif: site.description ?? null,
          hebergementTypeId,
        },
      );
      await HebergementServiceShared.updateOrganismeResp(
        tx,
        siteId,
        site.organismeId,
        {
          respEmail: site.responsable.email ?? null,
          respNomPrenom: site.responsable.nomPrenom ?? null,
          respTelephone: site.responsable.telephone ?? null,
        },
      );
      log.i("updateSiteInformation - DONE");
    });
  },
};
