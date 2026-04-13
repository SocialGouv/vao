import { type AgrementMessage, USER_TYPE } from "@vao/shared-bridge";

import { AgrementsRepositoryShared } from "../../../shared/agrements/agrements.repository";
import { AgrementService } from "../../../usagers/agrements/agrements.service";

export const createAgrementMessage = async ({
  agrementId,
  userType = USER_TYPE.BO,
  agrementMessage = {},
}: {
  agrementId: number;
  userType?: USER_TYPE;
  agrementMessage?: Partial<AgrementMessage> | null;
}): Promise<number> => {
  const fixture: Partial<AgrementMessage> = {
    agrement_id: agrementId,
    back_user_id: null,
    front_user_id: null,
    message: "Message de test",
    ...agrementMessage,
  };
  const userId =
    userType === USER_TYPE.BO ? fixture.back_user_id : fixture.front_user_id;

  if (!userId || !fixture.message) {
    throw new Error("Données de message d'agrément invalides");
  }

  const response = await AgrementsRepositoryShared.insertMessage({
    agrementId,
    message: fixture.message,
    userId,
    userType,
  });
  return response;
};

export const getAgrement = async (agrementId: number) => {
  const agrement = await AgrementService.getById({
    agrementId,
    withDetails: true,
  });
  return { agrement };
};
