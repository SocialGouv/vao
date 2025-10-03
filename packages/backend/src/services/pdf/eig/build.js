const PdfPrinter = require("pdfmake");

const dayjs = require("dayjs");
const path = require("path");
const logger = require("../../../utils/logger");
const MiseEnPage = require("../../../helpers/declaration/mise-en-page");
const { mapEigToLabel } = require("../../../helpers/eig");

const log = logger(module.filename);

const fonts = {
  Marianne: {
    bold: path.join(__dirname, "../../../fonts/Marianne-Bold.woff"),
    italics: path.join(__dirname, "../../../fonts/Marianne-Light_Italic.woff"),
    normal: path.join(__dirname, "../../../fonts/Marianne-Regular.woff"),
  },
};

const printer = new PdfPrinter(fonts);

const build = async ({ eig, serviceRegional }) => {
  log.i("build - IN");

  const docDefinition = {
    content: [
      Header(),
      buildSignaleA({ eig, serviceRegional }),
      buildInformationSejour({ eig }),
      buildPersonnePresent({ personnel: eig?.personnel }),
      buildFaits(eig),
      {
        alignment: "center",
        bold: true,
        fontSize: 10,
        margin: [0, 10, 0, 0],
        text: `DOCUMENT CONFIDENTIEL\nUsage strictement réservé l’usage est strictement réservé à la DREETS ${serviceRegional} du lieu du siège social de l’OVA agréé et à la DDETS ${eig.departementLibelle} du lieu de séjour. \nCe document contient des informations sensibles.\nToute diffusion non autorisée est interdite.`,
      },
    ],
    defaultStyle: {
      font: "Marianne",
      fontSize: 9,
    },
    footer: function (currentPage, pageCount) {
      return {
        columns: [
          {
            alignment: "left",
            text: "Le document ne doit pas contenir des données nominatives",
          },
          {
            alignment: "right",
            text: `Edité le ${dayjs(new Date()).format("DD/MM/YYYY")} / Page ${currentPage.toString()}/${pageCount}`,
          },
        ],
        margin: [10, 10, 10, 10],
      };
    },
    pageBreakBefore: function (currentNode) {
      return currentNode.headlineLevel === 1;
    },
  };
  return new Promise((resolve) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    let result;

    pdfDoc.on("data", (chunk) => {
      chunks.push(chunk);
    });
    pdfDoc.on("end", () => {
      result = Buffer.concat(chunks);
      log.i("build - DONE");
      resolve(result);
    });
    pdfDoc.end();
  });
};
function Header() {
  return {
    columns: [
      {
        alignment: "left",
        image: path.join(__dirname, "../../../images/logo.png"),
        width: 80,
      },
      {
        alignment: "right",
        bold: true,
        fontSize: 16,
        margin: [0, 0, 0, 0],
        text: "Formulaire de remontée des \névènements indésirables graves",
      },
    ],
  };
}

function buildSignaleA({ eig, serviceRegional }) {
  const lines = [
    [
      "DDETS-PP du lieu de séjour : ",
      `${eig.departementLibelle} (${eig.departement}) [${eig.readByDdets ? "Lu" : "Non lu"} par la DDETS]`,
    ],
    [
      "DREETS (qui a procédé à la délivrance de \nl’agrément VAO de l’organisateur) :",
      `${serviceRegional} [${eig.readByDreets ? "Lu" : "Non lu"} pas la DREETS]`,
    ],
  ];

  return {
    stack: [
      entete("Signalé à "),
      {
        columns: [
          {
            alignment: "left",
            columnGap: 20,
            stack: [...MiseEnPage.buildLines(lines, { marginUp: 0 })],
          },
        ],
        margin: [0, 0, 0, 0],
      },
    ],
  };
}

