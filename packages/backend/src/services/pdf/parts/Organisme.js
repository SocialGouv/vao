const RepresentantLegaux = require("./RepresentantLegaux");
const ResponsableOrganisation = require("./ResponsableOrganisation");

function handleOrganismes(organisme) {
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
    {
      columns: [
        {
          text: "SIRET :",
          width: 250,
        },
        {
          bold: true,
          text: `${organisme.personneMorale.siret}`,
          width: "*",
        },
      ],
    },
    {
      columns: [
        {
          text: "Raison sociale :",
          width: 250,
        },
        {
          bold: true,
          text: `${organisme.personneMorale.raisonSociale}`,
          width: "*",
        },
      ],
    },
    {
      columns: [
        {
          text: "Nom commercial :",
          width: 250,
        },
        {
          bold: true,
          text: `${organisme.personneMorale.nomCommercial ?? ""}`,
          width: "*",
        },
      ],
    },
    {
      columns: [
        {
          text: "Adresse :",
          width: 250,
        },
        {
          bold: true,
          text: `${organisme.personneMorale.adresse}`,
          width: "*",
        },
      ],
    },
    {
      columns: [
        {
          text: "Statut :",
          width: 250,
        },
        {
          bold: true,
          text: `${organisme.personneMorale.statut}`,
          width: "*",
        },
      ],
    },
    {
      columns: [
        {
          text: "Téléphone :",
          width: 250,
        },
        {
          bold: true,
          text: `${organisme.personneMorale.telephone}`,
          width: "*",
        },
      ],
    },
    {
      columns: [
        {
          text: "Email :",
          width: 250,
        },
        {
          bold: true,
          text: `${organisme.personneMorale.email}`,
          width: "*",
        },
      ],
    },
  ];
  if (!organisme.personneMorale.porteurAgrement) {
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
      {
        columns: [
          {
            text: "SIRET :",
            width: 250,
          },
          {
            bold: true,
            text: `${organisme.personneMorale.etablissementPrincipal.siret}`,
            width: "*",
          },
        ],
      },
      {
        columns: [
          {
            text: "Raison sociale :",
            width: 250,
          },
          {
            bold: true,
            text: `${organisme.personneMorale.etablissementPrincipal.raisonSociale}`,
            width: "*",
          },
        ],
      },
      {
        columns: [
          {
            text: "Nom commercial :",
            width: 250,
          },
          {
            bold: true,
            text: `${organisme.personneMorale.etablissementPrincipal.nomCommercial ?? ""}`,
            width: "*",
          },
        ],
      },
      {
        columns: [
          {
            text: "Adresse :",
            width: 250,
          },
          {
            bold: true,
            text: `${organisme.personneMorale.etablissementPrincipal.adresse}`,
            width: "*",
          },
        ],
      },
      {
        columns: [
          {
            text: "Téléphone :",
            width: 250,
          },
          {
            bold: true,
            text: `${organisme.personneMorale.etablissementPrincipal.telephone}`,
            width: "*",
          },
        ],
      },
      {
        columns: [
          {
            text: "Email :",
            width: 250,
          },
          {
            bold: true,
            text: `${organisme.personneMorale.etablissementPrincipal.email}`,
            width: "*",
          },
        ],
      },
      {
        columns: [],
        margin: [0, 0, 0, 20],
      },
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
      stack: stack,
    };
  } else {
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
        {
          columns: [
            {
              text: "Nom :",
              width: 250,
            },
            {
              bold: true,
              text: `${organisme.personnePhysique.nomUsage ?? organisme.personnePhysique.nomNaissance}`,
              width: "*",
            },
          ],
        },
        {
          columns: [
            {
              text: "Prénom :",
              width: 250,
            },
            {
              bold: true,
              text: `${organisme.personnePhysique.prenom}`,
              width: "*",
            },
          ],
        },
        {
          columns: [
            {
              text: "Téléphone :",
              width: 250,
            },
            {
              bold: true,
              text: `${organisme.personnePhysique.telephone}`,
              width: "*",
            },
          ],
        },
        {
          columns: [
            {
              text: "Profession :",
              width: 250,
            },
            {
              bold: true,
              text: `${organisme.personnePhysique.profession}`,
              width: "*",
            },
          ],
        },
        {
          columns: [
            {
              text: "Adresse de domicile :",
              width: 250,
            },
            {
              bold: true,
              text: `${organisme.personnePhysique.adresseDomicile.label}`,
              width: "*",
            },
          ],
        },
        {
          columns: organisme.personnePhysique.adresseIdentique
            ? [
                {
                  text: "Adresse du lieu d’exercice des activités de VAO est celle du domicile :",
                  width: 250,
                },
                {
                  bold: true,
                  text: "Oui",
                  width: "*",
                },
              ]
            : [
                {
                  text: "Adresse du siège :",
                  width: 250,
                },
                {
                  bold: true,
                  text: `${organisme.personnePhysique.adresseSiege.label}`,
                  width: "*",
                },
              ],
        },

        ResponsableOrganisation(responsableSejour),
      ],
    };
  }
};
