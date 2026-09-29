import type {
  CheckSiteSimilaritesBody,
  SiteSimilariteResult,
} from "@vao/shared-bridge";

import { getByIds as getAddresses } from "../../services/adresse";
import { classifySiteSimilarite } from "../../shared/hebergements/hebergements.similarites";
import { logger } from "../../utils/logger";
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
};
