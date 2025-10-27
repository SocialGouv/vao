const PdfPrinter = require("pdfmake");

const path = require("path");
const logger = require("../../../utils/logger");
const parts = require("../parts");

const root = path.resolve(__dirname, "../../../");
const FONT_PATH = path.join(root, "fonts");

const typeCerfaDS2M = "CERFA_12672_04";

const log = logger(module.filename);

const fonts = {
  Marianne: {
    bold: path.join(FONT_PATH, "Marianne-Bold.woff"),
    italics: path.join(FONT_PATH, "Marianne-Light_Italic.woff"),
    normal: path.join(FONT_PATH, "Marianne-Regular.woff"),
  },
};

const printer = new PdfPrinter(fonts);

const build = async (declaration = {}, departementSuivi) => {
  log.i("build - IN");
  const docDefinition = {
    content: [
      parts.Header(typeCerfaDS2M),
      parts.Titre(declaration, departementSuivi),
      await parts.Agrement(declaration.organisme.agrement),
      parts.InformationsGenerales(declaration),
      {
        headlineLevel: 1,
        stack: [parts.Header(typeCerfaDS2M)],
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
        stack: [parts.Header(typeCerfaDS2M)],
      },
      parts.InformationsSanitaires(declaration.informationsSanitaires),
      {
        headlineLevel: 1,
        stack: [parts.Header(typeCerfaDS2M)],
      },
      ...(await parts.FicheAnnexe(declaration.hebergement)),
      {
        headlineLevel: 1,
        stack: [parts.Header(typeCerfaDS2M)],
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
