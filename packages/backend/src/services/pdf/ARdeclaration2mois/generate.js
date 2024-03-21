const dayjs = require("dayjs");
const logger = require("../../../utils/logger");
const build = require("./build");
const DemandeSejour = require("../../DemandeSejour");
const Document = require("../../Document");

const log = logger(module.filename);

const generate = async (declaration, idFonctionnelle, departementSuivi) => {
  log.i("IN");
  try {
    // générer document
    const buffer = await build(declaration ?? {}, departementSuivi);

    // insert document.certificate
    const uuid = await Document.createFile(
      `AR_${idFonctionnelle}.pdf`,
      "AR_declaration_2_mois",
      "application/pdf",
      buffer,
    );
    log.d(`http://localhost:3010/documents/${uuid}`);

    const files = declaration.files?.files ?? [];
    const fileToAdd = {
      createdAt: dayjs().format(),
      name: `${idFonctionnelle}.pdf`,
      type: "AR_declaration_2_mois",
      uuid,
    };
    files.push(fileToAdd);
    await DemandeSejour.addFile(declaration.id, { files });
    return uuid;
  } catch (e) {
    log.w(e);
    return null;
  }
};

module.exports = generate;
