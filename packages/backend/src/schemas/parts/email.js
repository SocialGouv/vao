const { string } = require("yup");

const { emailRegex } = require("../../utils/regex");

module.exports = () =>
  string()
    .test("acceptedChars", "Caractères non acceptés détectés", (email) =>
      emailRegex.test(email),
    )
    .required();
