const Sentry = require("@sentry/node");

/* eslint-disable no-param-reassign */
const logger = require("../../../utils/logger");
const build = require("./build");
const Document = require("../../Document");
const DemandeSejour = require("../../DemandeSejour");
const dayjs = require("dayjs");

const log = logger(module.filename);

const generate = async (
  declaration,
  idFonctionnelle,
  departementSuivi,
  dateDeposeA2mois,
) => {
  log.i("IN");
  try {
    // générer document
    const buffer = await build(
      declaration ?? {},
      departementSuivi,
      dateDeposeA2mois,
    );

    // insert into documents table
    const uuid = await Document.createFile(
      `${idFonctionnelle}_8jours.pdf`,
      "declaration_8jours",
      "application/pdf",
      buffer,
    );
    log.d(`http://localhost:3010/documents/${uuid}`);

    // insert into demande_sejour table
    if (declaration.files === null || declaration.files === undefined) {
      declaration.files = { files: [] };
    } else if (
      declaration.files.files === null ||
      declaration.files?.files === undefined
    ) {
      declaration.files.files = [];
    }
    const files = declaration.files.files;
    const fileToAdd = {
      createdAt: dayjs().format(),
      name: `${idFonctionnelle}_8jours.pdf`,
      type: "declaration_8jours",
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

module.exports = async (
  declaration,
  idFonctionnelle,
  departementSuivi,
  dateDeposeA2mois,
) => {
  return await Sentry.startSpan(
    { name: "services.pdf.declaration8jours.generate" },
    async () => {
      return await generate(
        declaration,
        idFonctionnelle,
        departementSuivi,
        dateDeposeA2mois,
      );
    },
  );
};
