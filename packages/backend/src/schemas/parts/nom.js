const { string } = require("yup");
const regex = require("../../utils/regex");

module.exports = () =>
  string()
    .test("acceptedChars", "Caractères non acceptés détectés", (nom) =>
      regex.acceptedCharsRegex.test(nom),
    )
    .test(
      "doubleSpaces",
      "Le nom ne peut contenir deux espaces successifs",
      (nom) => !regex.doubleSpacesRegex.test(nom),
    )
    .test(
      "spaceFollowingDash",
      "Le nom ne peut contenir d'espace suivant un tiret",
      (nom) => !regex.spaceFollowingDashRegex.test(nom),
    )
    .test(
      "tripleDash",
      "Le nom ne peut contenir trois tirets consécutifs",
      (nom) => !regex.tripleDashRegex.test(nom),
    )
    .required();
