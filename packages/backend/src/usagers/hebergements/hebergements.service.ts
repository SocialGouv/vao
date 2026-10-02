import type {
  CheckSiteSimilaritesBody,
  PatchSiteBody,
  PostSiteBody,
  PostSiteResponse,
  SiteSimilariteResult,
} from "@vao/shared-bridge";
import type { PoolClient } from "pg";

import { getByIds as getAddresses } from "../../services/adresse";
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
