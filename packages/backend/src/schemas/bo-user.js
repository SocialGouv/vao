const { string, object, array, boolean } = require("yup");

const emailSchema = require("./parts/email");
const nomSchema = require("./parts/nom");
const prenomSchema = require("./parts/prenom");

const schema = () =>
  object({
    deleted: boolean().required(),
    email: emailSchema(),
    nom: nomSchema(),
    prenom: prenomSchema(),
    roles: array().required(),
    territoireCode: string().required(),
  });

module.exports = schema;
