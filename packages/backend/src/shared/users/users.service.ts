import {
  FUNCTIONAL_ERRORS,
  FunctionalException,
  UserAdminDto,
  UserUsagersDto,
} from "@vao/shared-bridge";

import { UsersRepository as UsersRepositoryAdmin } from "../../admin/users/users.repository";
import { UsersRepository as UsersRepositoryUsagers } from "../../usagers/users/users.repository";
import { logger } from "../../utils/logger";
import { OtpService } from "../../utils/otp";

const log = logger(module.filename);

export const UsersService = {
  async verifyOtpCode({
    email,
    code,
    from,
    //rememberDevice,
  }: {
    email: string;
    code: string;
    from: string;
    //rememberDevice: boolean;
  }): Promise<UserAdminDto | UserUsagersDto> {
    const user =
      from === "bo"
        ? await UsersRepositoryAdmin.getByEmail({ email })
        : await UsersRepositoryUsagers.getByEmail({ email });
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
      if (from === "bo") {
        await UsersRepositoryAdmin.updateOtpAttempts({
          otpAttempts,
          otpAttemptsAt: null,
          userId: Number(user.id),
        });
      } else {
        await UsersRepositoryUsagers.updateOtpAttempts({
          otpAttempts,
          otpAttemptsAt: null,
          userId: Number(user.id),
        });
      }
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
      if (from === "bo") {
        await UsersRepositoryAdmin.updateOtpAttempts({
          otpAttempts,
          otpAttemptsAt,
          userId: Number(user.id),
        });
      } else {
        await UsersRepositoryUsagers.updateOtpAttempts({
          otpAttempts,
          otpAttemptsAt,
          userId: Number(user.id),
        });
      }
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
    return from === "bo"
      ? await UsersRepositoryAdmin.updateOtpAttempts({
          otpAttempts: 0,
          otpAttemptsAt: null,
          userId: Number(user.id),
        })
      : await UsersRepositoryUsagers.updateOtpAttempts({
          otpAttempts: 0,
          otpAttemptsAt: null,
          userId: Number(user.id),
        });
  },
};
