import type { DocumentCategory } from "../types/document";
import { DroitsGroup } from "./droits";
import { Tables } from "./tables";

const CategoryKeys = {
  AR_declaration_2_mois: "AR_declaration_2_mois",
  AR_declaration_8_jours: "AR_declaration_8_jours",
  agrement: "agrement",
  arrete_autorisation_maire: "arrete_autorisation_maire",
  attestation_securite: "attestation_securite",
  declaration_2_mois: "declaration_2_mois",
  declaration_8jours: "declaration_8jours",
  eig: "eig",
  message: "message",
  protocole_sanitaire: "protocole_sanitaire",
  protocole_transport: "protocole_transport",
  reponse_explouprop: "reponse_explouprop",
};

const CategoryColumn = {
  file: "file",
  files: "files",
};

const categories: DocumentCategory[] = [
  {
    column: CategoryColumn.files,
    droit: DroitsGroup.demande_sejour,
    key: CategoryKeys.AR_declaration_2_mois,
    table: Tables.demande_sejour,
    value: CategoryKeys.AR_declaration_2_mois,
  },
  {
    droit: DroitsGroup.demande_sejour,
    key: CategoryKeys.AR_declaration_8_jours,
    table: Tables.demande_sejour,
    value: CategoryKeys.AR_declaration_8_jours,
  },
  {
    droit: DroitsGroup.agrement,
    key: CategoryKeys.agrement,
    table: Tables.agrements,
    value: CategoryKeys.agrement,
  },
  {
    droit: DroitsGroup.hebergement,
    key: CategoryKeys.arrete_autorisation_maire,
    table: Tables.hebergement,
    value: CategoryKeys.arrete_autorisation_maire,
  },
  {
    droit: DroitsGroup.hebergement,
    key: CategoryKeys.attestation_securite,
    table: Tables.hebergement,
    value: CategoryKeys.attestation_securite,
  },
  {
    droit: DroitsGroup.demande_sejour,
    key: CategoryKeys.declaration_2_mois,
    table: Tables.demande_sejour,
    value: CategoryKeys.declaration_2_mois,
  },
  {
    droit: DroitsGroup.demande_sejour,
    key: CategoryKeys.declaration_8jours,
    table: Tables.demande_sejour,
    value: CategoryKeys.declaration_8jours,
  },
  {
    droit: DroitsGroup.eig,
    key: CategoryKeys.eig,
    table: Tables.eig,
    value: CategoryKeys.eig,
  },
  {
    droit: DroitsGroup.demande_sejour,
    key: CategoryKeys.message,
    table: Tables.message,
    value: CategoryKeys.message,
  },
  {
    droit: DroitsGroup.agrement,
    key: CategoryKeys.protocole_sanitaire,
    table: Tables.org_protocole_sanitaire_files,
    value: CategoryKeys.protocole_sanitaire,
  },
  {
    droit: DroitsGroup.agrement,
    key: CategoryKeys.protocole_transport,
    table: Tables.org_protocole_transport_files,
    value: CategoryKeys.protocole_transport,
  },
  {
    droit: DroitsGroup.hebergement,
    key: CategoryKeys.reponse_explouprop,
    table: Tables.hebergement,
    value: CategoryKeys.reponse_explouprop,
  },
];

const categoriesByKey = Object.fromEntries(
  categories.map((cat: DocumentCategory) => [cat.key, cat]),
);

function getCategory(key: DocumentCategory["key"]) {
  console.log("categoriesByKey", key);
  return categoriesByKey[key] || null;
}
/*
function getTable(key) {
  return categoriesByKey[key]?.table || null;
}
*/
function getCategoriesByTable(table: DocumentCategory["table"]) {
  return categories.filter((cat) => cat.table === table);
}

module.exports = {
  CategoryKeys,
  categories,
  getCategoriesByTable,
  getCategory,
  //getTable,
};
