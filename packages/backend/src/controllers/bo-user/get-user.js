const BoUser = require("../../services/BoUser");
// const Session = require("../../services/Session");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function getUser(req, res) {
  log.i("In");
  const { decoded } = req;
  //  TODO : check what the jwt contains. Here i suppose that the id the the admin id
  const { id: adminId } = decoded ?? {};
  log.d("userId", { adminId });

  try {
    const { search } = req.query;
    log.i("search ::::",search.email);

    const user = await BoUser.readUser({
      search: JSON.parse(search ?? "{}"),
    });
    log.d(user);
    return res.status(200).json({ user });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération d'utilisateur' des utilisateurs BO",
    });
  }
};
