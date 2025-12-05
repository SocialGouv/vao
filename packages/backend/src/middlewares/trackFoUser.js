const { TRACKING_ACTIONS } = require("@vao/shared-bridge");
const foUser = require("../services/User");

function trackFoUser({ action, userType, itself }) {
  return async (req, res, next) => {
    const { id: userId } = req.decoded;

    const foUserId = itself ? userId : req.params.userId;
    let oldUser = null;
    if (action !== TRACKING_ACTIONS.creation) {
      oldUser = await foUser.getByUserId(foUserId);
    }

    res.on("finish", async () => {
      if (res.statusMessage !== "OK") {
        return null;
      }

      let newUser = null;
      const id =
        action === TRACKING_ACTIONS.creation ? req.tracking.id : foUserId;

      if (action !== TRACKING_ACTIONS.deletion) {
        newUser = await foUser.getByUserId(id);
      }
      if (foUserId) {
        foUser.addAsyncUserHistoric({
          action,
          data: { newData: newUser, olData: oldUser },
          foUserId: id,
          userId,
          userType,
        });
      }
    });

    next();
  };
}

module.exports = trackFoUser;
