const DemandeSejour = require("../services/DemandeSejour");

function trackDemandeSejour({ action, userType }) {
  return async (req, _res, next) => {
    const { id: userId } = req.decoded;
    const { parametre } = req.body;
    const { declarationId } = req.params;
    const DS = await DemandeSejour.getOne({ "ds.id": declarationId });

    DemandeSejour.addAsyncDeclarationSejourHistoric({
      action,
      data: {
        newData: parametre,
        oldData: DS,
      },
      declarationId,
      userId,
      userType,
    });

    next();
  };
}

module.exports = trackDemandeSejour;
