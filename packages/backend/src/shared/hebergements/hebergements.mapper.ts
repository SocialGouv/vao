import {
  HebergementDto,
  SiteDto,
  SiteOrganismeDto,
  UniteHebergementDto,
} from "@vao/shared-bridge";

import {
  HebergementWithSiteEntity,
  SiteEntity,
  SiteOrganismeEntity,
  UniteHebergementEntity,
} from "./hebergements.entity";

export const SiteMapper = {
  toModel: (entity: SiteEntity): SiteDto => {
    return {
      adresseId: entity.adresse_id ?? null,
      createdAt: entity.created_at ?? new Date(),
      createdBy: entity.created_by ?? null,
      current: entity.current ?? true,
      descriptif: entity.descriptif ?? null,
      editedAt: entity.edited_at ?? null,
      editedBy: entity.edited_by ?? null,
      hebergementTypeId: entity.hebergement_type_id ?? null,
      id: entity.id ?? 0,
      nomSiteOfficiel: entity.nom_site_officiel ?? null,
      siteId: entity.site_id ?? "",
    };
  },
  toModels: (entities: SiteEntity[]): SiteDto[] => {
    return entities.map((entity) => SiteMapper.toModel(entity));
  },
};

export const SiteOrganismeMapper = {
  toModel: (entity: SiteOrganismeEntity): SiteOrganismeDto => {
    return {
      nomSite: entity.nom_site ?? null,
      organismeId: entity.organisme_id ?? 0,
      respEmail: entity.resp_email ?? null,
      respNomPrenom: entity.resp_nom_prenom ?? null,
      respTelephone: entity.resp_telephone ?? null,
      siteId: entity.site_id ?? "",
    };
  },
  toModels: (entities: SiteOrganismeEntity[]): SiteOrganismeDto[] => {
    return entities.map((entity) => SiteOrganismeMapper.toModel(entity));
  },
};

export const UniteHebergementMapper = {
  toModel: (entity: UniteHebergementEntity): UniteHebergementDto => {
    return {
      accessibilitePmr: entity.accessibilite_pmr ?? null,
      accessibilitePrecision: entity.accessibilite_precision ?? null,
      amenagementsSpecifiques: entity.amenagements_specifiques ?? null,
      amenagementsSpecifiquesPrecision:
        entity.amenagements_specifiques_precision ?? null,
      chambresDoubles: entity.chambres_doubles ?? null,
      couchageIndividuel: entity.couchage_individuel ?? null,
      createdAt: entity.created_at ?? new Date(),
      createdBy: entity.created_by ?? null,
      current: entity.current ?? true,
      deplacementProximiteDescription:
        entity.deplacement_proximite_description ?? null,
      editedAt: entity.edited_at ?? new Date(),
      editedBy: entity.edited_by ?? null,
      excursionDescription: entity.excursion_description ?? null,
      fileDernierArreteAutorisationMaire:
        entity.file_dernier_arrete_autorisation_maire ?? null,
      fileDerniereAttestationSecurite:
        entity.file_derniere_attestation_securite ?? null,
      fileReponseExploitantOuProprietaire:
        entity.file_reponse_exploitant_ou_proprietaire ?? null,
      hebergementId: entity.hebergement_id ?? "",
      id: entity.id ?? 0,
      litsSuperposes: entity.lits_superposes ?? null,
      nombreCouchageTotal: entity.nombre_couchage_total ?? null,
      organismeId: entity.organisme_id ?? 0,
      rangementIndividuel: entity.rangement_individuel ?? null,
      reglementationErp: entity.reglementation_erp ?? null,
      separationHommeFemme: entity.separation_homme_femme ?? null,
      siteId: entity.site_id ?? "",
      statutId: entity.statut_id ?? null,
      vehiculesAdaptes: entity.vehicules_adaptes ?? null,
      visiteLocaux: entity.visite_locaux ?? null,
      visiteLocauxAt: entity.visite_locaux_at ?? null,
    };
  },
  toModels: (entities: UniteHebergementEntity[]): UniteHebergementDto[] => {
    return entities.map((entity) => UniteHebergementMapper.toModel(entity));
  },
};

export const HebergementWithSiteMapper = {
  toModel: (entity: HebergementWithSiteEntity): HebergementDto | null => {
    if (!entity.id) return null;
    return {
      coordonnees: {
        adresse: null,
        email: null,
        nomGestionnaire: null,
        numTelephone1: null,
        numTelephone2: null,
      },
      id: entity.id,
      informationsLocaux: {
        accessibilite: null,
        accessibilitePrecision: null,
        amenagementsSpecifiques: null,
        chambresDoubles: null,
        chambresUnisexes: null,
        couchageIndividuel: null,
        descriptionLieuHebergement: null,
        fileDernierArreteAutorisationMaire: null,
        fileDerniereAttestationSecurite: null,
        fileReponseExploitantOuProprietaire: null,
        litsDessus: null,
        nombreLits: null,
        nombreLitsSuperposes: null,
        nombreMaxPersonnesCouchage: null,
        pension: null,
        precisionAmenagementsSpecifiques: null,
        prestationsHotelieres: [],
        rangementIndividuel: null,
        reglementationErp: null,
        type: null,
        visiteLocaux: null,
        visiteLocauxAt: null,
      },
      informationsTransport: {
        deplacementProximite: null,
        excursion: null,
        vehiculesAdaptes: null,
      },
      nom: "",
      organismeId: 0,
      siteId: entity.site_id ?? null,
      statut: null,
    };
  },
};
