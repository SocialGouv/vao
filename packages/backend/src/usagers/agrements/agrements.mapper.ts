import {
  ActiviteDto,
  AgrementAnimationDto,
  AgrementBilanAnnuelDto,
  AgrementDto,
  AgrementFilesDto,
  AgrementSejoursDto,
  BilanHebergementDto,
} from "@vao/shared-bridge";

import {
  ActiviteEntity,
  AgrementAnimationEntity,
  AgrementBilanAnnuelEntity,
  AgrementEntity,
  AgrementFilesEntity,
  AgrementSejoursEntity,
  BilanHebergementEntity,
} from "./agrements.entity";

/**
 * Mapper to convert database rows (snake_case) to DTOs (camelCase)
 */
export const AgrementsMapper = {
  toModel: (entity: AgrementEntity): AgrementDto => {
    return {
      accompRespAttestHono: entity.accomp_resp_attest_hono,
      accompRespCompExp: entity.accomp_resp_comp_exp,
      accompRespNb: entity.accomp_resp_nb,
      accompRespRecruteUrg: entity.accomp_resp_recrute_urg,
      animationAutre: entity.animation_autre,
      bilanAucunChangementEvolution: entity.bilan_aucun_changement_evolution,
      bilanChangementEvolution: entity.bilan_changement_evolution,
      bilanFinancierCommentaire: entity.bilan_financier_commentaire,
      bilanFinancierComparatif: entity.bilan_financier_comparatif,
      bilanFinancierComptabilite: entity.bilan_financier_comptabilite,
      bilanFinancierRessourcesHumaines:
        entity.bilan_financier_ressources_humaines,
      bilanQualElementsMarquants: entity.bilan_qual_elements_marquants,
      bilanQualPerceptionSensibilite: entity.bilan_qual_perception_sensibilite,
      bilanQualPerspectiveEvol: entity.bilan_qual_perspective_evol,
      budgetComplement: entity.budget_complement,
      budgetGestionPerso: entity.budget_gestion_perso,
      budgetPaiementSecurise: entity.budget_paiement_securise,
      commentaire: entity.commentaire,
      dateConfirmCompletude: entity.date_confirm_completude,
      dateDepot: entity.date_depot,
      dateObtentionCertificat: entity.date_obtention_certificat,
      dateVerifCompleture: entity.date_verif_completure,
      id: entity.id,
      immatriculation: entity.immatriculation,
      motivations: entity.motivations,
      organismeId: entity.organisme_id,
      protocoleEvacUrg: entity.protocole_evac_urg,
      protocoleInfoFamille: entity.protocole_info_famille,
      protocoleMateriel: entity.protocole_materiel,
      protocoleRapatEtranger: entity.protocole_rapat_etranger,
      protocoleRapatUrg: entity.protocole_rapat_urg,
      protocoleRemboursement: entity.protocole_remboursement,
      sejourCommentaire: entity.sejour_commentaire,
      sejourNbEnvisage: entity.sejour_nb_envisage,
      statut: entity.statut as any,
      suiviMedAccordSejour: entity.suivi_med_accord_sejour,
      suiviMedDistribution: entity.suivi_med_distribution,
      transportAllerRetour: entity.transport_aller_retour,
      transportSejour: entity.transport_sejour,
      updatedAt: entity.updated_at,
      vacanciersNbEnvisage: entity.vacanciers_nb_envisage,
    };
  },
  toModels: (entities: AgrementEntity[]): AgrementDto[] => {
    return entities.map((entity) => AgrementsMapper.toModel(entity));
  },
};

/**
 * Mappers to convert database rows (snake_case) to DTOs (camelCase)
 */
export const ActiviteMapper = {
  toModel: (entity: ActiviteEntity): ActiviteDto => {
    return {
      activiteType: entity.activite_type as any,
      code: entity.code,
      libelle: entity.libelle,
    };
  },
  toModels: (entities: ActiviteEntity[]): ActiviteDto[] => {
    return entities.map((entity) => ActiviteMapper.toModel(entity));
  },
};

