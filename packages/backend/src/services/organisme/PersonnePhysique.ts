import {
  TRACKING_ACTIONS,
  TRACKING_ENTITIES,
  TRACKING_USER_TYPE,
} from "@vao/shared-bridge";
import type { PoolClient } from "pg";

import logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";
import { addHistoric } from "../Tracking";

const log = logger(module.filename);

export interface Adresse {
  label: string | null;
  cleInsee: string | null;
  codeInsee: string | null;
  codePostal: string | null;
  coordinates: [number | null, number | null] | null;
  departement: string | null;
}

export interface PersonnePhysiqueParams {
  prenom: string | null;
  nomUsage: string | null;
  nomNaissance: string | null;
  telephone: string | null;
  profession: string | null;
  adresseSiege: Adresse | null;
  adresseDomicile: Adresse | null;
  adresseIdentique: boolean | null;
  siret: string | null;
}

const query = {
  changeCurrent: `
    UPDATE front.personne_physique
    SET current = false,
        edited_at = NOW()
    WHERE id = $1;
  `,
  create: `
    INSERT INTO front.personne_physique (
      organisme_id,
      prenom,
      nom_usage,
      nom_naissance,
      telephone,
      profession,
      adresse_siege_label,
      adresse_siege_cle_insee,
      adresse_siege_code_insee,
      adresse_siege_code_postal,
      adresse_siege_long,
      adresse_siege_lat,
      adresse_siege_departement,
      adresse_domicile_label,
      adresse_domicile_cle_insee,
      adresse_domicile_code_insee,
      adresse_domicile_code_postal,
      adresse_domicile_long,
      adresse_domicile_lat,
      adresse_domicile_departement,
      adresse_identique,
      siret
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
    RETURNING id AS "personnePhysiqueId";
  `,
  getByOrganismeId: `
    SELECT 
      prenom AS "prenom",
      nom_usage AS "nomUsage",
      nom_naissance AS "nomNaissance",
      telephone AS "telephone",
      profession AS "profession",
      JSON_BUILD_OBJECT(
          'label', adresse_siege_label,
          'cleInsee', adresse_siege_cle_insee,
          'codeInsee', adresse_siege_code_insee,
          'codePostal', adresse_siege_code_postal,
          'long', adresse_siege_long,
          'lat', adresse_siege_lat,
          'departement', adresse_siege_departement
      ) AS "adresseSiege",
      JSON_BUILD_OBJECT(
          'label', adresse_domicile_label,
          'cleInsee', adresse_domicile_cle_insee,
          'codeInsee', adresse_domicile_code_insee,
          'codePostal', adresse_domicile_code_postal,
          'long', adresse_domicile_long,
          'lat', adresse_domicile_lat,
          'departement', adresse_domicile_departement
      ) AS "adresseDomicile",
      adresse_identique AS "adresseIdentique",
      siret AS "siret"
    FROM front.personne_physique
    WHERE organisme_id = $1 AND current = true;
  `,
  getHistoricByOrganismeId: `
    SELECT pp.id AS "id",
      pp.siret AS "siret",
      u.nom AS "nom",
      u.prenom AS "prenom",
      pp.edited_at  AS "updatedAt"
    FROM front.personne_physique pp
    JOIN front.user_organisme uo ON pp.organisme_id = uo.org_id 
    JOIN front.users u ON u.id = uo.use_id
    WHERE pp.organisme_id = $1
    AND pp.current = FALSE
    ORDER BY pp.edited_at DESC
    ;
  `,
  getIdByOrganiseId: `
    SELECT *
    FROM front.personne_physique
    WHERE organisme_id = $1 AND current = TRUE;
  `,
  update: `
    UPDATE front.personne_physique
    SET
      prenom = $2,
      nom_usage = $3,
      nom_naissance = $4,
      telephone = $5,
      profession = $6,
      adresse_siege_label = $7,
      adresse_siege_cle_insee = $8,
      adresse_siege_code_insee = $9,
      adresse_siege_code_postal = $10,
      adresse_siege_long = $11,
      adresse_siege_lat = $12,
      adresse_siege_departement = $13,
      adresse_domicile_label = $14,
      adresse_domicile_cle_insee = $15,
      adresse_domicile_code_insee = $16,
      adresse_domicile_code_postal = $17,
      adresse_domicile_long = $18,
      adresse_domicile_lat = $19,
      adresse_domicile_departement = $20,
      adresse_identique = $21,
      siret = $22
    WHERE organisme_id = $1 AND current = true;
  `,
};

