import {
  FUNCTIONAL_ERROR_MESSAGES,
  FUNCTIONAL_ERRORS,
  FunctionalException,
  TRACKING_ACTIONS,
  TRACKING_ENTITIES,
  TRACKING_USER_TYPE,
  USER_TARGET,
  UserAdminDto,
  UserUsagersDto,
} from "@vao/shared-bridge";

import { UserMailAdmin } from "../../admin/users/users.mail";
import { UsersRepository as UsersRepositoryAdmin } from "../../admin/users/users.repository";
import { mailService } from "../../services/mail";
import { UserMailUsagers } from "../../usagers/users/users.mail";
import { UsersRepository as UsersRepositoryUsagers } from "../../usagers/users/users.repository";
import AppError from "../../utils/error";
import { logger } from "../../utils/logger";
import { normalize } from "../../utils/normalize";
import { OtpService } from "../../utils/otp";

const { addHistoric } = require("../../services/Tracking");

const log = logger(module.filename);

type OtpTarget = (typeof USER_TARGET)[keyof typeof USER_TARGET];
type OtpUserDto<T extends OtpTarget> = T extends typeof USER_TARGET.BO
  ? UserAdminDto
  : UserUsagersDto;

export const UsersService = {
  async addAttemptsOtpTrack<T extends OtpTarget>({
    user,
    functionnalError,
    isBo,
    code,
  }: {
    user: OtpUserDto<T>;
    functionnalError: FUNCTIONAL_ERRORS;
    isBo: boolean;
    code: string;
  }) {
    try {
      await addHistoric({
        action: TRACKING_ACTIONS.modification,
        data: {
          enteredCode: code,
          reason: FUNCTIONAL_ERROR_MESSAGES[functionnalError],
          user: {
            otpAttempts: user.otpAttempts,
            otpAttemptsAt: user.otpAttemptsAt,
            otpCode: user.otpCode,
            otpCodeExpiresAt: user.otpCodeExpiresAt,
          },
        },
        entity: isBo ? TRACKING_ENTITIES.userBack : TRACKING_ENTITIES.userFront,
        entityId: user.id,
        userId: user.id,
        userType: isBo ? TRACKING_USER_TYPE.back : TRACKING_USER_TYPE.front,
      });
    } catch (error) {
      log.w("Error tracking user modification", error);
    }
  },
  async resendOtpCode<T extends OtpTarget>({
    email,
    target,
  }: {
    email: string;
    target: T;
  }): Promise<OtpUserDto<T>> {
    const emailNormalized = normalize(email);
    const isBo = target === USER_TARGET.BO;
    const user = isBo
      ? await UsersRepositoryAdmin.getByEmail({ email: emailNormalized })
      : await UsersRepositoryUsagers.getByEmail({ email: emailNormalized });
    if (!user) {
      log.w("Utilisateur non trouvé", emailNormalized);
      throw new FunctionalException(FUNCTIONAL_ERRORS.USER_NOT_FOUND);
    }
    const { isLocked } = OtpService.isLocked({
      otpAttempts: user.otpAttempts ?? 0,
      otpAttemptsAt: user.otpAttemptsAt ?? null,
    });

    if (isLocked) {
      log.w("Utilisateur temporairement bloqué", emailNormalized);
      throw new FunctionalException(
        FUNCTIONAL_ERRORS.USER_OTP_TEMPORARILY_BLOCKED,
      );
    }

    const { code, expiresAt } = OtpService.generate();
    const userUpdated = isBo
      ? await UsersRepositoryAdmin.updateOtp({
          otpAttempts: 0,
          otpAttemptsAt: null,
          otpCode: code,
          otpCodeExpiresAt: expiresAt,
          userId: Number(user.id),
        })
      : await UsersRepositoryUsagers.updateOtp({
          otpAttempts: 0,
          otpAttemptsAt: null,
          otpCode: code,
          otpCodeExpiresAt: expiresAt,
          userId: Number(user.id),
        });

    if (!userUpdated) {
      log.w("Échec de la mise à jour du code 2FA", user.id);
      throw new AppError("Échec de la mise à jour du code 2FA", {
        statusCode: 500,
      });
    }

    await mailService.send(
      isBo
        ? UserMailAdmin.getOtpCode({
            mail: user.email,
            otpCode: code,
          })
        : UserMailUsagers.getOtpCode({
            mail: user.email,
            otpCode: code,
          }),
    );

    return userUpdated as OtpUserDto<T>;
  },
  async updateOtp({
    userId,
    target,
  }: {
    userId: number;
    target: string;
  }): Promise<{
    otpAttempts: number;
    otpAttemptsAt: Date;
  }> {
    const isBo = target === USER_TARGET.BO;
    const user = isBo
      ? await UsersRepositoryAdmin.getById({ userId })
      : await UsersRepositoryUsagers.getById({ userId });
    if (!user) {
      log.w("Utilisateur non trouvé", userId);
      throw new AppError("Utilisateur non trouvé", { statusCode: 404 });
    }

    const { code, expiresAt } = OtpService.generate();
    const userUpdated = isBo
      ? await UsersRepositoryAdmin.updateOtp({
          otpAttempts: 0,
          otpAttemptsAt: null,
          otpCode: code,
          otpCodeExpiresAt: expiresAt,
          userId,
        })
      : await UsersRepositoryUsagers.updateOtp({
          otpAttempts: 0,
          otpAttemptsAt: null,
          otpCode: code,
          otpCodeExpiresAt: expiresAt,
          userId,
        });

    if (!userUpdated) {
      log.w("Échec de la mise à jour du code 2FA", { userId });
      throw new AppError("Échec de la mise à jour du code 2FA", {
        statusCode: 500,
      });
    }

    await mailService.send(
      isBo
        ? UserMailAdmin.getOtpCode({
            mail: user.email,
            otpCode: code,
          })
        : UserMailUsagers.getOtpCode({
            mail: user.email,
            otpCode: code,
          }),
    );

    return {
      otpAttempts: userUpdated.otpAttempts!,
      otpAttemptsAt: userUpdated.otpAttemptsAt!,
    };
  },
  async verifyOtpCode<T extends OtpTarget>({
    email,
    code,
    target,
  }: {
    email: string;
    code: string;
    target: T;
  }): Promise<OtpUserDto<T>> {
    const emailNormalized = normalize(email);
    const isBo = target === USER_TARGET.BO;
    const user = isBo
      ? await UsersRepositoryAdmin.getByEmail({ email: emailNormalized })
      : await UsersRepositoryUsagers.getByEmail({ email: emailNormalized });
    if (!user) {
      log.w("Utilisateur non trouvé", emailNormalized);
      throw new FunctionalException(FUNCTIONAL_ERRORS.USER_NOT_FOUND);
    }
    let otpAttempts = user.otpAttempts ?? 0;
    const { isLocked, unlockAt } = OtpService.isLocked({
      otpAttempts,
      otpAttemptsAt: user.otpAttemptsAt ?? null,
    });
    // Utilisateur temporairement bloqué en raison de tentatives OTP échouée
    if (isLocked) {
      await UsersService.addAttemptsOtpTrack({
        code,
        functionnalError: FUNCTIONAL_ERRORS.USER_OTP_TEMPORARILY_BLOCKED,
        isBo,
        user,
      });
      throw new FunctionalException(
        FUNCTIONAL_ERRORS.USER_OTP_TEMPORARILY_BLOCKED,
        { otpAttempts, unlockAt },
      );
    }

    // Le blocage a expiré : reset uniquement en mémoire
    if (otpAttempts >= 3) {
      otpAttempts = 0;
    }

    // Aucun code ou expiration trouvée
    if (!user.otpCode || !user.otpCodeExpiresAt) {
      log.w("Aucun code OTP trouvé pour l'utilisateur", emailNormalized);
      throw new FunctionalException(FUNCTIONAL_ERRORS.USER_OTP_CODE_NOT_FOUND);
    }
    // Code expiré
    const isExpired = OtpService.isExpired({
      otpCodeExpiresAt: user.otpCodeExpiresAt,
    });
    if (isExpired) {
      log.w("Code OTP expiré pour l'utilisateur", emailNormalized);
      await UsersService.addAttemptsOtpTrack({
        code,
        functionnalError: FUNCTIONAL_ERRORS.USER_OTP_CODE_EXPIRED,
        isBo,
        user,
      });
      throw new FunctionalException(FUNCTIONAL_ERRORS.USER_OTP_CODE_EXPIRED, {
        otpCodeExpiresAt: user.otpCodeExpiresAt,
      });
    }
    if (user.otpCode !== Number(code)) {
      log.w("Code OTP invalide pour l'utilisateur", emailNormalized);
      otpAttempts += 1;
      const otpAttemptsAt = new Date();
      if (isBo) {
        await UsersRepositoryAdmin.updateOtp({
          otpAttempts,
          otpAttemptsAt,
          otpCode: user.otpCode,
          otpCodeExpiresAt: user.otpCodeExpiresAt,
          userId: Number(user.id),
        });
      } else {
        await UsersRepositoryUsagers.updateOtp({
          otpAttempts,
          otpAttemptsAt,
          otpCode: user.otpCode,
          otpCodeExpiresAt: user.otpCodeExpiresAt,

          userId: Number(user.id),
        });
      }
      // Nombre de tentatives atteinte
      if (otpAttempts === 3) {
        log.w("Nombre de tentatives atteinte", emailNormalized);
        await UsersService.addAttemptsOtpTrack({
          code,
          functionnalError: FUNCTIONAL_ERRORS.USER_OTP_MAX_ATTEMPTS,
          isBo,
          user,
        });
        throw new FunctionalException(FUNCTIONAL_ERRORS.USER_OTP_MAX_ATTEMPTS, {
          otpAttempts,
          otpAttemptsAt,
        });
      }
      log.w("il reste des tentatives : ", otpAttempts);
      await UsersService.addAttemptsOtpTrack({
        code,
        functionnalError: FUNCTIONAL_ERRORS.USER_OTP_CODE_INVALID,
        isBo,
        user,
      });
      throw new FunctionalException(FUNCTIONAL_ERRORS.USER_OTP_CODE_INVALID, {
        otpAttempts,
        otpAttemptsAt,
        otpCodeExpiresAt: user.otpCodeExpiresAt,
      });
    }

    // Reset du nombre de tentatives après une vérification réussie
    const userUpdated = isBo
      ? await UsersRepositoryAdmin.updateOtp({
          otpAttempts: 0,
          otpAttemptsAt: null,
          otpCode: null,
          otpCodeExpiresAt: null,
          userId: Number(user.id),
        })
      : await UsersRepositoryUsagers.updateOtp({
          otpAttempts: 0,
          otpAttemptsAt: null,
          otpCode: null,
          otpCodeExpiresAt: null,
          userId: Number(user.id),
        });
    return userUpdated as OtpUserDto<T>;
  },
};
