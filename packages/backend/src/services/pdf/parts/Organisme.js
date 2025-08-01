const RepresentantLegaux = require("./RepresentantLegaux");
const ResponsableOrganisation = require("./ResponsableOrganisation");
const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

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
    MiseEnPage.formatLine("SIRET :", organisme.personneMorale.siret),
    MiseEnPage.formatLine(
      "Raison sociale :",
      organisme.personneMorale.raisonSociale,
    ),
    MiseEnPage.formatLine(
      "Nom commercial :",
      organisme.personneMorale.nomCommercial ?? "",
    ),
    MiseEnPage.formatLine("Adresse :", organisme.personneMorale.adresse),
    MiseEnPage.formatLine("Statut :", organisme.personneMorale.statut),
    MiseEnPage.formatLine("Téléphone :", organisme.personneMorale.telephone),
    MiseEnPage.formatLine("Email :", organisme.personneMorale.email),
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
      MiseEnPage.formatLine(
        "SIRET :",
        organisme.personneMorale.etablissementPrincipal.siret,
      ),
      MiseEnPage.formatLine(
        "Raison sociale :",
        organisme.personneMorale.etablissementPrincipal.raisonSociale,
      ),
      MiseEnPage.formatLine(
        "Nom commercial :",
        organisme.personneMorale.etablissementPrincipal.nomCommercial ?? "",
      ),
      MiseEnPage.formatLine(
        "Adresse :",
        organisme.personneMorale.etablissementPrincipal.adresse,
      ),
      MiseEnPage.formatLine(
        "Téléphone :",
        organisme.personneMorale.etablissementPrincipal.telephone,
      ),
      MiseEnPage.formatLine(
        "Email :",
        organisme.personneMorale.etablissementPrincipal.email,
      ),
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
        MiseEnPage.formatLine(
          "Nom :",
          organisme.personnePhysique.nomUsage ??
            organisme.personnePhysique.nomNaissance,
        ),
        MiseEnPage.formatLine("Prénom :", organisme.personnePhysique.prenom),
        MiseEnPage.formatLine(
          "SIRET :",
          organisme.personnePhysique.siret ?? "",
        ),
        MiseEnPage.formatLine(
          "Téléphone :",
          organisme.personnePhysique.telephone ?? "",
        ),
        MiseEnPage.formatLine(
          "Profession :",
          organisme.personnePhysique.profession,
        ),
        MiseEnPage.formatLine(
          "Adresse de domicile :",
          organisme.personnePhysique.adresseDomicile.label,
        ),
        MiseEnPage.formatLine(
          "Adresse de domicile :",
          organisme.personnePhysique.adresseDomicile.label,
        ),
        organisme.personnePhysique.adresseIdentique
          ? MiseEnPage.formatLine(
              "Adresse du lieu d’exercice des activités de VAO est celle du domicile :",
              "Oui",
            )
          : MiseEnPage.formatLine(
              "Adresse du siège :",
              organisme.personnePhysique.adresseSiege.label,
            ),

        ResponsableOrganisation(responsableSejour),
      ],
    };
  }
};
