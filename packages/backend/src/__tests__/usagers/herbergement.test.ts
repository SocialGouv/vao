import { FeatureFlagName } from "@vao/shared-bridge";
import request from "supertest";

import { statuts as HebergementStatuts } from "../../helpers/hebergement";
import { partOrganisme } from "../../helpers/org-part";
import { getPool } from "../../utils/pgpool";
import {
  buildHebergementFixture,
  buildHebergementFixtureToPost,
  buildUniteHebergementFixtureToPost,
} from "../fixtures/hebergementFixture";
import { getFoAppHelper } from "../helpers/appHelper";
import { setFeatureFlagEnabled } from "../helpers/featureFlagHelper";
import { createHebergement } from "../helpers/hebergementHelper";
import {
  createOrganisme,
  getRandomSiretAndSiren,
} from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

let authUser = { id: 1, role: "admin" };

const getHebergementUuid = async (hebergementId: number): Promise<string> => {
  const { rows } = await getPool().query(
    `SELECT hebergement_id FROM front.hebergement WHERE id = $1`,
    [hebergementId],
  );
  return rows[0].hebergement_id;
};

const getStatutIdFromValue = async (value: string): Promise<number> => {
  const { rows } = await getPool().query(
    `SELECT id FROM front.hebergement_statut WHERE value = $1`,
    [value],
  );
  return rows[0].id;
};

