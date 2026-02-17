import type { Action, UserType } from "@vao/shared-bridge";
import { TRACKING_ACTIONS } from "@vao/shared-bridge";
import type { NextFunction, Response } from "express";

import boUser from "../services/BoUser";
import { UserRequest } from "../types/request";

interface Tracking {
  id: number;
}

interface TrackingRequest extends UserRequest {
  tracking?: Tracking;
}

function trackFoUser({
  action,
  userType,
  itself,
}: {
  action: Action;
  userType: UserType;
  itself: boolean;
}) {
  return async (req: TrackingRequest, res: Response, next: NextFunction) => {
    const userId = req.decoded?.id;

    const boUserId = itself ? userId : req.params.userId;

    let oldUser = null;
    if (action !== TRACKING_ACTIONS.creation) {
      oldUser = await boUser.getByUserId(boUserId);
    }
    res.on("finish", async () => {
      if (res.statusMessage !== "OK") {
        return null;
      }

      let newUser = null;
      const id =
        action === TRACKING_ACTIONS.creation ? req?.tracking?.id : boUserId;

      if (action !== TRACKING_ACTIONS.deletion) {
        newUser = await boUser.getByUserId(id);
      }

      boUser.addAsyncUserHistoric({
        action,
        boUserId: id,
        data: { newData: newUser, oldData: oldUser },
        userId,
        userType,
      });
    });

    next();
  };
}

module.exports = trackFoUser;
