const {
  checkPermissionDeclarationSejourUtils,
} = require("./utils/checkPermissionDeclarationSejour");

async function checkPermissionDeclarationSejourForEig(req, res, next) {
  const { id: userId } = req.decoded;
  const declarationId = req.body.parametre.declarationId;

  if (!declarationId) {
    return next();
  }
  return checkPermissionDeclarationSejourUtils(userId, declarationId, next);
}

module.exports = checkPermissionDeclarationSejourForEig;