const getHebergementTypeIdFromValue = async (
  value: string,
): Promise<number | null> => {
  const { rows } = await getPool().query(
    `SELECT id FROM front.hebergement_type WHERE value = $1`,
    [value],
  );
  return rows[0]?.id ?? null;
};

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("GET /hebergement/:id", () => {
  it("devrait retourner un hébergement par ID avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    const response = await request(getFoAppHelper(authUser)).get(
      `/hebergement/${hebergementId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.hebergement.id).toEqual(hebergementId);
  });

  it("retourne 404 si l'id est invalide", async () => {
    authUser = await createUsagersUser();
    const response = await request(getFoAppHelper(authUser)).get(
      "/hebergement/abc",
    );

    // TODO: add controller validation to return 400 if the id is invalid
    expect(response.status).toBe(404);
  });
});

describe("POST /hebergement", () => {
  it("retourne 400 si le body est invalide", async () => {
    authUser = await createUsagersUser();
    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send({ nom: "" });

    expect(response.status).toBe(400);
  });

  it("retourne 200 si le body est valide et synchronise site/unite_hebergement", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send(buildHebergementFixtureToPost());

    expect(response.status).toBe(200);
    const hebergementId = response.body.id as number;
    expect(hebergementId).toBeDefined();

    const uuid = await getHebergementUuid(hebergementId);
    const { rows: legacyRows } = await getPool().query(
      `SELECT organisme_id, statut_id
       FROM front.hebergement
       WHERE id = $1 AND "current" IS TRUE`,
      [hebergementId],
    );
    expect(legacyRows).toHaveLength(1);
    expect(legacyRows[0].organisme_id).toBe(organismeId);
    expect(legacyRows[0].statut_id).toBe(
      await getStatutIdFromValue(HebergementStatuts.ACTIF),
    );

    const { rows: uniteRows } = await getPool().query(
      `SELECT id, site_id, organisme_id, hebergement_id, "current"
       FROM front.unite_hebergement
       WHERE id = $1`,
      [hebergementId],
    );
    expect(uniteRows).toHaveLength(1);
    expect(uniteRows[0].current).toBe(true);
    expect(uniteRows[0].organisme_id).toBe(organismeId);
    expect(uniteRows[0].hebergement_id).toBe(uuid);
    expect(uniteRows[0].site_id).toBeTruthy();

    const siteId = uniteRows[0].site_id as string;
    const { rows: siteRows } = await getPool().query(
      `SELECT s.nom_site_officiel, s.hebergement_type_id, s.descriptif, s."current", a.label AS adresse_label
       FROM front.site s
       LEFT JOIN front.adresse a ON a.id = s.adresse_id
       WHERE s.site_id = $1`,
      [siteId],
    );
    expect(siteRows).toHaveLength(1);
    expect(siteRows[0].current).toBe(true);
    expect(siteRows[0].nom_site_officiel).toBe("Hebergement fixture");
    expect(siteRows[0].adresse_label).toBe("Hebergement fixture");
    expect(siteRows[0].descriptif).toBe("Description du lieu");
    expect(siteRows[0].hebergement_type_id).toEqual(
      await getHebergementTypeIdFromValue("hotel"),
    );

    const {
      rows: [{ count }],
    } = await getPool().query(
      `SELECT COUNT(*)::int AS count
       FROM front.site_organisme
       WHERE site_id = $1 AND organisme_id = $2`,
      [siteId, organismeId],
    );
    expect(count).toBe(1);

    const {
      rows: [siteOrganisme],
    } = await getPool().query(
      `SELECT nom_site, resp_nom_prenom, resp_telephone, resp_email
       FROM front.site_organisme
       WHERE site_id = $1 AND organisme_id = $2`,
      [siteId, organismeId],
    );
    expect(siteOrganisme.nom_site).toBe("Hebergement fixture");
    expect(siteOrganisme.resp_nom_prenom).toBe("Gestionnaire fixture");
    expect(siteOrganisme.resp_telephone).toBe("0102030405");
    expect(siteOrganisme.resp_email).toBe("hebergement@example.com");
  });
});

describe("POST /hebergement/brouillon", () => {
  it("retourne 200 et synchronise site/unite_hebergement", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/brouillon")
      .send(buildHebergementFixture());

    expect(response.status).toBe(200);
    const hebergementId = response.body.id as number;

    const { rows: legacyRows } = await getPool().query(
      `SELECT statut_id
       FROM front.hebergement
       WHERE id = $1 AND "current" IS TRUE`,
      [hebergementId],
    );
    expect(legacyRows[0].statut_id).toBe(
      await getStatutIdFromValue(HebergementStatuts.BROUILLON),
    );

    const { rows: uniteRows } = await getPool().query(
      `SELECT site_id
       FROM front.unite_hebergement
       WHERE id = $1 AND "current" IS TRUE`,
      [hebergementId],
    );
    expect(uniteRows).toHaveLength(1);
    expect(uniteRows[0].site_id).toBeTruthy();

    const { rows: siteOrganismeRows } = await getPool().query(
      `SELECT 1
       FROM front.site_organisme
       WHERE site_id = $1 AND organisme_id = $2`,
      [uniteRows[0].site_id, organismeId],
    );
    expect(siteOrganismeRows).toHaveLength(1);
  });
});

describe("POST /hebergement/:id", () => {
  it("retourne 400 si le body est invalide", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    const response = await request(getFoAppHelper(authUser))
      .post(`/hebergement/${hebergementId}`)
      .send({ nom: "" });

    expect(response.status).toBe(400);
  });

  it("retourne 200 et versionne legacy + unite_hebergement", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    const uuid = await getHebergementUuid(hebergementId);
    const statutActifId = await getStatutIdFromValue(HebergementStatuts.ACTIF);

    const originalSiteId = (
      await getPool().query(
        `SELECT site_id FROM front.unite_hebergement WHERE id = $1`,
        [hebergementId],
      )
    ).rows[0].site_id as string;

    const response = await request(getFoAppHelper(authUser))
      .post(`/hebergement/${hebergementId}`)
      .send({
        ...buildHebergementFixtureToPost(),
        coordonnees: {
          ...buildHebergementFixtureToPost().coordonnees,
          email: "modifie@example.com",
        },
      });

    expect(response.status).toBe(200);

    const { rows: legacyRows } = await getPool().query(
      `SELECT id, "current", statut_id
       FROM front.hebergement
       WHERE hebergement_id = $1
       ORDER BY id`,
      [uuid],
    );
    expect(legacyRows).toHaveLength(2);
    expect(legacyRows[0].current).toBe(false);
    expect(legacyRows[1].current).toBe(true);
    expect(legacyRows[1].statut_id).toBe(statutActifId);

    const { rows: uniteRows } = await getPool().query(
      `SELECT id, "current", statut_id
       FROM front.unite_hebergement
       WHERE hebergement_id = $1
       ORDER BY id`,
      [uuid],
    );
    expect(uniteRows).toHaveLength(2);
    expect(uniteRows[0].current).toBe(false);
    expect(uniteRows[1].current).toBe(true);
    expect(uniteRows[1].statut_id).toBe(statutActifId);

    const newSiteId = (
      await getPool().query(
        `SELECT site_id FROM front.unite_hebergement WHERE id = $1`,
        [legacyRows[1].id],
      )
    ).rows[0].site_id as string;
    expect(newSiteId).toBe(originalSiteId);

    const {
      rows: [siteOrganisme],
    } = await getPool().query(
      `SELECT resp_email, resp_nom_prenom, resp_telephone
       FROM front.site_organisme
       WHERE site_id = $1 AND organisme_id = $2`,
      [newSiteId, organismeId],
    );
    expect(siteOrganisme.resp_email).toBe("modifie@example.com");
    expect(siteOrganisme.resp_nom_prenom).toBe("Gestionnaire fixture");
    expect(siteOrganisme.resp_telephone).toBe("0102030405");
  });
});

describe("PUT /hebergement/:id/brouillon", () => {
  it("retourne 200 et met à jour unite_hebergement en place", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      hebergement: { statut: HebergementStatuts.BROUILLON },
      organismeId,
      userId: authUser.id,
    });
    const uuid = await getHebergementUuid(hebergementId);

    const response = await request(getFoAppHelper(authUser))
      .put(`/hebergement/${hebergementId}/brouillon`)
      .send({
        ...buildHebergementFixture(),
        informationsLocaux: {
          ...buildHebergementFixture().informationsLocaux,
          chambresDoubles: false,
        },
      });
    expect(response.status).toBe(200);

    const { rows: uniteRows } = await getPool().query(
      `SELECT "current", chambres_doubles
       FROM front.unite_hebergement
       WHERE hebergement_id = $1`,
      [uuid],
    );
    expect(uniteRows).toHaveLength(1);
    expect(uniteRows[0].current).toBe(true);
    expect(uniteRows[0].chambres_doubles).toBe(false);
  });
});

describe("PUT /hebergement/:id/activate", () => {
  it("retourne 200 et bascule le brouillon en actif en place", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      hebergement: { statut: HebergementStatuts.BROUILLON },
      organismeId,
      userId: authUser.id,
    });
    const uuid = await getHebergementUuid(hebergementId);
    const statutActifId = await getStatutIdFromValue(HebergementStatuts.ACTIF);

    const response = await request(getFoAppHelper(authUser))
      .put(`/hebergement/${hebergementId}/activate`)
      .send(buildHebergementFixtureToPost());

    expect(response.status).toBe(200);

    const { rows: legacyRows } = await getPool().query(
      `SELECT "current", statut_id
       FROM front.hebergement
       WHERE hebergement_id = $1`,
      [uuid],
    );
    expect(legacyRows).toHaveLength(1);
    expect(legacyRows[0].current).toBe(true);
    expect(legacyRows[0].statut_id).toBe(statutActifId);

    const { rows: uniteRows } = await getPool().query(
      `SELECT "current", statut_id
       FROM front.unite_hebergement
       WHERE hebergement_id = $1`,
      [uuid],
    );
    expect(uniteRows).toHaveLength(1);
    expect(uniteRows[0].current).toBe(true);
    expect(uniteRows[0].statut_id).toBe(statutActifId);
  });
});

describe("PUT /hebergement/:id/desactivate", () => {
  it("retourne 404 si l'hébergement n'existe pas", async () => {
    authUser = await createUsagersUser();
    const response = await request(getFoAppHelper(authUser)).put(
      "/hebergement/999999/desactivate",
    );

    expect(response.status).toBe(404);
  });

  it("retourne 200 et versionne legacy + unite_hebergement", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    const uuid = await getHebergementUuid(hebergementId);
    const statutDesactiveId = await getStatutIdFromValue(
      HebergementStatuts.DESACTIVE,
    );

    const response = await request(getFoAppHelper(authUser)).put(
      `/hebergement/${hebergementId}/desactivate`,
    );

    expect(response.status).toBe(200);

    const { rows: legacyRows } = await getPool().query(
      `SELECT id, "current", statut_id
       FROM front.hebergement
       WHERE hebergement_id = $1
       ORDER BY id`,
      [uuid],
    );
    expect(legacyRows).toHaveLength(2);
    expect(legacyRows[0].current).toBe(false);
    expect(legacyRows[1].current).toBe(true);
    expect(legacyRows[1].statut_id).toBe(statutDesactiveId);

    const { rows: uniteRows } = await getPool().query(
      `SELECT id, "current", statut_id
       FROM front.unite_hebergement
       WHERE hebergement_id = $1
       ORDER BY id`,
      [uuid],
    );
    expect(uniteRows).toHaveLength(2);
    expect(uniteRows[0].current).toBe(false);
    expect(uniteRows[1].id).toBe(legacyRows[1].id);
    expect(uniteRows[1].current).toBe(true);
    expect(uniteRows[1].statut_id).toBe(statutDesactiveId);
  });

  it("retourne 403 avec le bon message si l'utilisateur n'a pas la permission", async () => {
    const owner = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: owner.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: owner.id,
    });
    authUser = await createUsagersUser();
    const response = await request(getFoAppHelper(authUser)).put(
      `/hebergement/${hebergementId}/desactivate`,
    );

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Utilisateur non autorisé à modifier cet hébergement",
    );
  });
});

describe("PUT /hebergement/:id/reactivate", () => {
  it("retourne 200 et réactive l'hébergement en place", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      hebergement: { statut: HebergementStatuts.DESACTIVE },
      organismeId,
      userId: authUser.id,
    });
    const uuid = await getHebergementUuid(hebergementId);
    const statutActifId = await getStatutIdFromValue(HebergementStatuts.ACTIF);

    const response = await request(getFoAppHelper(authUser)).put(
      `/hebergement/${hebergementId}/reactivate`,
    );

    expect(response.status).toBe(200);

    const { rows: legacyRows } = await getPool().query(
      `SELECT statut_id
       FROM front.hebergement
       WHERE hebergement_id = $1`,
      [uuid],
    );
    expect(legacyRows).toHaveLength(1);
    expect(legacyRows[0].statut_id).toBe(statutActifId);

    const { rows: uniteRows } = await getPool().query(
      `SELECT "current", statut_id
       FROM front.unite_hebergement
       WHERE hebergement_id = $1`,
      [uuid],
    );
    expect(uniteRows).toHaveLength(1);
    expect(uniteRows[0].current).toBe(true);
    expect(uniteRows[0].statut_id).toBe(statutActifId);
  });
});

describe("GET /hebergement", () => {
  it("retourne 200 pour la liste", async () => {
    authUser = await createUsagersUser();
    await createOrganisme({ userId: authUser.id });
    const response = await request(getFoAppHelper(authUser)).get(
      "/hebergement",
    );

    expect(response.status).toBe(200);
  });

  it("retourne tous les hébergements du SIREN siège lorsque search sans statut", async () => {
    authUser = await createUsagersUser();
    const autreUtilisateur = await createUsagersUser();
    const siege = getRandomSiretAndSiren();
    const autreOrganismePm = getRandomSiretAndSiren();
    const siegeOrganismeId = await createOrganisme({
      organisme: {
        siegeSocial: true,
        siren: siege.siren,
        siret: siege.siret,
      },
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: authUser.id,
    });
    const organismeIdHorsProfil = await createOrganisme({
      organisme: {
        siegeSocial: true,
        siren: autreOrganismePm.siren,
        siret: autreOrganismePm.siret,
      },
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: autreUtilisateur.id,
    });
    await createHebergement({
      hebergement: { statut: HebergementStatuts.ACTIF },
      organismeId: siegeOrganismeId,
      userId: authUser.id,
    });
    await createHebergement({
      hebergement: { statut: HebergementStatuts.BROUILLON },
      organismeId: siegeOrganismeId,
      userId: authUser.id,
    });

    const response = await request(getFoAppHelper(authUser))
      .get("/hebergement")
      .query({
        search: JSON.stringify({ organismeId: organismeIdHorsProfil }),
      });

    expect(response.status).toBe(200);
    expect(response.body.hebergements).toHaveLength(2);
  });

  it("retourne uniquement les hébergements du statut demandé lorsque search contient statut", async () => {
    authUser = await createUsagersUser();
    const autreUtilisateur = await createUsagersUser();
    const siege = getRandomSiretAndSiren();
    const autreOrganismePm = getRandomSiretAndSiren();
    const siegeOrganismeId = await createOrganisme({
      organisme: {
        siegeSocial: true,
        siren: siege.siren,
        siret: siege.siret,
      },
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: authUser.id,
    });
    const organismeIdHorsProfil = await createOrganisme({
      organisme: {
        siegeSocial: true,
        siren: autreOrganismePm.siren,
        siret: autreOrganismePm.siret,
      },
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: autreUtilisateur.id,
    });
    await createHebergement({
      hebergement: { statut: HebergementStatuts.ACTIF },
      organismeId: siegeOrganismeId,
      userId: authUser.id,
    });
    await createHebergement({
      hebergement: { statut: HebergementStatuts.BROUILLON },
      organismeId: siegeOrganismeId,
      userId: authUser.id,
    });

    const response = await request(getFoAppHelper(authUser))
      .get("/hebergement")
      .query({
        search: JSON.stringify({
          organismeId: organismeIdHorsProfil,
          statut: HebergementStatuts.ACTIF,
        }),
      });

    expect(response.status).toBe(200);
    expect(response.body.hebergements).toHaveLength(1);
    expect(response.body.hebergements[0].statut).toBe(HebergementStatuts.ACTIF);
  });
});

describe("GET /hebergement/siren/:siren", () => {
  it("retourne 200 avec une liste vide si aucun hébergement pour ce SIREN", async () => {
    authUser = await createUsagersUser();
    const { siret, siren } = getRandomSiretAndSiren();
    await createOrganisme({
      organisme: { siren, siret },
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: authUser.id,
    });
    const response = await request(getFoAppHelper(authUser)).get(
      `/hebergement/siren/${siren}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.hebergement).toEqual([]);
  });

  it("retourne 200 avec les hébergements du SIREN", async () => {
    authUser = await createUsagersUser();
    const { siret, siren } = getRandomSiretAndSiren();
    const organismeId = await createOrganisme({
      organisme: { siren, siret },
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: authUser.id,
    });
    await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    const response = await request(getFoAppHelper(authUser)).get(
      `/hebergement/siren/${siren}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.hebergement).toHaveLength(1);
    expect(response.body.hebergement[0].statut).toBe(HebergementStatuts.ACTIF);
  });
});

describe("GET /hebergement/:id avec flag MODULE_SITE_UNITE_HEBERGEMENT", () => {
  it("retourne les données de unite_hebergement quand le flag est activé", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });

    await getPool().query(
      `UPDATE front.unite_hebergement
       SET amenagements_specifiques = true, accessibilite_pmr = false
       WHERE id = $1 AND "current" IS TRUE`,
      [hebergementId],
    );

    const response = await request(getFoAppHelper(authUser)).get(
      `/hebergement/${hebergementId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.hebergement.siteId).toBeTruthy();
    expect(response.body.hebergement.informationsLocaux.accessibilite).toBe(
      "non_adapte",
    );
    expect(
      response.body.hebergement.informationsLocaux.amenagementsSpecifiques,
    ).toBe(true);
  });

  it("retourne les données legacy quand le flag est désactivé", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    await setFeatureFlagEnabled({
      enabled: false,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });

    const response = await request(getFoAppHelper(authUser)).get(
      `/hebergement/${hebergementId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.hebergement.siteId).toBeNull();
    expect(response.body.hebergement.informationsLocaux.accessibilite).toBe(
      "accessible",
    );
    expect(
      response.body.hebergement.informationsLocaux.amenagementsSpecifiques,
    ).toBe(false);
  });
});

describe("POST /hebergement avec flag MODULE_SITE_UNITE_HEBERGEMENT", () => {
  it("retourne 400 si un body legacy est envoyé quand le flag est activé", async () => {
    authUser = await createUsagersUser();
    await createOrganisme({ userId: authUser.id });
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send(buildHebergementFixtureToPost());

    expect(response.status).toBe(400);
  });

  it("retourne 400 si un body unite est envoyé quand le flag est désactivé", async () => {
    authUser = await createUsagersUser();
    await createOrganisme({ userId: authUser.id });
    await setFeatureFlagEnabled({
      enabled: false,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send(buildUniteHebergementFixtureToPost());

    expect(response.status).toBe(400);
  });

  it("retourne 400 si un body legacy est envoyé en brouillon quand le flag est activé", async () => {
    authUser = await createUsagersUser();
    await createOrganisme({ userId: authUser.id });
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/brouillon")
      .send(buildHebergementFixtureToPost());

    expect(response.status).toBe(400);
  });

  it("retourne 200 et synchronise site/unite_hebergement depuis uniteData", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });

    const body = buildUniteHebergementFixtureToPost();
    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send(body);

    expect(response.status).toBe(200);
    const hebergementId = response.body.id as number;
    expect(hebergementId).toBeDefined();

    const { rows: uniteRows } = await getPool().query(
      `SELECT id, site_id, nombre_couchage_total, separation_homme_femme,
              accessibilite_pmr, lits_superposes, reglementation_erp, "current"
       FROM front.unite_hebergement
       WHERE id = $1`,
      [hebergementId],
    );
    expect(uniteRows).toHaveLength(1);
    expect(uniteRows[0].site_id).toBeTruthy();
    expect(uniteRows[0].nombre_couchage_total).toBe(25);
    expect(uniteRows[0].separation_homme_femme).toBe(true);
    expect(uniteRows[0].accessibilite_pmr).toBe(false);
    expect(uniteRows[0].lits_superposes).toBe(true);
    expect(uniteRows[0].reglementation_erp).toBe(false);
    expect(uniteRows[0].current).toBe(true);

    const { rows: siteRows } = await getPool().query(
      `SELECT s.nom_site_officiel, so.resp_email, so.resp_telephone
       FROM front.site s
       JOIN front.site_organisme so ON so.site_id = s.site_id
       WHERE s.site_id = $1`,
      [uniteRows[0].site_id],
    );
    expect(siteRows).toHaveLength(1);
    expect(siteRows[0].nom_site_officiel).toBe(body.nom);
    expect(siteRows[0].resp_email).toBe("hebergement@example.com");
    expect(siteRows[0].resp_telephone).toBe("0102030405");

    const { rows: legacyRows } = await getPool().query(
      `SELECT organisme_id, statut_id, nom
       FROM front.hebergement
       WHERE id = $1 AND "current" IS TRUE`,
      [hebergementId],
    );
    expect(legacyRows).toHaveLength(1);
    expect(legacyRows[0].organisme_id).toBe(organismeId);
    expect(legacyRows[0].nom).toBe(body.nom);
    expect(legacyRows[0].statut_id).toBe(
      await getStatutIdFromValue(HebergementStatuts.ACTIF),
    );
  });

  it("retourne 200 et versionne unite_hebergement depuis uniteData", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });

    const body = buildUniteHebergementFixtureToPost({
      uniteData: {
        ...buildUniteHebergementFixtureToPost().uniteData,
        nombreCouchageTotal: 40,
        separationHommeFemme: false,
      },
    });
    const response = await request(getFoAppHelper(authUser))
      .post(`/hebergement/${hebergementId}`)
      .send(body);

    expect(response.status).toBe(200);

    const uuid = await getHebergementUuid(hebergementId);

    const { rows: uniteRows } = await getPool().query(
      `SELECT nombre_couchage_total, separation_homme_femme, "current"
       FROM front.unite_hebergement
       WHERE hebergement_id = $1
       ORDER BY id`,
      [uuid],
    );
    expect(uniteRows).toHaveLength(2);
    expect(uniteRows[0].current).toBe(false);
    expect(uniteRows[1].current).toBe(true);
    expect(uniteRows[1].nombre_couchage_total).toBe(40);
    expect(uniteRows[1].separation_homme_femme).toBe(false);
  });
});
