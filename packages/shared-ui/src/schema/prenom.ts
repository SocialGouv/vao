import { string } from "yup";
import {
  acceptedCharsRegex,
  doubleDashRegex,
  doubleSpacesRegex,
  spaceFollowingDashRegex,
} from "../utils/regex";

export const prenomSchema = () =>
  string()
    .test(
      "acceptedChars",
      "Caractères non acceptés détectés",
      (prenom?: string) => acceptedCharsRegex.test(prenom ?? ""),
    )
    .test(
      "doubleSpaces",
      "Le prénom ne peut contenir deux espaces successifs",
      (prenom?: string) => !doubleSpacesRegex.test(prenom ?? ""),
    )
    .test(
      "spaceFollowingDash",
      "Le prénom ne peut contenir d'espace suivant un tiret",
      (prenom?: string) => !spaceFollowingDashRegex.test(prenom ?? ""),
    )
    .test(
      "doubleDash",
      "Le prénom ne peut contenir deux tirets consécutifs",
      (prenom?: string) => !doubleDashRegex.test(prenom ?? ""),
    )
    .required();
