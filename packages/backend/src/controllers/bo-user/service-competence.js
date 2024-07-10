const logger = require("../../utils/logger");
const { competence } = require("../../helpers/bo-competence");

const log = logger(module.filename);

module.exports = async function serviceCompetence(territoireCode) {
  try {
    log.i("IN"), territoireCode;
    log.i("DONE");
    return territoireCode === "FRA"
      ? "NAT"
      : /^[0-9]+$/.test(territoireCode)
        ? "DEP"
        : "REG";
  } catch (error) {
    log.w("DONE with error");
    return error;
  }
};

module.exports = async function verifyCompetence(
  serviceCompetentUserConnected,
  serviceCompetentUtilisateurCreateOrUpdate,
) {
  return (
    serviceCompetentUserConnected === competence.NATIONALE ||
    (serviceCompetentUtilisateurCreateOrUpdate != competence.NATIONALE &&
      serviceCompetentUserConnected === competence.REGIONALE) ||
    (serviceCompetentUtilisateurCreateOrUpdate === competence.DEPARTEMENTALE &&
      serviceCompetentUserConnected === competence.DEPARTEMENTALE)
  );
};
