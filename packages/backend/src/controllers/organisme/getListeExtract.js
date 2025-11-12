const { escapeCsvField } = require("../../utils/csv");
const Organisme = require("../../services/Organisme");

const logger = require("../../utils/logger");
const dayjs = require("dayjs");
const { formatSiren, formatSiret } = require("../../utils/siret");

const log = logger(module.filename);

module.exports = async function get(_req, res, next) {
  log.i("IN");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');

  const titles = [
    { key: "typeOrganisme", label: "Type" },
    { key: "dateModification", label: "Date de modification" },
    { key: "complet", label: "Fiche complète" },
    { key: "siren", label: "SIREN" },
    { key: "siret", label: "SIRET" },
    { key: "raisonSociale", label: "Nom de l’organisme" },
    { key: "nomPersonnePhysique", label: "Nom" },
    { key: "prenomPersonnePhysique", label: "Prénom" },
    { key: "regionObtention", label: "Région d’obtention d'agrément" },
    { key: "dateObtentionAgrement", label: "Date d’obtention d’agrément" },
    { key: "email", label: "Email" },
    { key: "telephone", label: "Téléphone" },
    { key: "sejourCount", label: "Nombre de déclarations total" },
    {
      key: "sejourCountTransmise",
      label: `Déclarations en statut "transmise"`,
    },
    {
      key: "sejourCountEnCours",
      label: `Déclarations en statut "en cours"`,
    },
    {
      key: "sejourCountAModifier",
      label: `Déclarations en statut "à modifier"`,
    },
    {
      key: "sejourCountAttente8j",
      label: `Déclarations en statut "en attente déclaration 8j"`,
    },
    {
      key: "sejourCountTransmise8j",
      label: `Déclarations en statut "transmise 8j"`,
    },
    {
      key: "sejourCountEnCours8j",
      label: `Déclarations en statut "en cours 8j"`,
    },
    {
      key: "sejourCountAModifier8j",
      label: `Déclarations en statut "à modifier 8j"`,
    },
    {
      key: "sejourCountValide8j",
      label: `Déclarations en statut "validée 8j"`,
    },

    {
      key: "sejourCountAbamdonnee",
      label: `Déclarations en statut "abandonnée"`,
    },
    {
      key: "sejourCountAnnulee",
      label: `Déclarations en statut "annulée"`,
    },
    {
      key: "sejourCountSejourEnCours",
      label: `Déclarations en statut "Séjour en cours"`,
    },
    {
      key: "sejourCountTerminee",
      label: `Déclarations en statut "Terminé"`,
    },
  ];
  try {
    const organismes = await Organisme.getListeExtract();
    const csv = [
      titles.map(({ label }) => `"${label}"`).join(";"),
      ...organismes.map((item) => {
        const newItem = { ...item };
        newItem.typeOrganisme =
          newItem.typeOrganisme === "personne_morale"
            ? "personne morale"
            : "personne physique";
        newItem.siret = formatSiret({ siret: newItem.siret });
        newItem.siren = formatSiren({ siren: newItem.siren });
        newItem.dateObtentionAgrement = newItem.agrement?.dateObtention
          ? dayjs(newItem.agrement.dateObtention).format("DD/MM/YYYY")
          : "";
        newItem.dateModification = newItem.editedAt
          ? dayjs(newItem.editedAt).format("DD/MM/YYYY")
          : "";
        newItem.complet = newItem.complet ? "oui" : "non";
        newItem.regionObtention = newItem.agrement?.regionObtention;
        return titles
          .map(({ key }) => {
            const value = escapeCsvField(newItem[key] ?? "");
            return `"${value}"`;
          })
          .join(";");
      }),
    ].join("\n");
    return res.status(200).send(csv);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
