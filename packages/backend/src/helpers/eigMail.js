const eigService = require("../services/eig");
const Organisme = require("../services/Organisme");
const User = require("../services/User");
const Departement = require("../services/geo/Departement");
const Region = require("../services/geo/Region");
const { mapEigToLabel } = require("./eig");

module.exports.getEmails = async (departement, userId) => {
  const emailsDDETS = await eigService.getEmailByTerCode(departement);

  const organisme = await Organisme.getOne({ "uo.use_id": userId });

  const emailsDREETS = await eigService.getEmailByTerCode(
    organisme?.agrement?.regionObtention,
  );

  const users = await User.read({ id: userId });

  let emailsOrganisateur;
  if (organisme.typeOrganisme === "personne_morale") {
    emailsOrganisateur = [organisme.personneMorale.email];
  } else {
    emailsOrganisateur = users.map((u) => u.email);
  }

  const departementName = (await Departement.fetchOne(departement))?.text;
  const regionName = (
    await Region.fetchOne(organisme?.agrement?.regionObtention)
  )?.text;
  const userName = users.map((u) => u.nom + " " + u.prenom).find((n) => !!n);

  return {
    departementName,
    userName,
    emailsDDETS,
    emailsDREETS,
    emailsOrganisateur,
    regionName,
  };
};

module.exports.generateTypes = (eig) => {
  return (
    "<ul>" +
    (
      eig?.types?.map(
        (t) =>
          '<li style="Margin:0;mso-line-height-rule:exactly;font: 12px/14px sans-serif;">' +
          mapEigToLabel[t.type] +
          (t.precision ? " : " + t.precision : "") +
          "</li>",
      ) ?? []
    ).join("") +
    "</ul>"
  );
};
