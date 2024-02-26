const { object, string } = require("yup");
const password = require("./parts/password");

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const nomRegex = /^[A-Za-z'-]+$/;

const schema = object({
  email: string()
    .test("acceptedChars", "Caractères non acceptés détectés", (email) =>
      emailRegex.test(email),
    )
    .required(),
  nom: string()
    .test("acceptedChars", "Caractères non acceptés détectés", (nom) =>
      nomRegex.test(nom),
    )
    .required(),
  password,
  prenom: string()
    .test("acceptedChars", "Caractères non acceptés détectés", (prenom) =>
      nomRegex.test(prenom),
    )
    .required(),
});

module.exports = schema;
