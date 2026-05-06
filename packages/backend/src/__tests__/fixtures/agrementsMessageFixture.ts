import { type AgrementMessage, USER_TYPE } from "@vao/shared-bridge";

export async function buildAgrementMessageFixture({
  agrementId,
  userId,
  userType = USER_TYPE.BO,
  message,
}: {
  agrementId: number;
  userId: number;
  userType: USER_TYPE;
  message: string;
}): Promise<Partial<AgrementMessage>> {
  return {
    agrement_id: agrementId,
    back_user_id: userType === USER_TYPE.BO ? userId : null,
    front_user_id: userType === USER_TYPE.FU ? userId : null,
    message,
  };
}
