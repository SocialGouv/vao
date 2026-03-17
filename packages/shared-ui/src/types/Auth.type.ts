/**
 * Types pour l'authent bo et usagers
 */

import type { UserDto, TwoFactorErrorCode } from "@vao/shared-bridge";
import type { Ref, ComputedRef } from "vue";

export interface LoginResponse {
  user: UserDto;
  requires2FA?: boolean;
  token?: string;
  twoFactorExpiration?: string;
}

export interface Verify2FAResponse {
  user: UserDto;
  token?: string;
}

export interface Verify2FAPayload {
  code: string;
  rememberDevice: boolean;
}

export interface AuthError {
  type: "error" | "warning" | "info" | "success";
  title: string;
  description: string;
}

export type LoginErrorType =
  | "TooManyLoginAttempts"
  | "WrongCredentials"
  | "EmailUnauthorized"
  | "UserTemporarilyBlocked"
  | "NeedEmailValidation"
  | "NeedSiretValidation"
  | "UnexpectedError";

export interface AuthState {
  email: Ref<string>;
  password: Ref<string>;
  displayType: Ref<LoginErrorType | null>;
  openTwoFactor: Ref<boolean>;
  openCgu: Ref<boolean>;
  isLoggingIn: Ref<boolean>;
  isVerifying2FA: Ref<boolean>;
  isResendingCode: Ref<boolean>;
}

export interface ApiEndpoints {
  LOGIN: string;
  VERIFY_2FA: string;
  RESEND_2FA: string;
  ACCEPT_CGU: string;
}

export interface UseAuthenticationReturn {
  email: Ref<string>;
  password: Ref<string>;
  displayType: Ref<LoginErrorType | null>;
  openTwoFactor: Ref<boolean>;
  openCgu: Ref<boolean>;
  isLoggingIn: Ref<boolean>;
  isVerifying2FA: Ref<boolean>;
  isResendingCode: Ref<boolean>;

  canLogin: ComputedRef<boolean>;
  maskedEmail: ComputedRef<string>;

  login: () => Promise<void>;

  verify2FACode: (payload: Verify2FAPayload) => Promise<void>;
  resendCode: () => Promise<void>;
  cancel2FA: () => void;

  // Méthodes - CGU
  validateCgu: () => Promise<void>;
  refuseCgu: () => void;

  reset: () => void;
}

export interface AuthenticationOptions {
  type: "fo" | "bo";
}

export interface ApiError {
  data?: {
    name?: TwoFactorErrorCode;
    message?: string;
    statusCode?: number;
  };
  statusCode?: number;
  message?: string;
}