export const create = async (
  client: PoolClient,
  organismeId: number,
  parametre: PersonnePhysiqueParams,
  userId: number,
) => {
  log.i("create - IN", parametre);

  const response = await client.query(query.create, [
    organismeId,
    parametre?.prenom ?? null,
    parametre?.nomUsage ?? null,
    parametre?.nomNaissance ?? null,
    parametre?.telephone ?? null,
    parametre?.profession ?? null,
    parametre?.adresseSiege?.label ?? null,
    parametre?.adresseSiege?.cleInsee ?? null,
    parametre?.adresseSiege?.codeInsee ?? null,
    parametre?.adresseSiege?.codePostal ?? null,
    parametre?.adresseSiege?.coordinates?.[0] ?? null,
    parametre?.adresseSiege?.coordinates?.[1] ?? null,
    parametre?.adresseSiege?.departement ?? null,
    parametre?.adresseDomicile?.label ?? null,
    parametre?.adresseDomicile?.cleInsee ?? null,
    parametre?.adresseDomicile?.codeInsee ?? null,
    parametre?.adresseDomicile?.codePostal ?? null,
    parametre?.adresseDomicile?.coordinates?.[0] ?? null,
    parametre?.adresseDomicile?.coordinates?.[1] ?? null,
    parametre?.adresseDomicile?.departement ?? null,
    parametre?.adresseIdentique ?? null,
    parametre?.siret ?? null,
  ]);
  addHistoric({
    action: TRACKING_ACTIONS.creation,
    data: { newData: { ...parametre, organismeId } },
    entity: TRACKING_ENTITIES.personnePhysique,
    entityId: response.rows[0].personnePhysiqueId,
    userId: userId,
    userType: TRACKING_USER_TYPE.front,
  });

  return response.rows[0];
};

export const createOrUpdate = async (
  client: PoolClient,
  organismeId: number,
  parametre: PersonnePhysiqueParams,
  userId: number,
) => {
  log.i("createOrUpdate - IN");

  if (Object.keys(parametre).length === 0) {
    return null;
  }

  const { rows: personnePhysique, rowCount } = await client.query(
    query.getIdByOrganiseId,
    [organismeId],
  );
  let personnePhysiqueId;
  if (rowCount === 0 || parametre.siret !== personnePhysique[0]?.siret) {
    if (rowCount !== 0) {
      await client.query(query.changeCurrent, [personnePhysique[0].id]);
      addHistoric({
        action: TRACKING_ACTIONS.deletion,
        data: { newData: parametre, oldData: personnePhysique[0] },
        entity: TRACKING_ENTITIES.personnePhysique,
        entityId: personnePhysique[0].id,
        userId: userId,
        userType: TRACKING_USER_TYPE.front,
      });
    }
    const newPersonnePhysique = await create(
      client,
      organismeId,
      parametre,
      userId,
    );
    personnePhysiqueId = newPersonnePhysique.personnePhysiqueId;
  } else {
    personnePhysiqueId = personnePhysique[0].id;
  }

  await client.query(query.update, [
    organismeId,
    parametre?.prenom ?? null,
    parametre?.nomUsage ?? null,
    parametre?.nomNaissance ?? null,
    parametre?.telephone ?? null,
    parametre?.profession ?? null,
    parametre?.adresseSiege?.label ?? null,
    parametre?.adresseSiege?.cleInsee ?? null,
    parametre?.adresseSiege?.codeInsee ?? null,
    parametre?.adresseSiege?.codePostal ?? null,
    parametre?.adresseSiege?.coordinates?.[0] ?? null,
    parametre?.adresseSiege?.coordinates?.[1] ?? null,
    parametre?.adresseSiege?.departement ?? null,
    parametre?.adresseDomicile?.label ?? null,
    parametre?.adresseDomicile?.cleInsee ?? null,
    parametre?.adresseDomicile?.codeInsee ?? null,
    parametre?.adresseDomicile?.codePostal ?? null,
    parametre?.adresseDomicile?.coordinates?.[0] ?? null,
    parametre?.adresseDomicile?.coordinates?.[1] ?? null,
    parametre?.adresseDomicile?.departement ?? null,
    parametre?.adresseIdentique ?? null,
    parametre?.siret ?? null,
  ]);
  addHistoric({
    action: TRACKING_ACTIONS.modification,
    data: { newData: parametre, oldData: personnePhysique[0] },
    entity: TRACKING_ENTITIES.personnePhysique,
    entityId: personnePhysiqueId,
    userId: userId,
    userType: TRACKING_USER_TYPE.front,
  });
  log.i("createOrUpdate - DONE");
};

export const getByOrganismeId = async (organismeId: number) => {
  log.i("getByOrganismeId - IN", organismeId);
  const { rowCount, rows } = await getPool().query(query.getByOrganismeId, [
    organismeId,
  ]);
  const { rows: personnePhysiqueHistoric } = await getPool().query(
    query.getHistoricByOrganismeId,
    [organismeId],
  );
  return rowCount === 0
    ? {}
    : { ...rows[0], historic: personnePhysiqueHistoric };
};

module.exports.getHistoricByOrganismeId = async (organismeId: number) => {
  log.i("getHistoricByOrganismeId - IN", organismeId);
  const { rowCount, rows: historic } = await getPool().query(
    query.getHistoricByOrganismeId,
    [organismeId],
  );

  log.i("getHistoricByOrganismeId - DONE");
  return rowCount === 0 ? [] : historic;
};
