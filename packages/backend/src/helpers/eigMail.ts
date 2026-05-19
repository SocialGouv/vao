import eigService from "../services/eig";
import UserFO from "../services/FoUser";
import Departement from "../services/geo/Departement";
import Region from "../services/geo/Region";
import Organisme from "../services/Organisme";
import User from "../services/User";
import { EigTypeCode, mapEigToLabel } from "./eig";

export const getEmails = async (departement: string, userId: number) => {
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
    emailsOrganisateur = users.map((u: { email: string }) => u.email);
  }

  let emailsOrganisateurSiegeSocial: any[] = [];
  if (
    organisme.typeOrganisme === "personne_morale" &&
    !organisme.personneMorale?.porteurAgrement
  ) {
    const organismeSiegeSocial = await Organisme.getSiege(
      organisme.personneMorale.siret,
    );
    if (organismeSiegeSocial?.organismeId) {
      const usersSiegeSocial = await UserFO.getMailUserOrganismeId(
        organismeSiegeSocial.organismeId,
      );
      emailsOrganisateurSiegeSocial = usersSiegeSocial.map(
        (u: { mail: string }) => u.mail,
      );
    }
  }

  const departementName = (await Departement.fetchOne(departement))?.text;
  const regionName = (
    await Region.fetchOne(organisme?.agrement?.regionObtention)
  )?.text;
  const userName = users
    .map((u: { nom: string; prenom: string }) => u.nom + " " + u.prenom)
    .find((n: string) => !!n);

  return {
    departementName,
    emailsDDETS,
    emailsDREETS,
    emailsOrganisateur,
    emailsOrganisateurSiegeSocial,
    regionName,
    userName,
  };
};

export const generateTypes = (eig: any) => {
  return (
    "<ul>" +
    (
      eig?.types?.map(
        (t: { type: EigTypeCode; precision: string }) =>
          '<li style="Margin:0;mso-line-height-rule:exactly;font: 12px/14px sans-serif;">' +
          mapEigToLabel[t.type] +
          (t.precision ? " : " + t.precision : "") +
          "</li>",
      ) ?? []
    ).join("") +
    "</ul>"
  );
};
