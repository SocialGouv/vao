import type {
  CheckSiteSimilaritesBody,
  CheckTypeHebergementBody,
  CheckTypeHebergementResponse,
  PatchSiteBody,
  PostSiteBody,
  PostSiteResponse,
  PostUniteHebergementBody,
  SiteSimilariteResult,
  UniteHebergementDto,
} from "@vao/shared-bridge";
import type { PoolClient } from "pg";

import { statuts } from "../../helpers/hebergement";
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

  async createUniteHebergement(
    siteId: string,
    unite: PostUniteHebergementBody,
    usagerUserId: string,
  ): Promise<UniteHebergementDto> {
    return this.writeUniteHebergement(
      siteId,
      unite.organismeId,
      unite,
      null,
      usagerUserId,
    );
  },

  async ensureSiteBelongsToOrganisme(
    tx: PoolClient,
    siteId: string,
    organismeId: number,
  ): Promise<void> {
    const site = await HebergementServiceShared.getSiteWithOrganisme(
      tx,
      siteId,
      organismeId,
    );
    if (!site || site.organismeId !== organismeId) {
      throw new AppError(
        "Le site est introuvable ou ne dépend pas de l'organisme",
        { statusCode: 404 },
      );
    }
  },

  async getSite(
    siteId: string,
    organismeId: number,
  ): Promise<{
    site: PostSiteResponse | null;
    unitesHebergement: UniteHebergementDto[];
  }> {
    log.i("getSite - IN", { organismeId, siteId });

    return withTransaction(async (tx: PoolClient) => {
      const site = await HebergementServiceShared.getSiteWithOrganisme(
        tx,
        siteId,
        organismeId,
      );
      if (!site) {
        log.i("getSite - site introuvable");
        return { site: null, unitesHebergement: [] };
      }

      if (site.adresseId) {
        const [adresse] = await getAddresses([site.adresseId]);
        site.adresse = adresse ?? null;
      }

      const unitesHebergement =
        await HebergementServiceShared.getUniteHebergementsBySiteId(siteId);

      log.i("getSite - DONE");
      return { site, unitesHebergement };
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
  async updateUniteHebergement(
    siteId: string,
    uniteId: number,
    organismeId: number,
    unite: Pick<
      PostUniteHebergementBody,
      Exclude<keyof PostUniteHebergementBody, "organismeId">
    >,
    usagerUserId: string,
  ): Promise<UniteHebergementDto> {
    return this.writeUniteHebergement(
      siteId,
      organismeId,
      unite,
      uniteId,
      usagerUserId,
    );
  },
  async writeUniteHebergement(
    siteId: string,
    organismeId: number,
    unite: Pick<
      PostUniteHebergementBody,
      Exclude<keyof PostUniteHebergementBody, "organismeId">
    >,
    uniteId: number | null,
    usagerUserId: string,
  ): Promise<UniteHebergementDto> {
    log.i("writeUniteHebergement - IN", { organismeId, siteId, uniteId });
    return withTransaction(async (tx: PoolClient) => {
      await this.ensureSiteBelongsToOrganisme(tx, siteId, organismeId);
      const statutId = await HebergementServiceShared.getStatutId(
        statuts.BROUILLON,
        tx,
      );
      const typePensions = unite.typePensions ?? [];
      const prestationsHotelieres = unite.prestationsHotelieres ?? [];

      if (uniteId === null) {
        const { id } = await HebergementServiceShared.createUniteHebergement(
          {
            createdBy: Number(usagerUserId),
            organismeId,
            prestationsHotelieres,
            siteId,
            statutId,
            typePensions,
            uniteData: unite,
          },
          tx,
        );
        const created =
          await HebergementsRepositoryShared.getUniteHebergementById(id, tx);
        if (!created) {
          throw new AppError(
            "L'unité d'hébergement n'a pas pu être récupérée",
            { statusCode: 500 },
          );
        }
        log.i("writeUniteHebergement - CREATED", { id });
        return created;
      }

      const current =
        await HebergementsRepositoryShared.getUniteHebergementById(uniteId, tx);
      if (!current || current.siteId !== siteId) {
        throw new AppError(
          "L'unité d'hébergement est introuvable ou ne dépend pas de ce site",
          { statusCode: 404 },
        );
      }
      const typePensionsFinal =
        unite.typePensions === undefined
          ? await HebergementsRepositoryShared.getUniteHebergementTypePensions(
              uniteId,
              tx,
            )
          : typePensions;
      const prestationsHotelieresFinal =
        unite.prestationsHotelieres === undefined
          ? await HebergementsRepositoryShared.getUniteHebergementPrestationsHotelieres(
              uniteId,
              tx,
            )
          : prestationsHotelieres;
      await HebergementServiceShared.updateUniteHebergementInPlace(
        uniteId,
        {
          editedBy: Number(usagerUserId),
          prestationsHotelieres: prestationsHotelieresFinal,
          statutId: statutId ?? current.statutId,
          typePensions: typePensionsFinal,
          uniteData: unite,
        },
        tx,
      );
      const updated =
        await HebergementsRepositoryShared.getUniteHebergementById(uniteId);
      if (!updated) {
        throw new AppError("L'unité d'hébergement n'a pas pu être récupérée", {
          statusCode: 500,
        });
      }
      log.i("writeUniteHebergement - UPDATED", { uniteId });
      return updated;
    });
  },
};
