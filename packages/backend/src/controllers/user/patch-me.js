const yup = require("yup");
const User = require("../../services/User");
const ValidationAppError = require("../../utils/validation-error");

module.exports = async function patchMe(req, res, next) {
  const { decoded, body } = req;

  let params;
  try {
    params = await yup
      .object({
        nom: yup.string().required(),
        prenom: yup.string().required(),
      })
      .validate(body);
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  try {
    const user = await User.updateUser({
      id: decoded.id,
      nom: params.nom,
      prenom: params.prenom,
    });

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
};
