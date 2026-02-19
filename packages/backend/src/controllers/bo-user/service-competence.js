const logger = require("../../utils/logger");
const { USER_COMPETENCE_BO } = require("@vao/shared-bridge");

const log = logger(module.filename);

module.exports = async function serviceCompetence(territoireCode) {
  try {
    log.i("IN", territoireCode);
    log.i("DONE");
    return territoireCode === USER_COMPETENCE_BO
      ? USER_COMPETENCE_BO.NATIONALE
      : /^[0-9]+$/.test(territoireCode)
        ? USER_COMPETENCE_BO.DEPARTEMENTALE
        : USER_COMPETENCE_BO.REGIONALE;
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
    serviceCompetentUserConnected === USER_COMPETENCE_BO.NATIONALE ||
    (serviceCompetentUtilisateurCreateOrUpdate !=
      USER_COMPETENCE_BO.NATIONALE &&
      serviceCompetentUserConnected === USER_COMPETENCE_BO.REGIONALE) ||
    (serviceCompetentUtilisateurCreateOrUpdate ===
      USER_COMPETENCE_BO.DEPARTEMENTALE &&
      serviceCompetentUserConnected === USER_COMPETENCE_BO.DEPARTEMENTALE)
  );
};
