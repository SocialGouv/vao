import { DeclarationSejour } from "#imports";
export default [
  {
    id: "info-generales",
    text: "Informations générales",
    statutsMasques: [],
  },
  {
    id: "info-vacanciers",
    text: "Informations sur les vacanciers",
    statutsMasques: [],
  },
  {
    id: "info-personnel",
    text: "Informations sur le personnel",
    statutsMasques: [],
  },
  {
    id: "projet-sejour",
    text: "Projet de séjour",
    statutsMasques: [
      DeclarationSejour.statuts.ATTENTE_8_JOUR,
      DeclarationSejour.statuts.MAJ_POST_8J,
      DeclarationSejour.statuts.TRANSMISE_8J,
    ],
  },
  {
    id: "info-transport",
    text: "Informations sur le transport",
    statutsMasques: [
      DeclarationSejour.statuts.ATTENTE_8_JOUR,
      DeclarationSejour.statuts.MAJ_POST_8J,
      DeclarationSejour.statuts.TRANSMISE_8J,
    ],
  },
  {
    id: "info-sanitaires",
    text: "Informations sanitaires",
    statutsMasques: [
      DeclarationSejour.statuts.ATTENTE_8_JOUR,
      DeclarationSejour.statuts.MAJ_POST_8J,
      DeclarationSejour.statuts.TRANSMISE_8J,
    ],
  },
  {
    id: "hebergements",
    text: "Sélection des hébergements",
    statutsMasques: [],
  },
  {
    id: "synthese",
    text: "Synthèse",
    statutsMasques: [],
  },
];
