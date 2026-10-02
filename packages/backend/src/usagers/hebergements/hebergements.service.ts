import type {
  CheckSiteSimilaritesBody,
  PostSiteBody,
  SiteSimilariteResult,
} from "@vao/shared-bridge";
import type { PoolClient } from "pg";

import { getByIds as getAddresses } from "../../services/adresse";
import { HebergementServiceShared } from "../../shared/hebergements/hebergements.service";
import { classifySiteSimilarite } from "../../shared/hebergements/hebergements.similarites";
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

  async postSite(site: PostSiteBody, usagerUserId: string): Promise<string> {
    log.i("postSite - IN");

    return withTransaction(async (tx: PoolClient) => {
      const { siteId } = await HebergementServiceShared.createSite(
        {
          adresse: site.adresse,
          adresseId: site.adresse.id ?? null,
          createdBy: Number(usagerUserId),
          deplacementProximiteDescription:
            site.deplacementProximiteDescription ?? null,
          descriptif: site.descriptif ?? null,
          excursionDescription: site.excursionDescription ?? null,
          hebergementTypeId: site.hebergementTypeId ?? null,
          nomSiteOfficiel: site.nomSiteOfficiel,
          organismeId: site.organismeId,
          respEmail: site.respEmail ?? null,
          respNomPrenom: site.respNomPrenom ?? null,
          respTelephone: site.respTelephone ?? null,
          vehiculesAdaptes: site.vehiculesAdaptes ?? null,
        },
        tx,
      );
      log.i("postSite - DONE");
      return siteId;
    });
  },
};
