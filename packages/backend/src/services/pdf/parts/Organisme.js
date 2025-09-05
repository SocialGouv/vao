const RepresentantLegaux = require("./RepresentantLegaux");
const ResponsableOrganisation = require("./ResponsableOrganisation");
const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

function handleOrganismes(organisme) {
  const lines = [
    ["SIRET :", organisme.personneMorale.siret],
    ["Raison sociale :", organisme.personneMorale.raisonSociale],
    ["Nom commercial :", organisme.personneMorale.nomCommercial ?? ""],
    ["Adresse :", organisme.personneMorale.adresse],
    ["Statut :", organisme.personneMorale.statut],
    ["Téléphone :", organisme.personneMorale.telephone],
    ["Email :", organisme.personneMorale.email],
  ];

  const stack = [
    {
      columns: [
        {
          bold: true,
          decoration: "underline",
          text: organisme.personneMorale.porteurAgrement
            ? "Organisateur agréé organisant le séjour"
            : "Etablissement secondaire ou délégation locale organisant le séjour",
          width: "100%",
        },
      ],
      margin: [0, 0, 0, 10],
    },
    ...MiseEnPage.buildLines(lines, { marginUp: 0 }),
  ];

  if (!organisme.personneMorale.porteurAgrement) {
    const principalLines = [
      ["SIRET :", organisme.personneMorale.etablissementPrincipal.siret],
      [
        "Raison sociale :",
        organisme.personneMorale.etablissementPrincipal.raisonSociale,
      ],
      [
        "Nom commercial :",
        organisme.personneMorale.etablissementPrincipal.nomCommercial ?? "",
      ],
      ["Adresse :", organisme.personneMorale.etablissementPrincipal.adresse],
      [
        "Téléphone :",
        organisme.personneMorale.etablissementPrincipal.telephone,
      ],
      ["Email :", organisme.personneMorale.etablissementPrincipal.email],
    ];

    stack.unshift(
      {
        columns: [
          {
            bold: true,
            decoration: "underline",
            text: "Organisateur agréé",
            width: "100%",
          },
        ],
        margin: [0, 0, 0, 10],
      },
      ...MiseEnPage.buildLines(principalLines, { marginUp: 0 }),
      { columns: [], margin: [0, 0, 0, 20] },
    );
  }
  return stack;
}

module.exports = function displayOrganisme(responsableSejour, organisme) {
  if (organisme.typeOrganisme === "personne_morale") {
    const stack = handleOrganismes(organisme);
    stack.push(
      RepresentantLegaux(organisme.personneMorale.representantsLegaux),
      ResponsableOrganisation(responsableSejour),
    );
    return {
      columnGap: 10,
      margin: [0, 20, 0, 0],
      stack,
    };
  } else {
    const lines = [
      [
        "Nom :",
        organisme.personnePhysique.nomUsage ??
          organisme.personnePhysique.nomNaissance,
      ],
      ["Prénom :", organisme.personnePhysique.prenom],
      ["SIRET :", organisme.personnePhysique.siret ?? ""],
      ["Téléphone :", organisme.personnePhysique.telephone ?? ""],
      ["Profession :", organisme.personnePhysique.profession],
      [
        "Adresse de domicile :",
        organisme.personnePhysique.adresseDomicile.label,
      ],
      [
        organisme.personnePhysique.adresseIdentique
          ? "Adresse du lieu d’exercice des activités de VAO est celle du domicile :"
          : "Adresse du siège :",
        organisme.personnePhysique.adresseIdentique
          ? "Oui"
          : organisme.personnePhysique.adresseSiege.label,
      ],
    ];

    return {
      columnGap: 10,
      margin: [0, 20, 0, 0],
      stack: [
        {
          columns: [
            {
              bold: true,
              decoration: "underline",
              text: "Organisme :",
              width: "100%",
            },
          ],
          margin: [0, 0, 0, 10],
        },
        ...MiseEnPage.buildLines(lines),
        ResponsableOrganisation(responsableSejour),
      ],
    };
  }
};
