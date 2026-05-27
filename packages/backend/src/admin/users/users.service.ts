import { addMinutes } from "@vao/shared-bridge";

import { mailService } from "../../services/mail";
import AppError from "../../utils/error";
import { logger } from "../../utils/logger";
import { UserMailAdmin } from "./users.mail";
import { UsersRepository } from "./users.repository";

const log = logger(module.filename);

export const UsersService = {
  async updateOtpCode({ userId }: { userId: number }): Promise<boolean> {
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const otpCodeExpiratedAt = addMinutes(new Date(), 15);

    const user = await UsersRepository.getById({ userId });
    if (!user) {
      log.w("Utilisateur non trouvé", userId);
      throw new AppError("Utilisateur non trouvé", { statusCode: 404 });
    }

    const userUpdated = await UsersRepository.updateOtpCode({
      otpCode,
      otpCodeExpiratedAt,
      userId,
    });

    if (!userUpdated) {
      log.w("Échec de la mise à jour du code 2FA", { userId });
      throw new AppError("Échec de la mise à jour du code 2FA", {
        statusCode: 500,
      });
    }

    await mailService.send(
      UserMailAdmin.getOtpCode({
        mail: user.mail,
        otpCode,
      }),
    );

    return true;
  },
};
