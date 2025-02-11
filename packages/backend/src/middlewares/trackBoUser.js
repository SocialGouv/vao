const { actions } = require("../helpers/tracking");
const boUser = require("../services/BoUser");

function trackFoUser({ action, userType, itself }) {
  return async (req, res, next) => {
    const { id: userId } = req.decoded;

    const boUserId = itself ? userId : req.params.userId;

    let oldUser = null;
    if (action !== actions.creation) {
      oldUser = await boUser.getByUserId(boUserId);
    }
    res.on("finish", async () => {
      if (res.statusMessage !== "OK") {
        return null;
      }

      let newUser = null;
      const id = action === actions.creation ? req.tracking.id : boUserId;

      if (action !== actions.deletion) {
        newUser = await boUser.getByUserId(id);
      }

      boUser.addAsyncUserHistoric({
        action,
        boUserId: id,
        data: { newData: newUser, olData: oldUser },
        userId,
        userType,
      });
    });

    next();
  };
}

module.exports = trackFoUser;
