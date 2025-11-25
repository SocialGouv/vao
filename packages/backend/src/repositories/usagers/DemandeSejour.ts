import { processQuery } from "../../helpers/queryParams";
import Logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";

const log = Logger(module.filename);

export const DemandeSejourRepository = {
  getAdminStats: async ({
    departementCodes,
    territoireCode,
  }: {
    departementCodes: string[];
    territoireCode: string;
  }) => {
    log.i("getAdminStats - IN");

    const query = () => `
        SELECT
        COUNT(DISTINCT ds.id) FILTER (WHERE ds.statut = 'EN COURS')::integer AS "enCours",
        COUNT(DISTINCT ds.id) FILTER (WHERE ds.statut = 'TRANSMISE')::integer AS "transmis",
        COUNT(DISTINCT ds.id) FILTER (WHERE ds.statut = 'TRANSMISE 8J')::integer AS "transmis8J",
        COUNT(DISTINCT ds.id) FILTER (WHERE ds.statut = 'EN COURS 8J')::integer AS "enCours8J",
        COUNT(DISTINCT ds.id) FILTER (WHERE ds.statut = 'EN ATTENTE DECLARATION 8 JOURS')::integer AS "declaration8J",
        COUNT(DISTINCT ds.id) FILTER (WHERE ds.statut = 'VALIDEE 8J')::integer AS "validee8J",
        COUNT(DISTINCT ds.id) FILTER (WHERE ds.statut = 'TERMINEE')::integer AS "terminee",
        COUNT(DISTINCT ds.id) FILTER (WHERE ds.statut = 'ANNULEE')::integer AS "annulee",
        COUNT(DISTINCT ds.id) FILTER (WHERE ds.statut = 'ABANDONNEE')::integer AS "abandonnee",
        COUNT(DISTINCT ds.id) FILTER (WHERE ds.statut = 'REFUSEE')::integer AS "refusee",
        COUNT(DISTINCT ds.id) FILTER (WHERE ds.statut = 'REFUSEE 8J')::integer AS "refuse8J",
        COUNT(DISTINCT ds.id) FILTER (WHERE ds.statut <> 'BROUILLON')::integer AS "global",
        COUNT(CASE WHEN (dsm.message is not null AND dsm.read_at IS NULL AND dsm.back_user_id IS NULL) THEN 1 END)::integer AS "nonlu",
        COUNT(CASE WHEN (dsm.message is not null AND dsm.read_at IS NOT NULL AND dsm.back_user_id IS NULL) THEN 1 END)::integer AS "lu",
        COUNT(CASE WHEN (dsm.message is not null AND dsm.front_user_id IS NULL) THEN 1 END)::integer AS "repondu"
        FROM
        front.demande_sejour ds
        JOIN front.organismes o ON o.id = ds.organisme_id
        LEFT JOIN front.agrements a ON a.organisme_id  = ds.organisme_id
        LEFT JOIN front.demande_sejour_message dsm ON dsm.declaration_id = ds.id AND dsm.id = (
            SELECT MAX(dsmax.id)
            FROM front.demande_sejour_message  dsmax
            WHERE dsmax.declaration_id = ds.id)
        WHERE
        EXISTS (
            SELECT
            1
            FROM
            FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT DSTH
            LEFT JOIN FRONT.HEBERGEMENT H ON H.ID = DSTH.HEBERGEMENT_ID
            LEFT JOIN FRONT.ADRESSE A ON A.ID = H.ADRESSE_ID
            WHERE
            DSTH.DEMANDE_SEJOUR_ID = DS.ID
            AND A.DEPARTEMENT = ANY ($1)
        )
        OR A.REGION_OBTENTION = $2
        `;
    const response = await getPool().query(query(), [
      departementCodes,
      territoireCode,
    ]);
    log.i("getAdminStats - DONE");

    return {
      result: response.rows[0],
    };
  },

  getByDepartementCodes: async ({
    departementCodes,
    territoireCode,
    criterias,
    queryParams,
  }: {
    departementCodes: string[];
    territoireCode: string;
    criterias: string[];
    queryParams: any;
  }) => {
    log.i("getByDepartementCodes - IN");

    const query = () => `
        SELECT
        ds.id as "declarationId",
        ds.created_at as "createdAt",
        ds.edited_at as "editedAt",
        ds.statut as "statut",
        ds.organisme_id as "organismeId",
        ds.libelle as "libelle",
        ds.date_debut::text as "dateDebut",
        ds.date_fin::text as "dateFin",
        ds.organisme as "organisme",
        ds.id_fonctionnelle as "idFonctionnelle",
        o.type_organisme as "typeOrganisme",
        (
                SELECT
                DEPARTEMENT = ANY ($1)
                FROM
                FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT DSTH
                LEFT JOIN FRONT.HEBERGEMENT H ON H.ID = DSTH.HEBERGEMENT_ID
                LEFT JOIN FRONT.ADRESSE A ON A.ID = H.ADRESSE_ID
                WHERE DSTH.DEMANDE_SEJOUR_ID = DS.ID
                ORDER BY DSTH.DATE_DEBUT
                LIMIT 1
        ) as "estInstructeurPrincipal",
        dsm.message as "message",
                CASE
                WHEN (dsm.read_at IS NULL AND dsm.back_user_id IS NULL) THEN 'NON LU'
                WHEN (dsm.read_at IS NOT NULL AND dsm.back_user_id IS NULL) THEN 'LU'
                WHEN (dsm.front_user_id IS NULL) THEN 'REPONDU'
                END AS "messageEtat",
                CASE
                WHEN (dsm.read_at IS NULL AND dsm.back_user_id IS NULL) THEN 1 -- NON LU
                WHEN (dsm.read_at IS NOT NULL AND dsm.back_user_id IS NULL) THEN 2 -- LU
                WHEN (dsm.front_user_id IS NULL) THEN 3 -- REPONDU
                END AS "messageOrdreEtat",
                dsm.read_at AS "messageReadAt",
                dsm.created_at AS "messageCreatedAt",
                COALESCE(dsm.read_at, dsm.created_at) AS "messageLastAt"
        FROM front.demande_sejour ds
        JOIN front.organismes o ON o.id = ds.organisme_id
        LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id
        LEFT JOIN front.personne_physique pp ON pp.organisme_id = o.id
        LEFT JOIN front.agrements a ON a.organisme_id  = ds.organisme_id
        LEFT JOIN front.demande_sejour_message dsm ON dsm.declaration_id = ds.id AND dsm.id = (
                SELECT MAX(dsmax.id)
                FROM front.demande_sejour_message  dsmax
                WHERE dsmax.declaration_id = ds.id)
        WHERE
        ds.statut <> 'BROUILLON'
        AND (
                EXISTS (
                SELECT
                1
                FROM
                FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT DSTH
                LEFT JOIN FRONT.HEBERGEMENT H ON H.ID = DSTH.HEBERGEMENT_ID
                LEFT JOIN FRONT.ADRESSE A ON A.ID = H.ADRESSE_ID
                WHERE
                DSTH.DEMANDE_SEJOUR_ID = DS.ID
                AND A.DEPARTEMENT = ANY ($1)
        )
        OR
                a.region_obtention = $2)`;
    const paginatedQuery = processQuery(
      query,
      [departementCodes, territoireCode],
      criterias,
      queryParams,
    );

    const response = await Promise.all([
      getPool().query(paginatedQuery.query, paginatedQuery.params),
      getPool().query(
        paginatedQuery.countQuery,
        paginatedQuery.countQueryParams,
      ),
    ]);
    log.i("getByDepartementCodes - Done");
    return {
      count: parseInt(response[1].rows[0].total, 10),
      result: response[0].rows,
    };
  },
};
