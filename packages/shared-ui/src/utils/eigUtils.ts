import { Categorie, Types } from "../models/eig";
import dayjs from "dayjs";

export const getTagSejourLibelle = (demandeSejour: {
  idFonctionnelle: string;
  libelle: string;
  dateDebut: string;
  dateFin: string;
}) =>
  `${demandeSejour.idFonctionnelle} - ${demandeSejour.libelle} - ${dayjs(demandeSejour.dateDebut).format("DD/MM/YYYY")} - ${dayjs(demandeSejour.dateFin).format("DD/MM/YYYY")}`;

export const mapEigToLabel = {
  [Types[Categorie.VICTIMES].VIOLENCES_SEXUELLES as string]:
    "Violences sexuelles",
  [Types[Categorie.VICTIMES].VIOLS as string]: "Viols",
  [Types[Categorie.VICTIMES].VIOLENCES_PSYCHOLOGIQUES_ET_MORALES as string]:
    "Violences psychologiques et morales",
  [Types[Categorie.VICTIMES].VIOLENCES_PHYSIQUES as string]:
    "Violences physiques",
  [Types[Categorie.VICTIMES].NON_RESPECT_PRESCRIPTION_MEDICALE as string]:
    "Non respect de la prescription médicale",
  [Types[Categorie.VICTIMES].PRIVATION_DE_DROIT as string]:
    "Privation de droit",
  [Types[Categorie.VICTIMES].NEGLIGENCE_GRAVE_OU_ERREURS_SUCCESSIVES as string]:
    "Négligence grave ou erreurs successives",
  [Types[Categorie.VICTIMES].MALTRAITANCES_NON_PRECISEES as string]:
    "Maltraitances non précisées",
  [Types[Categorie.VICTIMES].SUICIDE as string]: "Suicide (suspecté ou avéré)",
  [Types[Categorie.VICTIMES].TENTATIVE_DE_SUICIDE as string]:
    "Tentative de suicide",
  [Types[Categorie.VICTIMES].AUTRE as string]: "Autre, à préciser",
  [Types[Categorie.SANTE].EPIDEMIE as string]: "Epidémie",
  [Types[Categorie.SANTE].ACCIDENT_CORPOREL as string]:
    "Accident corporel (chute, etc…)",
  [Types[Categorie.SANTE].AUTRE]: "Autre, à préciser",
  [Types[Categorie.SECURITE].VOLS as string]: "Vols",
  [Types[Categorie.SECURITE].FUGUE as string]: "Fugue",
  [Types[Categorie.SECURITE].ACTES_DE_MALVEILLANCE as string]:
    "Actes de malveillance",
  [Types[Categorie.SECURITE].INTOXICATION_ALIMENTAIRE as string]:
    "Intoxication alimentaire",
  [Types[Categorie.SECURITE].DEPART_DE_FEU as string]: "Départ de feu",
  [Types[Categorie.SECURITE].INCENDIE as string]: "Incendie",
  [Types[Categorie.SECURITE].INONDATION as string]: "Inondation",
  [Types[Categorie.SECURITE].AUTRE as string]: "Autre, à préciser",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME]
    .PROCEDURES_JUDICIAIRES_CONTRE_LE_PERSONNELS as string]:
    "Procédures judiciaires à l’encontre de personnels",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME]
    .DEFAILLANCE_DE_PERSONNELS as string]: "Défaillance de personnels",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME].DEFAILLANCES_TECHNIQUES as string]:
    "Défaillances techniques",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME]
    .CONFLITS_OU_MENACES_DE_CONFLITS_INTERNES as string]:
    "Conflits ou menaces de conflits internes",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME].AUTRE]: "Autre, à préciser",
};
