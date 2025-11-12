import { string } from "yup";
import { emailRegex } from "../utils/regex";

export const emailSchema = () =>
  string()
    .test("acceptedChars", "Caractères non acceptés détectés", (email) =>
      emailRegex.test(email),
    )
    .required();
