const { string } = require("yup");

const {
  pwdRegexSpecial,
  pwdRegexNumber,
  pwdRegexMaj,
  pwdRegexMin,
} = require("../../utils/regex");

module.exports = () =>
  string()
    .test(
      "minimumLengthPassword",
      "Le mot de passe doit contenir au moins 12 caractères minimum",
      (password) => password.length > 11,
    )
    .test(
      "specialCharPassword",
      "Le mot de passe doit contenir au moins 1 caractère spécial",
      (password) => pwdRegexSpecial.test(password),
    )
    .test(
      "digitPassword",
      "Le mot de passe doit contenir au moins 1 chiffre",
      (password) => pwdRegexNumber.test(password),
    )
    .test(
      "uppercaseCharPassword",
      "Le mot de passe doit contenir au moins 1 lettre majuscule",
      (password) => pwdRegexMaj.test(password),
    )
    .test(
      "lowercaseCharPassword",
      "Le mot de passe doit contenir au moins 1 lettre minuscule",
      (password) => pwdRegexMin.test(password),
    )
    .required();
