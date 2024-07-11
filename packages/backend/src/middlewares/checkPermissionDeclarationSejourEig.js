const {
  checkPermissionDeclarationSejourUtils,
} = require("./utils/checkPermissionDeclarationSejour");

async function checkPermissionDeclarationSejourForEig(req, res, next) {
  const { id: userId } = req.decoded;
  const demandeSejourId = req.body.parametre.demandeSejourId;

  if (!demandeSejourId) {
    return next();
  }
  return checkPermissionDeclarationSejourUtils(userId, demandeSejourId, next);
}

module.exports = checkPermissionDeclarationSejourForEig;
