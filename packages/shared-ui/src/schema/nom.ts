import { string } from "yup";
import {
  acceptedCharsRegex,
  doubleSpacesRegex,
  spaceFollowingDashRegex,
  tripleDashRegex,
} from "../utils/regex";

export const nomSchema = () =>
  string()
    .test("acceptedChars", "Caractères non acceptés détectés", (nom?: string) =>
      acceptedCharsRegex.test(nom ?? ""),
    )
    .test(
      "doubleSpaces",
      "Le nom ne peut contenir deux espaces successifs",
      (nom?: string) => !doubleSpacesRegex.test(nom ?? ""),
    )
    .test(
      "spaceFollowingDash",
      "Le nom ne peut contenir d'espace suivant un tiret",
      (nom?: string) => !spaceFollowingDashRegex.test(nom ?? ""),
    )
    .test(
      "tripleDash",
      "Le nom ne peut contenir trois tirets consécutifs",
      (nom?: string) => !tripleDashRegex.test(nom ?? ""),
    )
    .required();
