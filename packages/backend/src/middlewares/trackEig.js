const { TRACKING_ACTIONS } = require("@vao/shared-bridge");
const eigService = require("../services/eig");

function trackEig({ action, userType }) {
  return async (req, res, next) => {
    const { id: userId } = req.decoded;
    const { id: eigId } = req.params;

    let oldEig = null;
    if (action !== TRACKING_ACTIONS.creation) {
      oldEig = await eigService.getByEigId(eigId);
    }

    res.on("finish", () => {
      if (res.statusMessage !== "OK") {
        return null;
      }

      let newEig = null;
      const id = action === TRACKING_ACTIONS.creation ? req.tracking.id : eigId;

      if (action !== TRACKING_ACTIONS.deletion) {
        newEig = eigService.getByEigId(id);
      }

      if (eigId) {
        eigService.addAsyncEigHistoric({
          action,
          data: { newData: newEig, olData: oldEig },
          eigId: id,
          userId,
          userType,
        });
      }
    });

    next();
  };
}

module.exports = trackEig;
