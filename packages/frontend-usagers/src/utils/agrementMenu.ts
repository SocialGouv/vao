const menus = [
  {
    id: "agrement-coordonnees",
    text: "Coordonnées à vérifier",
  },
  {
    id: "agrement-dossier",
    text: "Dossier de candidature",
  },
  {
    id: "agrement-bilan",
    text: "Bilan des 4 années précédentes",
  },
  {
    id: "agrement-projets",
    text: "Projet de séjours envisagés pour les 12 prochains mois",
  },
  {
    id: "agrement-synthese",
    text: "Synthèse",
  },
];

const titleStart = "Agrément | ";
const titleEnd = " | Vacances Adaptées Organisées";
const getCurrentStepNumber = (key: any) => {
  return menus.findIndex((m) => m.id === key) + 1;
};

const titles = () => {
  const stepNumber = menus.length;
  return {
    "#agrement-coordonnees":
      titleStart +
      `étape ${getCurrentStepNumber("agrement-coordonnees")} sur ${stepNumber} | Coordonnées à vérifier` +
      titleEnd,
    "#agrement-dossier":
      titleStart +
      `étape ${getCurrentStepNumber("agrement-dossier")} sur ${stepNumber} | Dossier de candidature` +
      titleEnd,
    "#agrement-bilan":
      titleStart +
      `étape ${getCurrentStepNumber("agrement-bilan")} sur ${stepNumber} | Bilan des 4 années précédentes` +
      titleEnd,
    "#agrement-projets":
      titleStart +
      `étape ${getCurrentStepNumber("agrement-projets")} sur ${stepNumber} | Projet de séjours envisagés pour les 12 prochains mois` +
      titleEnd,
    "#agrement-synthese":
      titleStart +
      `étape ${getCurrentStepNumber("agrement-synthese")} sur ${stepNumber} | Synthèse` +
      titleEnd,
  };
};

export default { menus, titles };
