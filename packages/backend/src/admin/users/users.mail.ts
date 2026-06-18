import { config } from "../../config";
import { UserMail } from "../../shared/users/users.mail";

export const UserMailAdmin = {
  getOtpCode: ({ mail, otpCode }: { mail: string; otpCode: number }) => {
    return UserMail.getOtpCode({
      mail,
      otpCode,
      urlPortail: config.frontBODomain,
    });
  },
};
