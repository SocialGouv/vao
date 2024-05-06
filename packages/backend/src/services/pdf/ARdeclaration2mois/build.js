const PdfPrinter = require("pdfmake");
const path = require("path");
const dayjs = require("dayjs");
const logger = require("../../../utils/logger");

const log = logger(module.filename);

const fonts = {
  Marianne: {
    bold: path.join(__dirname, "..", "..", "../fonts/Marianne-Bold.woff"),
    italics: path.join(
      __dirname,
      "..",
      "..",
      "../fonts/Marianne-Light_Italic.woff",
    ),
    normal: path.join(__dirname, "..", "..", "../fonts/Marianne-Regular.woff"),
  },
};

const printer = new PdfPrinter(fonts);

function buildHeader() {
  return {
    columns: [
      {
        stack: [
          {
            alignment: "left",
            image: path.join(__dirname, "..", "..", "../images/logo.png"),
            width: 80,
          },
        ],
      },
    ],
    margin: [10, 10, 10, 10],
  };
}

function buildTitre(declaration, departementSuivi) {
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
                    text: `ACCUSE DE RECEPTION POUR LA DECLARATION PREALABLE ${declaration.idFonctionnelle}`,
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
            stack: [
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
            ],
            width: "100%",
          },
        ],
        margin: [0, 10, 0, 0],
      },
      {
        text: "\n\n\n",
      },
    ],
  };
}

const build = (declaration = {}) => {
  log.i("build - IN");
  const departementSuivi = declaration.departementSuivi;
  return new Promise((resolve) => {
    const docDefinition = {
      content: [
        buildHeader(),
        buildTitre(declaration, departementSuivi),
        {
          style: "header",
          text: `Vous êtes titulaire de l’agrément « VACANCES ADAPTEES ORGANISEES » délivré le ${dayjs(declaration.organisme.agrement.dateObtention).format("DD/MM/YYYY")} et avez déposé à ce titre, en date du ${dayjs().format("DD/MM/YYYY")}, une déclaration pour le séjour '${declaration.libelle}', enregistrée sous le numéro ${declaration.idFonctionnelle}, que vous organisez du ${dayjs(declaration.dateDebut).format("DD/MM/YYYY")} au ${dayjs(declaration.dateFin).format("DD/MM/YYYY")}.\n\n`,
        },
        {
          style: "header",
          text: `Nous accusons ce jour, le ${dayjs().format("DD/MM/YYYY")}, réception de votre déclaration.\n\n`,
        },
        {
          style: "header",
          text: "Vous devrez, huit jours avant le déroulement de ce séjour, renseigner la déclaration complémentaire prévue à l’article R. 412-14 du code du tourisme.",
        },
      ],
      defaultStyle: {
        font: "Marianne",
        fontSize: 9,
      },
      footer: function (currentPage, pageCount) {
        return [
          {
            alignment: "right",
            margin: [5, 5, 15, 5],
            text: `${currentPage.toString()}/${pageCount}`,
          },
        ];
      },
      pageBreakBefore: function (currentNode) {
        return currentNode.headlineLevel === 1;
      },
      style: {
        header: {
          alignment: "justify",
          font: "Marianne",
          fontSize: 9,
        },
      },
    };

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

module.exports = build;
