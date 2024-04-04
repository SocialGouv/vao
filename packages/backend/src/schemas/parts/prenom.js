const { string } = require("yup");
const regex = require("../../utils/regex");

module.exports = () =>
  string()
    .test("acceptedChars", "Caractères non acceptés détectés", (prenom) =>
      regex.acceptedCharsRegex.test(prenom),
    )
    .test(
      "doubleSpaces",
      "Le prénom ne peut contenir deux espaces successifs",
      (prenom) => !regex.doubleSpacesRegex.test(prenom),
    )
    .test(
      "spaceFollowingDash",
      "Le prénom ne peut contenir d'espace suivant un tiret",
      (prenom) => !regex.spaceFollowingDashRegex.test(prenom),
    )
    .test(
      "doubleDash",
      "Le prénom ne peut contenir deux tirets consécutifs",
      (prenom) => !regex.doubleDashRegex.test(prenom),
    )
    .required();
