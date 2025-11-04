import {
  ActiviteDto,
  AgrementAnimationDto,
  AgrementBilanAnnuelDto,
  AgrementFilesDto,
  AgrementsDto,
  AgrementSejoursDto,
  BilanHebergementDto,
} from "../dto/AgrementsDto";
import { AgrementEntity } from "../entities/AgrementEntity";

/**
 * Mapper to convert database rows (snake_case) to DTOs (camelCase)
 */
export const AgrementsMapper = {
  /**
   * Convert a database row with snake_case to an AgrementsDto with camelCase
   * @param entity - The database entity with snake_case properties
   * @returns The AgrementsDto with camelCase properties
   */
  toModel: (entity: AgrementEntity): AgrementsDto => {
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
      immatriculation: entity.immatriculation,
      motivations: entity.motivations,
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
  /**
   * Convert an array of database rows with snake_case to an array of AgrementsDto with camelCase
   * @param entities - The array of database entities with snake_case properties
   * @returns The array of AgrementsDto with camelCase properties
   */
  toModels: (entities: AgrementEntity[]): AgrementsDto[] => {
    return entities.map((entity) => AgrementsMapper.toModel(entity));
  },
};

/**
 * Database row type with snake_case columns for Activite
 */
interface ActiviteEntity {
  code: string | null;
  libelle: string | null;
  activite_type: string | null;
}

/**
 * Database row type with snake_case columns for AgrementAnimation
 */
interface AgrementAnimationEntity {
  activite_id: number | null;
  agrement_id: number | null;
}

/**
 * Database row type with snake_case columns for AgrementFiles
 */
interface AgrementFilesEntity {
  agrement_id: number | null;
  category: string | null;
  file_uuid: string | null;
}

/**
 * Database row type with snake_case columns for AgrementSejours
 */
interface AgrementSejoursEntity {
  agrement_id: number | null;
  nom_hebergement: string | null;
  adresse_id: number | null;
  b_vacanciers: number | null;
  mois: number[] | null;
}

/**
 * Database row type with snake_case columns for AgrementBilanAnnuel
 */
interface AgrementBilanAnnuelEntity {
  agrement_id: number | null;
  annee: number | null;
  nb_global_vacanciers: number | null;
  nb_hommes: number | null;
  nb_femmes: number | null;
  nb_total_jours_vacances: number | null;
  type_handicap: string[] | null;
  tranche_age: string[] | null;
}

/**
 * Database row type with snake_case columns for BilanHebergement
 */
interface BilanHebergementEntity {
  agr_bilan_annuel_id: number | null;
  nom_hebergement: string | null;
  adresse_id: number | null;
  nb_jours: number | null;
  mois: number[] | null;
}

/**
 * Mappers to convert database rows (snake_case) to DTOs (camelCase)
 */
export const ActiviteMapper = {
  /**
   * Convert a database row with snake_case to an ActiviteDto with camelCase
   * @param entity - The database entity with snake_case properties
   * @returns The ActiviteDto with camelCase properties
   */
  toModel: (entity: ActiviteEntity): ActiviteDto => {
    return {
      activiteType: entity.activite_type as any,
      code: entity.code,
      libelle: entity.libelle,
    };
  },
  /**
   * Convert an array of database rows with snake_case to an array of ActiviteDto with camelCase
   * @param entities - The array of database entities with snake_case properties
   * @returns The array of ActiviteDto with camelCase properties
   */
  toModels: (entities: ActiviteEntity[]): ActiviteDto[] => {
    return entities.map((entity) => ActiviteMapper.toModel(entity));
  },
};

export const AgrementAnimationMapper = {
  /**
   * Convert a database row with snake_case to an AgrementAnimationDto with camelCase
   * @param entity - The database entity with snake_case properties
   * @returns The AgrementAnimationDto with camelCase properties
   */
  toModel: (entity: AgrementAnimationEntity): AgrementAnimationDto => {
    return {
      activiteId: entity.activite_id,
      agrementId: entity.agrement_id,
    };
  },
  /**
   * Convert an array of database rows with snake_case to an array of AgrementAnimationDto with camelCase
   * @param entities - The array of database entities with snake_case properties
   * @returns The array of AgrementAnimationDto with camelCase properties
   */
  toModels: (entities: AgrementAnimationEntity[]): AgrementAnimationDto[] => {
    return entities.map((entity) => AgrementAnimationMapper.toModel(entity));
  },
};

export const AgrementFilesMapper = {
  /**
   * Convert a database row with snake_case to an AgrementFilesDto with camelCase
   * @param entity - The database entity with snake_case properties
   * @returns The AgrementFilesDto with camelCase properties
   */
  toModel: (entity: AgrementFilesEntity): AgrementFilesDto => {
    return {
      agrementId: entity.agrement_id,
      category: entity.category as any,
      fileUuid: entity.file_uuid,
    };
  },
  /**
   * Convert an array of database rows with snake_case to an array of AgrementFilesDto with camelCase
   * @param entities - The array of database entities with snake_case properties
   * @returns The array of AgrementFilesDto with camelCase properties
   */
  toModels: (entities: AgrementFilesEntity[]): AgrementFilesDto[] => {
    return entities.map((entity) => AgrementFilesMapper.toModel(entity));
  },
};

export const AgrementSejoursMapper = {
  /**
   * Convert a database row with snake_case to an AgrementSejoursDto with camelCase
   * @param entity - The database entity with snake_case properties
   * @returns The AgrementSejoursDto with camelCase properties
   */
  toModel: (entity: AgrementSejoursEntity): AgrementSejoursDto => {
    return {
      adresseId: entity.adresse_id,
      agrementId: entity.agrement_id,
      bVacanciers: entity.b_vacanciers,
      mois: entity.mois,
      nomHebergement: entity.nom_hebergement,
    };
  },
  /**
   * Convert an array of database rows with snake_case to an array of AgrementSejoursDto with camelCase
   * @param entities - The array of database entities with snake_case properties
   * @returns The array of AgrementSejoursDto with camelCase properties
   */
  toModels: (entities: AgrementSejoursEntity[]): AgrementSejoursDto[] => {
    return entities.map((entity) => AgrementSejoursMapper.toModel(entity));
  },
};

export const AgrementBilanAnnuelMapper = {
  /**
   * Convert a database row with snake_case to an AgrementBilanAnnuelDto with camelCase
   * @param entity - The database entity with snake_case properties
   * @returns The AgrementBilanAnnuelDto with camelCase properties
   */
  toModel: (entity: AgrementBilanAnnuelEntity): AgrementBilanAnnuelDto => {
    return {
      agrementId: entity.agrement_id,
      annee: entity.annee,
      nbFemmes: entity.nb_femmes,
      nbGlobalVacanciers: entity.nb_global_vacanciers,
      nbHommes: entity.nb_hommes,
      nbTotalJoursVacances: entity.nb_total_jours_vacances,
      trancheAge: entity.tranche_age,
      typeHandicap: entity.type_handicap,
    };
  },
  /**
   * Convert an array of database rows with snake_case to an array of AgrementBilanAnnuelDto with camelCase
   * @param entities - The array of database entities with snake_case properties
   * @returns The array of AgrementBilanAnnuelDto with camelCase properties
   */
  toModels: (
    entities: AgrementBilanAnnuelEntity[],
  ): AgrementBilanAnnuelDto[] => {
    return entities.map((entity) => AgrementBilanAnnuelMapper.toModel(entity));
  },
};

export const BilanHebergementMapper = {
  /**
   * Convert a database row with snake_case to a BilanHebergementDto with camelCase
   * @param entity - The database entity with snake_case properties
   * @returns The BilanHebergementDto with camelCase properties
   */
  toModel: (entity: BilanHebergementEntity): BilanHebergementDto => {
    return {
      adresseId: entity.adresse_id,
      agrBilanAnnuelId: entity.agr_bilan_annuel_id,
      mois: entity.mois,
      nbJours: entity.nb_jours,
      nomHebergement: entity.nom_hebergement,
    };
  },
  /**
   * Convert an array of database rows with snake_case to an array of BilanHebergementDto with camelCase
   * @param entities - The array of database entities with snake_case properties
   * @returns The array of BilanHebergementDto with camelCase properties
   */
  toModels: (entities: BilanHebergementEntity[]): BilanHebergementDto[] => {
    return entities.map((entity) => BilanHebergementMapper.toModel(entity));
  },
};
