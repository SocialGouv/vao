const menus = (isSiege) => [
  {
    id: "info-generales",
    text: "Renseignements généraux sur l’organisateur VAO",
  },
  ...(isSiege
    ? [
        {
          id: "etablissement-secondaires",
          text: "Etablissements secondaires",
        },
      ]
    : []),
  {
    id: "agrement",
    text: "Agrément",
  },
  {
    id: "protocole-transport",
    text: "Informations sur le transport",
  },
  {
    id: "protocole-sanitaire",
    text: "Informations sanitaires",
  },
  {
    id: "synthese",
    text: "Synthèse",
  },
];

const titleStart = "Fiche organisateur | ";
const titleEnd = " | Vacances Adaptées Organisées";
const getCurrentStepNumber = (isSiege, key) => {
  return menus(isSiege).findIndex((m) => m.id === key) + 1;
};

const titles = (isSiege) => {
  const stepNumber = menus(isSiege).length;

  return {
    "#info-generales":
      titleStart +
      `étape ${getCurrentStepNumber(isSiege, "info-generales")} sur ${stepNumber} | Renseignements généraux sur l’organisateur VAO` +
      titleEnd,
    ...(isSiege && {
      "#etablissement-secondaires":
        titleStart +
        `étape ${getCurrentStepNumber(isSiege, "etablissement-secondaires")} sur ${stepNumber} | etablissements`,
    }),
    "#agrement":
      titleStart +
      `étape ${getCurrentStepNumber(isSiege, "agrement")} sur ${stepNumber} | Agrément` +
      titleEnd,
    "#protocole-transport":
      titleStart +
      `étape ${getCurrentStepNumber(isSiege, "protocole-transport")} sur ${stepNumber} | Informations sur le transport` +
      titleEnd,
    "#protocole-sanitaire":
      titleStart +
      `étape ${getCurrentStepNumber(isSiege, "protocole-sanitaire")} sur ${stepNumber} | Informations sanitaires` +
      titleEnd,
    "#synthese":
      titleStart +
      `étape ${getCurrentStepNumber(isSiege, "synthese")} sur ${stepNumber} | Synthèse` +
      titleEnd,
  };
};

export default { menus, titles };