export const AgrementAnimationMapper = {
  toModel: (entity: AgrementAnimationEntity): AgrementAnimationDto => {
    return {
      activite: entity.activite
        ? ActiviteMapper.toModel(entity.activite)
        : { activiteType: null, code: null, libelle: null },
      activiteId: entity.activite_id ?? null,
      agrementId: entity.agrement_id ?? null,
    };
  },
  toModels: (entities: AgrementAnimationEntity[]): AgrementAnimationDto[] =>
    entities.map((entity) => AgrementAnimationMapper.toModel(entity)),
};

export const AgrementFilesMapper = {
  toModel: (entity: AgrementFilesEntity): AgrementFilesDto => {
    return {
      agrementId: entity.agrement_id,
      category: entity.category as any,
      fileUuid: entity.file_uuid,
    };
  },
  toModels: (entities: AgrementFilesEntity[]): AgrementFilesDto[] => {
    return entities.map((entity) => AgrementFilesMapper.toModel(entity));
  },
};

export const AgrementSejoursMapper = {
  toModel: (entity: AgrementSejoursEntity): AgrementSejoursDto => {
    return {
      adresse: {
        cleInsee: entity.adresse?.cleInsee ?? null,
        codeInsee: entity.adresse?.codeInsee ?? null,
        codePostal: entity.adresse?.codePostal ?? null,
        coordinates: entity.adresse?.coordinates ?? null,
        departement: entity.adresse?.departement ?? null,
        id: entity.adresse?.id ?? null,
        label: entity.adresse?.label ?? null,
      },
      agrementId: entity.agrement_id,
      mois: entity.mois,
      nbVacanciers: entity.nb_vacanciers,
      nomHebergement: entity.nom_hebergement,
    };
  },
  toModels: (entities: AgrementSejoursEntity[]): AgrementSejoursDto[] => {
    return entities.map((entity) => AgrementSejoursMapper.toModel(entity));
  },
};
export const AgrementBilanAnnuelMapper = {
  toModel: (entity: AgrementBilanAnnuelEntity): AgrementBilanAnnuelDto => {
    return {
      agrementId: entity.agrement_id ?? null,
      annee: entity.annee,
      bilanHebergement: Array.isArray((entity as any).bilan_hebergement)
        ? BilanHebergementMapper.toModels(
            (entity as any).bilan_hebergement as BilanHebergementEntity[],
          )
        : [],
      nbFemmes: entity.nb_femmes,
      nbGlobalVacanciers: entity.nb_global_vacanciers,
      nbHommes: entity.nb_hommes,
      nbTotalJoursVacances: entity.nb_total_jours_vacances,
      trancheAge: entity.tranche_age,
      typeHandicap: entity.type_handicap,
    };
  },

  toModels: (
    entities: AgrementBilanAnnuelEntity[],
  ): AgrementBilanAnnuelDto[] => {
    return entities.map((entity) => AgrementBilanAnnuelMapper.toModel(entity));
  },
};

export const BilanHebergementMapper = {
  toModel: (entity: BilanHebergementEntity): BilanHebergementDto => {
    return {
      adresse: {
        cleInsee: entity.adresse?.cleInsee ?? null,
        codeInsee: entity.adresse?.codeInsee ?? null,
        codePostal: entity.adresse?.codePostal ?? null,
        coordinates: entity.adresse?.coordinates ?? null,
        departement: entity.adresse?.departement ?? null,
        id: entity.adresse?.id ?? null,
        label: entity.adresse?.label ?? null,
      },
      agrBilanAnnuelId: entity.agr_bilan_annuel_id ?? null,
      mois: entity.mois,
      nbJours: entity.nb_jours,
      nomHebergement: entity.nom_hebergement,
    };
  },
  toModels: (entities: BilanHebergementEntity[]): BilanHebergementDto[] => {
    return entities.map((entity) => BilanHebergementMapper.toModel(entity));
  },
};
