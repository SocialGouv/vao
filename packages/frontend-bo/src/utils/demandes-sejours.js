import { getMonth } from "date-fns/getMonth";

/*  Sur l'espace admin, le status BROUILLON ne sera jamais vu,
il ne fait donc pas parti de la liste des status possibles*/
const statuts = {
  TRANSMISE: "TRANSMISE",
  EN_COURS: "EN COURS",
  A_MODIFIER: "A MODIFIER",
  ATTENTE_HEBERGEMENT: "EN ATTENTE VALIDATION HEBERGEMENT",
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
const getOrganismeTitle = (demande) => {
  if (demande.type_organisme === "personne_physique") {
    return `${demande.personne_physique.prenom} ${demande.personne_physique.nomUsage ?? demande.personne_physique.nomNaissance}`;
  }

  if (demande.type_organisme === "personne_morale") {
    return demande.personne_morale.raisonSociale;
  }
};

export default { statuts, getSaison, getOrganismeTitle };
