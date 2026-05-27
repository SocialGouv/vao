import { config } from "../../config";
import { UserMail } from "../../shared/users/users.mail";

export const UserMailUsagers = {
  getOtpCode: ({ mail, otpCode }: { mail: string; otpCode: number }) => {
    return UserMail.getOtpCode({
      mail,
      otpCode,
      urlPortail: config.frontUsagersDomain,
    });
  },
};
