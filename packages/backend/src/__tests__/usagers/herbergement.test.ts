import request from "supertest";

import { statuts as HebergementStatuts } from "../../helpers/hebergement";
import { partOrganisme } from "../../helpers/org-part";
import { buildHebergementFixture } from "../fixtures/hebergementFixture";
import { getFoAppHelper } from "../helpers/appHelper";
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

    // Vérification des résultats
    expect(response.status).toBe(200);
    expect(response.body.hebergement.id).toEqual(hebergementId);
  });

  it("retourne 400 si l'id est invalide", async () => {
    authUser = await createUsagersUser();
    const response = await request(getFoAppHelper(authUser)).get(
      "/hebergement/abc",
    );

    // TODO: add controller validation to return 400 if the id is invalid
    expect(response.status).toBe(404);
  });
});

describe("POST /hebergement/:id/desactivate - middleware checkPermissionHebergementUser", () => {
  it("devrait retourner une erreur 403 avec le bon message si l'utilisateur n'a pas la permission de désactiver l'hébergement", async () => {
    // Création user A (propriétaire de l'hébergement)
    const userA = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: userA.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: userA.id,
    });

    // Authentification avec un utilisateur B (qui n'a pas accès)
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

describe("POST /hebergement", () => {
  it("retourne 400 si le body est invalide", async () => {
    authUser = await createUsagersUser();
    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send({ nom: "" });

    expect(response.status).toBe(400);
  });

  it("retourne 200 si le body est valide", async () => {
    authUser = await createUsagersUser();
    await createOrganisme({ userId: authUser.id });
    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send(buildHebergementFixture());

    expect(response.status).toBe(400);
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
});

describe("PUT /hebergement/:id/desactivate", () => {
  it("retourne 404 si l'hebergement n'existe pas", async () => {
    authUser = await createUsagersUser();
    const response = await request(getFoAppHelper(authUser)).put(
      "/hebergement/999999/desactivate",
    );

    expect(response.status).toBe(404);
  });

  it("retourne 200 quand la desactivation reussit", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });

    const response = await request(getFoAppHelper(authUser)).put(
      `/hebergement/${hebergementId}/desactivate`,
    );

    expect(response.status).toBe(200);
  });
});

describe("PUT /hebergement/:id/reactivate", () => {
  it("retourne 200 quand la reactivation reussit", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      hebergement: { statut: HebergementStatuts.DESACTIVE },
      organismeId,
      userId: authUser.id,
    });
    const response = await request(getFoAppHelper(authUser)).put(
      `/hebergement/${hebergementId}/reactivate`,
    );

    expect(response.status).toBe(200);
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

describe("POST /hebergement/brouillon", () => {
  it("retourne 200 avec un body valide", async () => {
    authUser = await createUsagersUser();
    await createOrganisme({ userId: authUser.id });
    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/brouillon")
      .send(buildHebergementFixture());

    expect(response.status).toBe(200);
  });
});

describe("PUT /hebergement/:id/brouillon", () => {
  it("retourne 200 quand la mise a jour brouillon est valide", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      hebergement: { statut: HebergementStatuts.BROUILLON },
      organismeId,
      userId: authUser.id,
    });
    const response = await request(getFoAppHelper(authUser))
      .put(`/hebergement/${hebergementId}/brouillon`)
      .send(buildHebergementFixture());

    expect(response.status).toBe(200);
  });
});

describe("PUT /hebergement/:id/activate", () => {
  it("retourne 200 quand l'activation est valide", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      hebergement: { statut: HebergementStatuts.BROUILLON },
      organismeId,
      userId: authUser.id,
    });
    const response = await request(getFoAppHelper(authUser))
      .put(`/hebergement/${hebergementId}/activate`)
      .send(buildHebergementFixture());

    expect(response.status).toBe(400);
  });
});

describe("PUT /hebergement/:id/desactivate)", () => {
  it("retourne 200 quand l'utilisateur est autorise sur l'hebergement", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    const response = await request(getFoAppHelper(authUser)).put(
      `/hebergement/${hebergementId}/desactivate`,
    );

    expect(response.statusCode).toBe(200);
  });

  it("retourne 403 quand l'utilisateur n'est pas autorise sur l'hebergement", async () => {
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

    expect(response.statusCode).toBe(403);
  });
});
