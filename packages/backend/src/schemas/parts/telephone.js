const { string } = require("yup");

const { numTelephoneRegex } = require("../../utils/regex");

module.exports = () =>
  string()
    .test(
      "telephone",
      "Format de numéro de téléphone invalide",
      (telephone) => {
        console.info({ telephone }, numTelephoneRegex.test(telephone));
        return telephone === null || numTelephoneRegex.test(telephone);
      },
    )
    .required();
