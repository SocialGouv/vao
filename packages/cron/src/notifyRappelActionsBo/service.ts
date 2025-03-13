import { pool } from "../db";
import { status } from "@vao/shared";
import type { QueryConfig } from "./type";

export const notifyRappelActionsBo = async () => {
  const response = await pool.query("SELECT * FROM rappel_actions_bo");
  return response.rows;
};

const configurableQuery = ({
  statutsArray,
  additionalColumns = "",
  additionalJoins = "",
  additionalGroupBy = "",
  additionalOrderBy = "",
}: QueryConfig) => `
  WITH hebergement_exploded AS (
    SELECT
      DS.ID as "id",
      DSTH.DATE_DEBUT as "date_debut_hebergement",
      A.CODE_INSEE as "code_insee"
    FROM
      FRONT.DEMANDE_SEJOUR DS
      INNER JOIN FRONT.DEMANDE_SEJOUR_TO_HEBERGEMENT DSTH ON DSTH.DEMANDE_SEJOUR_ID = DS.ID
      INNER JOIN FRONT.HEBERGEMENT H ON H.ID = DSTH.HEBERGEMENT_ID
      INNER JOIN FRONT.ADRESSE A ON A.ID = H.ADRESSE_ID
    )
    SELECT
      ds.id,
      ds.id_fonctionnelle,
      ds.date_debut,
      ds.statut,
      ds.libelle as titre,
      TO_CHAR(ds.date_debut, 'DD/MM/YYYY') as date_debut,
      ${additionalColumns}
      ((ds.date_debut - ((10) * INTERVAL '1 day'))::date <= now()::date) as isalerte,
      string_agg(com.label, ', ' ORDER BY he.date_debut_hebergement::date ASC) AS communes
    FROM
      hebergement_exploded he
      INNER JOIN front.demande_sejour ds ON ds.id = he.id
      INNER JOIN geo.communes com ON com.code_insee = he.code_insee AND com.date_fin is null
      ${additionalJoins}
    WHERE (ds.date_debut)::date>=now()::date
      AND ds.statut IN (${statutsArray})
    GROUP BY
      ds.id,
      ds.id_fonctionnelle,
      ds.date_debut,
      ds.statut,
      ds.libelle,
      ${additionalGroupBy}
      isalerte
    ORDER BY
      ${additionalOrderBy}
      isalerte DESC,
      ds.date_debut ASC;
`;

const getRappelDSBO = () =>
  configurableQuery({
    statutsArray: `'${status.defaultStatus.TRANSMISE}','${status.defaultStatus.EN_COURS}','${status.defaultStatus.TRANSMISE_8J}','${status.defaultStatus.EN_COURS_8J}'`,
    additionalColumns: "use.mail,",
    additionalJoins:
      "INNER JOIN geo.territoires ter ON ter.code = ds.departement_suivi INNER JOIN back.users use ON ter.code = use.ter_code",
    additionalGroupBy: "use.mail,",
    additionalOrderBy: "",
  });

const getRappelDSFUsager = () =>
  configurableQuery({
    statutsArray: `'${status.defaultStatus.ATTENTE_8_JOUR}','${status.defaultStatus.A_MODIFIER}','${status.defaultStatus.A_MODIFIER_8J}'`,
    additionalColumns: `
      STRING_AGG(use.mail, ';') AS mail,
      ((ds.responsable_sejour::jsonb)->>'email')::text as mailresp,
      STRING_AGG(use.mail, ';') || ';' || ((ds.responsable_sejour::jsonb)->>'email')::text as mails,`,
    additionalJoins:
      "INNER JOIN front.user_organisme uso ON uso.org_id = ds.organisme_id INNER JOIN front.users use ON use.id = uso.use_id",
    additionalGroupBy: "ds.organisme_id,mailresp,",
    additionalOrderBy: "",
  });
