const PdfPrinter = require("pdfmake");

const path = require("path");
const logger = require("../../../utils/logger");
const parts = require("./parts");

const log = logger(module.filename);

const fonts = {
  Marianne: {
    bold: path.join(__dirname, "../../../fonts/Marianne-Bold.woff"),
    italics: path.join(__dirname, "../../../fonts/Marianne-Light_Italic.woff"),
    normal: path.join(__dirname, "../../../fonts/Marianne-Regular.woff"),
  },
};

const printer = new PdfPrinter(fonts);

const build = async (declaration = {}, departementSuivi) => {
  log.i("build - IN");
  const docDefinition = {
    content: [
      parts.Header(),
      parts.Titre(declaration, departementSuivi),
      await parts.Agrement(declaration.organisme.agrement),
      parts.InformationsGenerales(declaration),
      {
        headlineLevel: 1,
        stack: [parts.Header()],
      },
      parts.InformationsVacanciers(declaration.informationsVacanciers),
      parts.InformationsPersonnel(declaration.informationsPersonnel),
      parts.ProjetSejour(declaration.projetSejour),
      parts.InformationsTransport(
        declaration.informationsTransport,
        declaration.hebergement,
      ),
      {
        headlineLevel: 1,
        stack: [parts.Header()],
      },
      parts.InformationsSanitaires(declaration.informationsSanitaires),
      {
        headlineLevel: 1,
        stack: [parts.Header()],
      },
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
