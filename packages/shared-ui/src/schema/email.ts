import { string } from "yup";
import { emailRegex } from "../utils/regex";

export const emailSchema = () =>
  string()
    .test(
      "acceptedChars",
      "Caractères non acceptés détectés",
      (email?: string) => emailRegex.test(email ?? ""),
    )
    .required();
