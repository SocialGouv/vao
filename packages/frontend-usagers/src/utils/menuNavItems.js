export const navItems = [
  {
    text: "Accueil",
    to: "/",
  },
  {
    title: "Organisateur",
    links: [
      {
        text: "Ma fiche organisateur",
        to: "/organisme",
      },
    ],
  },
  {
    title: "Déclaration de séjour",
    links: [
      {
        text: "Nouvelle déclaration",
        to: "/demande-sejour",
      },
      {
        text: "Mes déclarations",
        to: "/demande-sejour/liste",
      },
      {
        text: "Déclarer un incident",
        to: "#",
      },
    ],
  },
  {
    text: "Mes hébergements",
    to: "/hebergements",
  },
];