function buildInformationSejour({ eig }) {
  const lines = [
    ["Organisme :", eig.raisonSociale],
    ["Déclaration :", eig.idFonctionnelle],
    ["Nom du séjour :", eig.libelle],
    [
      "Date de séjour :",
      `${dayjs(eig.dateDebut).format("DD/MM/YYYY")} - ${dayjs(eig.dateFin).format("DD/MM/YYYY")}`,
    ],
    ["Saison :", eig.saison],
    [
      "Adresse du / des lieux de séjour :",
      `${eig.adresses.map((adresse) => adresse)}`,
    ],
    ["Date de l'incident : ", `${dayjs(eig.date).format("DD/MM/YYYY")}`],
  ];

  return {
    stack: [
      entete("Informations de séjour"),
      {
        columns: [
          {
            alignment: "left",
            columnGap: 10,
            stack: [...MiseEnPage.buildLines(lines, { marginUp: 0 })],
          },
        ],
        margin: [0, 0, 0, 0],
      },
      buildTypeEvenement(eig?.types),
      entete("Personnel présent lors des événements"),
    ],
  };
}

function buildFaits(eig) {
  const faits = [
    [
      "Déroulement des faits (date, heure, circonstance, etc…)",
      eig.deroulement,
    ],
    [
      "Dispositions pour remédier aux carences, abus, ou faire cesser le danger ",
      eig.dispositionRemediation,
    ],
    [
      "Dispositions prises à l'égard de la victime, et le cas échéant, de l’auteur présumé",
      eig.dispositionVictimes,
    ],
    [
      "Dispositions prises pour l’information des familles, proches ou tuteurs légaux ",
      eig.dispositionInformations,
    ],
  ];
  return {
    stack: [
      entete("Faits"),
      ...faits.flatMap((fait) => {
        const data = buildBlockFait(fait[0], fait[1]);
        return data;
      }),
    ],
  };
}
function buildBlockFait(enteteFait, texteFait) {
  return {
    margin: [0, 10, 0, 0],
    table: {
      body: [
        [
          {
            stack: [
              {
                bold: true,
                margin: [0, 0, 0, 5],
                text: enteteFait,
              },
              {
                text: texteFait,
              },
            ],
          },
        ],
      ],
    },
  };
}

function buildTypeEvenement(types = []) {
  const items = (Array.isArray(types) ? types : []).map((t) => {
    const label = mapEigToLabel[t.type];
    return t.precision ? `${label} : ${t.precision}` : `${label}`;
  });

  return {
    columnGap: 0,
    columns: [
      {
        bold: true,
        text: "type(s) d'événement(s) :",
        width: 250,
      },
      {
        stack: items.length > 0 ? [{ ul: items }] : [{ text: "" }],
        width: "*",
      },
    ],
    margin: [0, 0, 0, 0],
  };
}

function buildPersonnePresent({ personnel }) {
  return {
    stack: [
      {
        layout: {
          fillColor: function (rowIndex) {
            return rowIndex === 0 ? "#CCCCCC" : null;
          },
        },
        style: {
          fontSize: 9,
        },
        margin: [0, 10, 0, 0],
        table: {
          body: [
            ["Nom", "Prénom", "Date de naissance", "Fonctions", "Téléphone"],
            ...personnel.map((personne) => [
              personne.nom ?? "",
              personne.prenom ?? "",
              personne?.dateNaissance
                ? dayjs(personne?.dateNaissance).format("DD/MM/YYYY")
                : "",
              personne.listeFonction?.join(", "),
              personne.telephone ?? "",
            ]),
          ],
          widths: [80, 80, 60, 90, 90, 60],
        },
      },
    ],
  };
}

function entete(title) {
  return {
    margin: MiseEnPage.MARGIN_UP_30,
    table: {
      body: [
        [
          {
            alignment: "left",
            fillColor: "#000091",
            stack: [
              {
                bold: true,
                color: "#F5F5FE",
                fontSize: 10,
                text: title,
                width: "300",
              },
            ],
          },
        ],
      ],
      headerRows: 1,
      layout: ["headerLineOnly", "noBorders"],
      widths: ["*"],
    },
  };
}

module.exports = build;
