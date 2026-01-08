export interface PersonneMoraleDto {
  historic: {
    nom?: string | null;
    prenom?: string | null;
    updatedAt?: Date | null;
    siret?: string | null;
  }[];
  raisonSociale: string | null;
  siegeSocial: boolean | null;
  email: string | null;
  telephone: string | null;
  siren: string | null;
  siret: string;
  porteurAgrement: boolean | null;
  nomCommercial: string | null;
  statut: string | null;
  adresse: string | null;
  pays: string | null;
  responsableSejour: {
    nom?: string;
    prenom?: string;
    email?: string;
    adresse?: {
      label: string;
      cleInsee: string;
      codeInsee: string;
      codePostal: string;
    };
  };
  etablissementPrincipal: {
    siret?: string;
  };
  representantsLegaux: {
    nom: string;
    prenom: string;
    fonction: string;
  }[];
  etablissements: {
    nic: string;
    siret: string;
    adresse: string;
    commune: string;
    enabled: boolean;
    codePostal: string;
    denomination: string;
    etatAdministratif: string;
  }[];
}
