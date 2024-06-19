const dayjs = require("dayjs");

module.exports = function buildTitre(
  declaration,
  departementSuivi,
  type,
  dateDeposeA2mois,
) {
  const infoPrecises = [
    {
      columns: [
        {
          decoration: "underline",
          text: "Département instructeur :",
          width: 150,
        },
        {
          bold: true,
          text: `DDETS ${departementSuivi}`,
          width: 150,
        },
      ],
    },
    {
      columns: [
        {
          decoration: "underline",
          text: "Numéro d'enregistrement :",
          width: 150,
        },
        {
          bold: true,
          text: `${declaration.idFonctionnelle}`,
          width: 150,
        },
      ],
    },
    {
      columns: [
        {
          decoration: "underline",
          text: "Date de dépôt :",
          width: 150,
        },
        {
          bold: true,
          text: `${dayjs(declaration.editedAt).format("DD/MM/YYYY HH:mm")}`,
          width: 150,
        },
      ],
    },
  ];
  if (type === "8jours" && dateDeposeA2mois) {
    infoPrecises.push({
      columns: [
        {
          decoration: "underline",
          text: "Date de dépôt de la déclaration initiale :",
          width: 150,
        },
        {
          bold: true,
          text: `${dayjs(dateDeposeA2mois).format("DD/MM/YYYY") ?? ""}`,
          width: 150,
        },
      ],
    });
  }
  return {
    stack: [
      {
        alignment: "center",
        margin: [0, 30, 0, 0],
        table: {
          body: [
            [
              {
                stack: [
                  {
                    bold: true,
                    fontSize: 12,
                    text:
                      type === "8jours"
                        ? "FICHE COMPLEMENTAIRE A LA DECLARATION D'UN SEJOUR « VACANCES ADAPTEES ORGANISEES » destiné à des personnes handicapées majeures"
                        : "DECLARATION PREALABLE D'UN SEJOUR « VACANCES ADAPTEES ORGANISEES » destiné à des personnes handicapées majeures",
                  },
                  {
                    italics: true,
                    text: "Article R412-14 du code du tourisme",
                  },
                ],
              },
            ],
          ],
          headerRows: 1,
          layout: "headerLineOnly",
          widths: ["*"],
        },
      },
      {
        columnGap: 10,
        columns: [
          {
            alignment: "left",
            stack: infoPrecises,
            width: "100%",
          },
        ],
        margin: [0, 10, 0, 0],
      },
    ],
  };
};
