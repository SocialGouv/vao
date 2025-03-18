export type RappelDSBORow = {
  id: number;
  id_fonctionnelle: string; // or number, depending on your schema
  date_debut: string; // formatted as 'DD/MM/YYYY'
  statut: string;
  titre: string;
  isalerte: boolean;
  communes: string;
  mail: string;
};

export type RappelDSFUsagerRow = {
  id: number;
  id_fonctionnelle: string;
  date_debut: string;
  statut: string;
  titre: string;
  isalerte: boolean;
  communes: string;
  mail: string;
  mailresp: string;
  mails: string;
};

export type QueryConfig = {
  statutsArray: string;
  additionalColumns?: string;
  additionalJoins?: string;
  additionalGroupBy?: string;
  additionalOrderBy?: string;
};

export type RappelRows = RappelDSBORow[] | RappelDSFUsagerRow[];
