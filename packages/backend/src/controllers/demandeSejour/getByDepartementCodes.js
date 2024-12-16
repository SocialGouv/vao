const yup = require("yup");

const DemandeSejour = require("../../services/DemandeSejour");
const Organisme = require("../../services/Organisme");
const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");
const Sentry = require("@sentry/node");

const log = logger(module.filename);

async function getByDepartementCodes(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: adminId } = decoded ?? {};
  const territoireCode = req.decoded.territoireCode;
  log.d("userId", { adminId });

  try {
    const { limit, offset, sortBy, sortDirection, search } = req.query;
    const params = {
      limit,
      offset,
      search: JSON.parse(search ?? "{}"),
      sortBy,
      sortDirection,
    };

    try {
      await yup
        .object({
          limit: yup.number().nullable(),
          offset: yup.number().nullable(),
          search: yup.object().json().nullable(),
          sortBy: yup
            .string()
            .oneOf([
              "libelle",
              "statut",
              "typeOrganisme",
              "personneMorale",
              "personnePhysique",
              "demandeSejourId",
              "declarationId",
              "dateDebut",
              "dateFin",
              "organismeId",
              "organisme",
              "idFonctionnelle",
              "messageOrdreEtat",
            ])
            .nullable(),
          sortDirection: yup.string().oneOf(["ASC", "DESC"]).nullable(),
        })
        .validate(params, {
          abortEarly: false,
          stripUnknown: true,
        });
    } catch (error) {
      return next(new ValidationAppError(error));
    }
    // Si c'est l'organisme siège social alors on recherche sur le siren, sinon on recherchera sur le siret
    // On ajoute alors un param dans le search
    if (params.search?.organismeId) {
      const organisme = await Organisme.getOne({
        id: params.search.organismeId,
      });
      if (organisme?.personneMorale) {
        if (organisme?.personneMorale?.siegeSocial) {
          params.search.siren = organisme.personneMorale.siren;
        } else {
          params.search.siret = organisme.personneMorale.siret;
        }
      }
    }
    const demandesWithPagination = await DemandeSejour.getByDepartementCodes(
      params,
      territoireCode,
      req.departements.map((d) => d.value),
    );
    log.d(demandesWithPagination);
    return res.status(200).json({ demandesWithPagination });
  } catch (error) {
    return next(error);
  }
}

module.exports = async function get(req, res, next) {
  // create new Sentry trace manually to enable profiler for its nested span
  Sentry.startNewTrace(async () => {
    Sentry.startSpan(
      {
        name: `Profile ${req.method} ${req.baseUrl}${req.path}`,
        op: "http",
      },
      async () => {
        await getByDepartementCodes(req, res, next);
      },
    );
  });
};
