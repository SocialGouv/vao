import { FeatureFlagName } from "@vao/shared-bridge";
import request from "supertest";

import { statuts as HebergementStatuts } from "../../helpers/hebergement";
import { partOrganisme } from "../../helpers/org-part";
import { HebergementsRepositoryShared } from "../../shared/hebergements/hebergements.repository";
import { buildHebergementFixture } from "../fixtures/hebergementFixture";
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

const createUserAndSiege = async (): Promise<{
  organismeId: number;
  siren: string;
}> => {
  authUser = await createUsagersUser();
  const { siren, siret } = getRandomSiretAndSiren();
  const organismeId = await createOrganisme({
    organisme: {
      siegeSocial: true,
      siren,
      siret,
    },
    typeOrganisme: partOrganisme.PERSONNE_MORALE,
    userId: authUser.id,
  });
  return { organismeId, siren };
};

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("GET /hebergement/sites", () => {
  afterEach(async () => {
    await setFeatureFlagEnabled({
      enabled: false,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
  });

  it("retourne une liste vide quand le module est désactivé", async () => {
    await setFeatureFlagEnabled({
      enabled: false,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
    const { organismeId } = await createUserAndSiege();
    await createHebergement({ organismeId, userId: authUser.id });

    const response = await request(getFoAppHelper(authUser)).get(
      "/hebergement/sites",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ rows: [], total: 0 });
  });

  it("retourne 400 si sortBy n'est pas une colonne de tri valide", async () => {
    authUser = await createUsagersUser();

    const response = await request(getFoAppHelper(authUser))
      .get("/hebergement/sites")
      .query({ sortBy: "colonne_inexistante" });

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("INVALID_QUERY");
    expect(response.body.message).toContain(
      "sortBy must be one of the following values",
    );
  });

  it("retourne 400 si sortDirection n'est pas ASC/DESC", async () => {
    authUser = await createUsagersUser();

    const response = await request(getFoAppHelper(authUser))
      .get("/hebergement/sites")
      .query({ sortDirection: "LATERAL" });

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("INVALID_QUERY");
  });

  it("retourne les sites du périmètre OVA (siège + établissements du même SIREN)", async () => {
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
    const { organismeId, siren } = await createUserAndSiege();
    await createHebergement({ organismeId, userId: authUser.id });

    const etabUser = await createUsagersUser();
    const etab = getRandomSiretAndSiren();
    const etabOrganismeId = await createOrganisme({
      organisme: {
        siegeSocial: false,
        siren,
        siret: etab.siret,
      },
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: etabUser.id,
    });
    await createHebergement({
      organismeId: etabOrganismeId,
      userId: etabUser.id,
    });

    const response = await request(getFoAppHelper(authUser)).get(
      "/hebergement/sites",
    );

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.rows).toHaveLength(2);
    for (const row of response.body.rows) {
      expect(row.id).toEqual(expect.any(Number));
      expect(row.siteId).toEqual(expect.any(String));
      expect(row.nom).toBe("Hebergement fixture");
      expect(row.statut).toBe(HebergementStatuts.ACTIF);
      expect([organismeId, etabOrganismeId]).toContain(row.organismeId);
    }
  });

  it("exclut les sites d'organismes hors périmètre OVA (SIREN différent)", async () => {
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
    const { organismeId } = await createUserAndSiege();
    await createHebergement({ organismeId, userId: authUser.id });

    const autreUtilisateur = await createUsagersUser();
    const autre = getRandomSiretAndSiren();
    const horsPerimetreOrganisme = await createOrganisme({
      organisme: {
        siegeSocial: true,
        siren: autre.siren,
        siret: autre.siret,
      },
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: autreUtilisateur.id,
    });
    await createHebergement({
      organismeId: horsPerimetreOrganisme,
      userId: autreUtilisateur.id,
    });

    const response = await request(getFoAppHelper(authUser)).get(
      "/hebergement/sites",
    );

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.rows[0].organismeId).toBe(organismeId);
  });

  it("filtre les sites par statut", async () => {
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
    const { organismeId } = await createUserAndSiege();
    await createHebergement({
      hebergement: { statut: HebergementStatuts.ACTIF },
      organismeId,
      userId: authUser.id,
    });
    await createHebergement({
      hebergement: { statut: HebergementStatuts.BROUILLON },
      organismeId,
      userId: authUser.id,
    });

    const response = await request(getFoAppHelper(authUser))
      .get("/hebergement/sites")
      .query({ statut: HebergementStatuts.ACTIF });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.rows[0].statut).toBe(HebergementStatuts.ACTIF);
  });

  it("filtre les sites par nom (recherche partielle insensible à la casse)", async () => {
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
    const { organismeId } = await createUserAndSiege();
    await createHebergement({ organismeId, userId: authUser.id });

    const response = await request(getFoAppHelper(authUser))
      .get("/hebergement/sites")
      .query({ nom: "hebergement" });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
  });

  it("retourne les sites paginés avec limit/offset", async () => {
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
    const { organismeId } = await createUserAndSiege();
    await createHebergement({ organismeId, userId: authUser.id });
    await createHebergement({ organismeId, userId: authUser.id });

    const response = await request(getFoAppHelper(authUser))
      .get("/hebergement/sites")
      .query({ limit: 1, offset: 0 });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.rows).toHaveLength(1);
  });

  it("respecte la cohérence entre le statut legacy et celui de l'unité courante", async () => {
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
    const { organismeId } = await createUserAndSiege();
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });

    const unite =
      await HebergementsRepositoryShared.getUniteHebergementById(hebergementId);
    expect(unite).not.toBeNull();

    const response = await request(getFoAppHelper(authUser)).get(
      "/hebergement/sites",
    );

    expect(response.status).toBe(200);
    expect(response.body.rows[0].statut).toBe(HebergementStatuts.ACTIF);
    expect(response.body.rows[0].id).toBe(unite!.id);
  });

  it("trie les sites par défaut par id descendant (plus récents d'abord)", async () => {
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
    const { organismeId } = await createUserAndSiege();
    const premier = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    const second = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    const troisieme = await createHebergement({
      organismeId,
      userId: authUser.id,
    });

    const response = await request(getFoAppHelper(authUser)).get(
      "/hebergement/sites",
    );

    expect(response.status).toBe(200);
    expect(response.body.rows.map((row: { id: number }) => row.id)).toEqual([
      troisieme,
      second,
      premier,
    ]);
  });

  it("désactiver un site ne duplique pas l'unité courante dans la liste", async () => {
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
    const { organismeId } = await createUserAndSiege();
    await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    const aDesactiver = await createHebergement({
      organismeId,
      userId: authUser.id,
    });

    const desactivateResponse = await request(getFoAppHelper(authUser)).put(
      `/hebergement/${aDesactiver}/desactivate`,
    );
    expect(desactivateResponse.status).toBe(200);

    const response = await request(getFoAppHelper(authUser)).get(
      "/hebergement/sites",
    );

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.rows).toHaveLength(2);
    const statuts = response.body.rows.map(
      (row: { statut: string }) => row.statut,
    );
    expect(statuts).toContain(HebergementStatuts.ACTIF);
    expect(statuts).toContain(HebergementStatuts.DESACTIVE);
    const siteIds = response.body.rows.map(
      (row: { siteId: string }) => row.siteId,
    );
    expect(new Set(siteIds).size).toBe(2);
  });

  it("désactiver un site avec pension ne régresse pas (200, pensions conservées, pas de doublon)", async () => {
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
    const { organismeId } = await createUserAndSiege();
    await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    // Pension RÉELLE (valeur présente dans front.hebergement_type_pension) : c'est
    // le cas qui déclenche une ligne unite_hebergement_to_type_pension et qui
    // provoquait la foreign_key_violation lors du re-key de l'unité (500).
    const aDesactiver = await createHebergement({
      hebergement: {
        ...buildHebergementFixture(),
        informationsLocaux: {
          ...buildHebergementFixture().informationsLocaux,
          pension: "demi_pension",
        },
      },
      organismeId,
      userId: authUser.id,
    });

    const desactivateResponse = await request(getFoAppHelper(authUser)).put(
      `/hebergement/${aDesactiver}/desactivate`,
    );
    expect(desactivateResponse.status).toBe(200);

    const response = await request(getFoAppHelper(authUser)).get(
      "/hebergement/sites",
    );
    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.rows).toHaveLength(2);

    const desactivedRow = response.body.rows.find(
      (row: { statut: string }) => row.statut === HebergementStatuts.DESACTIVE,
    );
    expect(desactivedRow).toBeDefined();

    const pensions =
      await HebergementsRepositoryShared.getUniteHebergementTypePensions(
        desactivedRow.id as number,
      );
    expect(pensions).toContain("demi_pension");
  });
});
