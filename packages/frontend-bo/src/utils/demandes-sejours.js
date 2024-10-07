import dayjs from "dayjs";
import { organisme } from "#imports";

/*  Sur l'espace admin, le status BROUILLON ne sera jamais vu,
il ne fait donc pas parti de la liste des status possibles*/
const statuts = {
  TRANSMISE: "TRANSMISE",
  EN_COURS: "EN COURS",
  EN_COURS_8J: "EN COURS 8J",
  A_MODIFIER: "A MODIFIER",
  A_MODIFIER_8J: "A MODIFIER 8J",
  ATTENTE_8_JOUR: "EN ATTENTE DECLARATION 8 JOURS",
  TRANSMISE_8J: "TRANSMISE 8J",
  VALIDEE_8J: "VALIDEE 8J",
  REFUSEE: "REFUSEE",
  REFUSEE_8J: "REFUSEE 8J",
  ANNULEE: "ANNULEE",
  ABANDONNEE: "ABANDONNEE",
  SEJOUR_EN_COURS: "SEJOUR EN COURS",
  TERMINEE: "TERMINEE",
};

const getSaison = (demande) => {
  if (demande?.dateDebut) {
    const moisDebut = dayjs(demande.dateDebut).month();
    if (moisDebut < 3) return "Hiver";
    if (moisDebut < 6) return "Printemps";
    if (moisDebut < 9) return "Eté";
    if (moisDebut < 12) return "Automne";
  }
  return "NC";
};

const isDeclaration8Jours = (statut) =>
  [
    statuts.TRANSMISE_8J,
    statuts.VALIDEE_8J,
    statuts.REFUSEE_8J,
    statuts.A_MODIFIER_8J,
    statuts.EN_COURS_8J,
    statuts.SEJOUR_EN_COURS,
    statuts.TERMINEE,
  ].includes(statut);

const getOrganismeTitle = (demande) => {
  if (demande.typeOrganisme === organisme.type.PERSONNE_PHYSIQUE) {
    return `${demande.personnePhysique.prenom} ${demande.personnePhysique.nomUsage ?? demande.personnePhysique.nomNaissance}`;
  }

  if (demande.typeOrganisme === organisme.type.PERSONNE_MORALE) {
    return demande.personneMorale.raisonSociale;
  }
};

const getDateDebutFin = (demande) =>
  `${dayjs(demande.dateDebut).format("DD/MM/YYYY")} - ${dayjs(demande.dateFin).format("DD/MM/YYYY")}`;

export default {
  statuts,
  getSaison,
  getOrganismeTitle,
  getDateDebutFin,
  isDeclaration8Jours,
};
