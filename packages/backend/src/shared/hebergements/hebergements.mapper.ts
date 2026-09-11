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

const required = <T>(value: T | null | undefined, field: string): T => {
  if (value === null || value === undefined) {
    throw new Error(`Champ requis manquant lors du mapping: ${field}`);
  }
  return value;
};

export const SiteMapper = {
  toModel: (entity: SiteEntity): SiteDto => {
    return {
      adresseId: entity.adresse_id ?? null,
      createdAt: required(entity.created_at, "site.created_at"),
      createdBy: entity.created_by ?? null,
      current: entity.current ?? true,
      descriptif: entity.descriptif ?? null,
      editedAt: entity.edited_at ?? null,
      editedBy: entity.edited_by ?? null,
      hebergementTypeId: entity.hebergement_type_id ?? null,
      id: required(entity.id, "site.id"),
      nomSiteOfficiel: entity.nom_site_officiel ?? null,
      siteId: required(entity.site_id, "site.site_id"),
    };
  },
  toModels: (entities: SiteEntity[]): SiteDto[] => {
    return entities.map((entity) => SiteMapper.toModel(entity));
  },
};

export const SiteOrganismeMapper = {
  toModel: (entity: SiteOrganismeEntity): SiteOrganismeDto => {
    return {
      deplacementProximiteDescription:
        entity.deplacement_proximite_description ?? null,
      excursionDescription: entity.excursion_description ?? null,
      nomSite: entity.nom_site ?? null,
      organismeId: required(entity.organisme_id, "site_organisme.organisme_id"),
      respEmail: entity.resp_email ?? null,
      respNomPrenom: entity.resp_nom_prenom ?? null,
      respTelephone: entity.resp_telephone ?? null,
      siteId: required(entity.site_id, "site_organisme.site_id"),
      vehiculesAdaptes: entity.vehicules_adaptes ?? null,
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
      createdAt: required(entity.created_at, "unite_hebergement.created_at"),
      createdBy: entity.created_by ?? null,
      current: entity.current ?? true,
      editedAt: required(entity.edited_at, "unite_hebergement.edited_at"),
      editedBy: entity.edited_by ?? null,
      fileDernierArreteAutorisationMaire:
        entity.file_dernier_arrete_autorisation_maire ?? null,
      fileDerniereAttestationSecurite:
        entity.file_derniere_attestation_securite ?? null,
      fileReponseExploitantOuProprietaire:
        entity.file_reponse_exploitant_ou_proprietaire ?? null,
      hebergementId: required(
        entity.hebergement_id,
        "unite_hebergement.hebergement_id",
      ),
      id: required(entity.id, "unite_hebergement.id"),
      litsSuperposes: entity.lits_superposes ?? null,
      nombreCouchageTotal: entity.nombre_couchage_total ?? null,
      organismeId: required(
        entity.organisme_id,
        "unite_hebergement.organisme_id",
      ),
      rangementIndividuel: entity.rangement_individuel ?? null,
      reglementationErp: entity.reglementation_erp ?? null,
      separationHommeFemme: entity.separation_homme_femme ?? null,
      siteId: required(entity.site_id, "unite_hebergement.site_id"),
      statutId: entity.statut_id ?? null,
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
