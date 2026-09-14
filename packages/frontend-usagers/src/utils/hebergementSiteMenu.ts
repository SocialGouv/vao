const menus = [
  {
    id: "site-coordonnees",
    text: "Localisation",
  },
  {
    id: "site-info-lieu",
    text: "Informations principales",
  },
  {
    id: "site-hebergement-detail",
    text: "Détails de l’hébergement",
  },
  {
    id: "site-visite-et-transport",
    text: "Visite et transport",
  },
  {
    id: "site-verification",
    text: "Vérification",
  },
];

const titleStart = "Ajouter un nouvel hébergement | ";
const titleEnd = " | Vacances Adaptées Organisées";
const getCurrentStepNumber = (key: string) => {
  return menus.findIndex((m) => m.id === key) + 1;
};

const titles = () => {
  const stepNumber = menus.length;
  const titlesMap: Record<string, string> = {};
  menus.forEach((menu) => {
    titlesMap[`#${menu.id}`] =
      titleStart +
      `étape ${getCurrentStepNumber(menu.id)} sur ${stepNumber} | ${menu.text}` +
      titleEnd;
  });
  return titlesMap;
};

export default { menus, titles };
