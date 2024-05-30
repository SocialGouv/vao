import { getMonth } from "date-fns/getMonth";
import { formatDate } from "date-fns/format";

/*  Sur l'espace admin, le status BROUILLON ne sera jamais vu,
il ne fait donc pas parti de la liste des status possibles*/
const statuts = {
  TRANSMISE: "TRANSMISE",
  EN_COURS: "EN COURS",
  A_MODIFIER: "A MODIFIER",
  ATTENTE_8_JOUR: "EN ATTENTE DECLARATION 8 JOURS",
  TRANSMISE_8J: "TRANSMISE 8J",
  VALIDEE: "VALIDEE",
  REFUSEE: "REFUSEE",
  MAJ_POST_8J: "MAJ POST 8J",
};

const getSaison = (demande) => {
  if (demande?.dateDebut) {
    const moisDebut = getMonth(demande.dateDebut);
    if (moisDebut < 3) return "Hiver";
    if (moisDebut < 6) return "Printemps";
    if (moisDebut < 9) return "Eté";
    if (moisDebut < 12) return "Automne";
  }
};

const isDeclaration8Jours = (statut) =>
  [
    statuts.ATTENTE_8_JOUR,
    statuts.TRANSMISE_8J,
    statuts.VALIDEE,
    statuts.REFUSEE,
  ].includes(statut);

const getOrganismeTitle = (demande) => {
  if (demande.typeOrganisme === "personne_physique") {
    return `${demande.personnePhysique.prenom} ${demande.personnePhysique.nomUsage ?? demande.personnePhysique.nomNaissance}`;
  }

  if (demande.typeOrganisme === "personne_morale") {
    return demande.personneMorale.raisonSociale;
  }
};

const getDateDebutFin = (demande) =>
  `${formatDate(demande.dateDebut, "dd/MM/yyyy")} - ${formatDate(demande.dateFin, "dd/MM/yyyy")}`;

export default {
  statuts,
  getSaison,
  getOrganismeTitle,
  getDateDebutFin,
  isDeclaration8Jours,
};
