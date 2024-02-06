const { string } = require("yup");

const pwdRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*)(<>,~;])(?=.{12,})/;

module.exports = string()
  .test("acceptedChars", "Caractères non acceptés détectés", (password) =>
    pwdRegex.test(password)
  )
  .required();
