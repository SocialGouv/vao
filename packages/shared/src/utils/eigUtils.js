import { Categorie, Types } from "../models/eig";
import dayjs from "dayjs";

const getTagSejourLibelle = (demandeSejour) =>
  `${demandeSejour.idFonctionnelle} - ${demandeSejour.libelle} - ${dayjs(demandeSejour.dateDebut).format("DD/MM/YYYY")} - ${dayjs(demandeSejour.dateFin).format("DD/MM/YYYY")}`;

const mapEigToLabel = {
  [Types[Categorie.VICTIMES].VIOLENCES_SEXUELLES]: "Violences sexuelles",
  [Types[Categorie.VICTIMES].VIOLS]: "Viols",
  [Types[Categorie.VICTIMES].VIOLENCES_PSYCHOLOGIQUES_ET_MORALES]:
    "Violences psychologiques et morales",
  [Types[Categorie.VICTIMES].VIOLENCES_PHYSIQUES]: "Violences physiques",
  [Types[Categorie.VICTIMES].NON_RESPECT_PRESCRIPTION_MEDICALE]:
    "Non respect de la prescription médicale",
  [Types[Categorie.VICTIMES].PRIVATION_DE_DROIT]: "Privation de droit",
  [Types[Categorie.VICTIMES].NEGLIGENCE_GRAVE_OU_ERREURS_SUCCESSIVES]:
    "Négligence grave ou erreurs successives",
  [Types[Categorie.VICTIMES].MALTRAITANCES_NON_PRECISEES]:
    "Maltraitances non précisées",
  [Types[Categorie.VICTIMES].SUICIDE]: "Suicide (suspecté ou avéré)",
  [Types[Categorie.VICTIMES].TENTATIVE_DE_SUICIDE]: "Tentative de suicide",
  [Types[Categorie.VICTIMES].AUTRE]: "Autre, à préciser",
  [Types[Categorie.SANTE].EPIDEMIE]: "Epidémie",
  [Types[Categorie.SANTE].ACCIDENT_CORPOREL]: "Accident corporel (chute, etc…)",
  [Types[Categorie.SANTE].AUTRE]: "Autre, à préciser",
  [Types[Categorie.SECURITE].VOLS]: "Vols",
  [Types[Categorie.SECURITE].FUGUE]: "Fugue",
  [Types[Categorie.SECURITE].ACTES_DE_MALVEILLANCE]: "Actes de malveillance",
  [Types[Categorie.SECURITE].INTOXICATION_ALIMENTAIRE]:
    "Intoxication alimentaire",
  [Types[Categorie.SECURITE].DEPART_DE_FEU]: "Départ de feu",
  [Types[Categorie.SECURITE].INCENDIE]: "Incendie",
  [Types[Categorie.SECURITE].INONDATION]: "Inondation",
  [Types[Categorie.SECURITE].AUTRE]: "Autre, à préciser",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME]
    .PROCEDURES_JUDICIAIRES_CONTRE_LE_PERSONNELS]:
    "Procédures judiciaires à l’encontre de personnels",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME].DEFAILLANCE_DE_PERSONNELS]:
    "Défaillance de personnels",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME].DEFAILLANCES_TECHNIQUES]:
    "Défaillances techniques",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME]
    .CONFLITS_OU_MENACES_DE_CONFLITS_INTERNES]:
    "Conflits ou menaces de conflits internes",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME].AUTRE]: "Autre, à préciser",
};

export { getTagSejourLibelle, mapEigToLabel };
