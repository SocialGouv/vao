const {
  checkPermissionDeclarationSejourUtils,
} = require("./utils/checkPermissionDeclarationSejour");

async function checkPermissionDeclarationSejour(req, res, next) {
  const { id: userId } = req.decoded;
  const { declarationId } = req.params;

  return checkPermissionDeclarationSejourUtils(userId, declarationId, next);
}

//default export
module.exports = checkPermissionDeclarationSejour;
