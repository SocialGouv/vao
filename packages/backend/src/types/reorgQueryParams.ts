export interface QueryParams {
  limit?: number;
  offset?: number;
  search?: QueryParamsSearch;
  [key: string]: any;
}

interface QueryParamsSearch {
  siren?: string;
  siret?: string;
  dateDebut?: string | Date;
  organismeId?: number;
  idFonctionnelle?: string;
  libelle?: string;
  organisme?: string;
  statuts: string;
  action?: string[];
  statut?: string;
  messageEtat?: string;
}
