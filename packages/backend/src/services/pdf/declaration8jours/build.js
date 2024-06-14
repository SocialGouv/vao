const PdfPrinter = require("pdfmake");

const path = require("path");
const logger = require("../../../utils/logger");
const parts = require("../parts");

const log = logger(module.filename);

const fonts = {
  Marianne: {
    bold: path.join(__dirname, "../../../fonts/Marianne-Bold.woff"),
    italics: path.join(__dirname, "../../../fonts/Marianne-Light_Italic.woff"),
    normal: path.join(__dirname, "../../../fonts/Marianne-Regular.woff"),
  },
};

const printer = new PdfPrinter(fonts);

const build = async (declaration = {}, departementSuivi, dateDeposeA2mois) => {
  log.i("build - IN");
  log.d("declaration.informationsPersonnel", declaration.informationsPersonnel);

  const docDefinition = {
    content: [
      parts.Header(),
      parts.Titre(declaration, departementSuivi, "8jours", dateDeposeA2mois),
      parts.InformationsGenerales(declaration, "8jours"),
      {
        headlineLevel: 1,
        stack: [parts.Header()],
      },
      parts.InformationsVacanciers(
        declaration.informationsVacanciers,
        "8jours",
      ),
      parts.InformationsPersonnel8jours(declaration.informationsPersonnel),
      ...(await parts.FicheAnnexe(declaration.hebergement)),
      {
        headlineLevel: 1,
        stack: [parts.Header()],
      },
      parts.Attestation(declaration.attestation),
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
  version "2.0.3"
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

module.exports = build;
