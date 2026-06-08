import {
  FUNCTIONAL_ERRORS,
  FunctionalException,
  UserAdminDto,
} from "@vao/shared-bridge";

import { mailService } from "../../services/mail";
import AppError from "../../utils/error";
import { logger } from "../../utils/logger";
import { OtpService } from "../../utils/otp";
import { UserMailAdmin } from "./users.mail";
import { UsersRepository } from "./users.repository";

const log = logger(module.filename);

export const UsersService = {
  async updateOtpCode({ userId }: { userId: number }): Promise<boolean> {
    const user = await UsersRepository.getById({ userId });
    if (!user) {
      log.w("Utilisateur non trouvé", userId);
      throw new AppError("Utilisateur non trouvé", { statusCode: 404 });
    }

    const { code, expiresAt } = OtpService.generate();
    const userUpdated = await UsersRepository.updateOtpCode({
      otpAttemtps: 0,
      otpAttemtpsAt: null,
      otpCode: code,
      otpCodeExpiratedAt: expiresAt,
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
        mail: user.email,
        otpCode: code,
      }),
    );

    return true;
  },
  async verifyOtpCode({
    email,
    code,
    //rememberDevice,
  }: {
    email: string;
    code: string;
    //rememberDevice: boolean;
  }): Promise<UserAdminDto> {
    const user = await UsersRepository.getByEmail({ email });
    if (!user) {
      log.w("Utilisateur non trouvé", email);
      throw new FunctionalException(FUNCTIONAL_ERRORS.USER_NOT_FOUND);
    }
    let otpAttempts = user.otpAttempts ?? 0;
    const { isLocked, unlockAt } = OtpService.isLocked({
      otpAttempts: user.otpAttempts ?? 0,
      otpAttemptsAt: user.otpAttemptsAt ?? null,
    });
    // Utilisateur temporairement bloqué en raison de tentatives OTP échouée
    if (isLocked) {
      throw new FunctionalException(
        FUNCTIONAL_ERRORS.USER_OTP_PROVISOIRLY_BLOCKED,
        { otpAttempts, unlockAt },
      );
    } else {
      // Le compte n'est pas bloqué dont le délais est dépassé, on remet le compteur à 0
      if (otpAttempts === 3) {
        otpAttempts = 0;
      }
      await UsersRepository.updateOtpAttempts({
        otpAttempts,
        otpAttemptsAt: null,
        userId: Number(user.id),
      });
    }

    // Aucun code ou expiration trouvée (cas limite)
    if (!user.otpCode || !user.otpCodeExpiresAt) {
      log.w("Aucun code OTP trouvé pour l'utilisateur", email);
      throw new FunctionalException(FUNCTIONAL_ERRORS.USER_OTP_CODE_NOT_FOUND);
    }
    // Code expiré
    const isExpired = OtpService.isExpired({
      otpCodeExpiresAt: user.otpCodeExpiresAt,
    });
    if (isExpired) {
      log.w("Code OTP expiré pour l'utilisateur", email);
      throw new FunctionalException(FUNCTIONAL_ERRORS.USER_OTP_CODE_EXPIRED, {
        otpCodeExpiresAt: user.otpCodeExpiresAt,
      });
    }
    if (user.otpCode !== Number(code)) {
      log.w("Code OTP invalide pour l'utilisateur", email);
      otpAttempts += 1;
      const otpAttemptsAt = new Date();
      await UsersRepository.updateOtpAttempts({
        otpAttempts,
        otpAttemptsAt,
        userId: Number(user.id),
      });
      // Nombre de tentatives atteinte
      if (otpAttempts === 3) {
        log.w("Nombre de tentatives atteinte", email);
        throw new FunctionalException(FUNCTIONAL_ERRORS.USER_OTP_MAX_ATTEMPTS, {
          otpAttempts,
          otpAttemptsAt,
        });
      } else {
        // Code erroné, il reste des tentatives
        log.w("il reste des tentatives : ", otpAttempts);
        throw new FunctionalException(FUNCTIONAL_ERRORS.USER_OTP_CODE_INVALID, {
          otpAttempts,
          otpAttemptsAt,
          otpCodeExpiresAt: user.otpCodeExpiresAt,
        });
      }
    }

    // Reset du nombre de tentatives après une vérification réussie
    const userUpdated = await UsersRepository.updateOtpAttempts({
      otpAttempts: 0,
      otpAttemptsAt: null,
      userId: Number(user.id),
    });
    return userUpdated;
  },
};
