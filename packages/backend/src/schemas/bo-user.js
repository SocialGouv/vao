const { string, object, array, boolean } = require("yup");

const emailSchema = require("./parts/email");
const nomSchema = require("./parts/nom");
const prenomSchema = require("./parts/prenom");

const schema = () =>
  object({
    email: emailSchema(),
    nom: nomSchema(),
    prenom: prenomSchema(),
    roles: array().required(),
    territoireCode: string().required(),
    deleted: boolean().required(),
  });

module.exports = schema;
