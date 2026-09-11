import { FeatureFlagName } from "@vao/shared-bridge";
import request from "supertest";

import { statuts as HebergementStatuts } from "../../helpers/hebergement";
import { partOrganisme } from "../../helpers/org-part";
import Hebergement from "../../services/hebergement/Hebergement";
import { HebergementsRepositoryShared } from "../../shared/hebergements/hebergements.repository";
import { HebergementServiceShared } from "../../shared/hebergements/hebergements.service";
import { getPool } from "../../utils/pgpool";
import { buildHebergementFixture } from "../fixtures/hebergementFixture";
import { getFoAppHelper } from "../helpers/appHelper";
import { setFeatureFlagEnabled } from "../helpers/featureFlagHelper";
import {
  getCurrentUniteIdByHebergementId,
  getUniteStatutValue,
} from "../helpers/hebergementDoubleEntryHelper";
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

const FAKE_FILE_UUID = "00000000-0000-0000-0000-000000000001";

const createUserAndOrganisme = async (): Promise<number> => {
  authUser = await createUsagersUser();
  return createOrganisme({ userId: authUser.id });
};

const buildActifFixture = () =>
  buildHebergementFixture({
    informationsLocaux: {
      ...buildHebergementFixture().informationsLocaux,
      fileReponseExploitantOuProprietaire: { uuid: FAKE_FILE_UUID },
      reglementationErp: false,
    },
  });

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("GET /hebergement/:id", () => {
  afterEach(async () => {
    await setFeatureFlagEnabled({
      enabled: false,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
  });

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
    expect(response.body.hebergement.siteId).toBeUndefined();
  });

  it("retourne 400 si l'id est invalide", async () => {
    authUser = await createUsagersUser();
    const response = await request(getFoAppHelper(authUser)).get(
      "/hebergement/abc",
    );

    // TODO: add controller validation to return 400 if the id is invalid
    expect(response.status).toBe(404);
  });

  it("retourne la réponse legacy fusionnée avec les données de l'unité quand le flag est actif", async () => {
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
    const organismeId = await createUserAndOrganisme();
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });

    const response = await request(getFoAppHelper(authUser)).get(
      `/hebergement/${hebergementId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.hebergement.siteId).toEqual(expect.any(String));
    expect(
      response.body.hebergement.informationsLocaux.nombreLitsSuperposes,
    ).toBe(10);
    expect(response.body.hebergement.informationsLocaux.chambresUnisexes).toBe(
      true,
    );
    expect(
      response.body.hebergement.informationsTransport.deplacementProximite,
    ).toBe("Transport en commun");
    expect(response.body.hebergement.informationsTransport.excursion).toBe(
      "Excursions disponibles",
    );
    expect(
      response.body.hebergement.informationsTransport.vehiculesAdaptes,
    ).toBe(true);
  });

  it("retourne la réponse legacy quand le flag est actif mais sans unité courante", async () => {
    await setFeatureFlagEnabled({
      enabled: true,
      name: FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT,
    });
    await createUserAndOrganisme();
    const createResponse = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send(buildActifFixture());
    const hebergementId = createResponse.body.id;

    const unite =
      await HebergementsRepositoryShared.getUniteHebergementById(hebergementId);
    expect(unite).not.toBeNull();
    const client = await getPool().connect();
    try {
      await HebergementsRepositoryShared.unsetUniteHebergementCurrent(
        client,
        unite!.id,
      );
    } finally {
      client.release();
    }

    const response = await request(getFoAppHelper(authUser)).get(
      `/hebergement/${hebergementId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.hebergement.siteId).toBeUndefined();
    expect(
      response.body.hebergement.informationsLocaux.nombreLitsSuperposes,
    ).toBe(10);
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

  it("retourne 400 avec un message explicite si un champ dépasse sa limite", async () => {
    authUser = await createUsagersUser();
    const longEmail = "a".repeat(315);
    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send({
        ...buildHebergementFixture(),
        coordonnees: {
          ...buildHebergementFixture().coordonnees,
          email: `${longEmail}@example.com`,
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "L'adresse courriel ne doit pas dépasser 320 caractères",
    );
    expect(response.body.name).toBe("ValidationError");
  });

  it("retourne 400 si le nom dépasse 80 caractères", async () => {
    authUser = await createUsagersUser();
    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send({
        ...buildHebergementFixture(),
        nom: "a".repeat(81),
      });

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

  it("crée le site, l'unité et le lien site_id sur l'hébergement legacy", async () => {
    const organismeId = await createUserAndOrganisme();
    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send(buildActifFixture());

    expect(response.status).toBe(200);
    const hebergementId = response.body.id;
    expect(hebergementId).toEqual(expect.any(Number));
    expect(organismeId).toEqual(expect.any(Number));

    const unite =
      await HebergementsRepositoryShared.getUniteHebergementById(hebergementId);
    expect(unite).not.toBeNull();
    expect(unite!.current).toBe(true);
    expect(unite!.hebergementId).toEqual(expect.any(String));
    expect(unite!.siteId).toEqual(expect.any(String));
    expect(unite!.nombreCouchageTotal).toBe(10);
    expect(unite!.litsSuperposes).toBe(true);
    expect(unite!.accessibilitePmr).toBe(true);
    expect(unite!.chambresDoubles).toBe(true);
    expect(unite!.separationHommeFemme).toBe(true);
    expect(unite!.couchageIndividuel).toBe(true);
    expect(unite!.rangementIndividuel).toBe(true);
    expect(unite!.amenagementsSpecifiques).toBe(false);
    expect(unite!.reglementationErp).toBe(false);
    expect(unite!.visiteLocaux).toBe(true);
    expect(await getUniteStatutValue(hebergementId)).toBe(
      HebergementStatuts.ACTIF,
    );

    const site = await HebergementsRepositoryShared.getSiteById(unite!.siteId!);
    expect(site).not.toBeNull();
    expect(site!.nomSiteOfficiel).toBe("Hebergement fixture");

    const siteOrganisme = await HebergementsRepositoryShared.getSiteOrganisme(
      unite!.siteId!,
      organismeId,
    );
    expect(siteOrganisme).not.toBeNull();
    expect(siteOrganisme!.respNomPrenom).toBe("Gestionnaire fixture");
    expect(siteOrganisme!.respTelephone).toBe("0102030405");
    expect(siteOrganisme!.excursionDescription).toBe("Excursions disponibles");
    expect(siteOrganisme!.deplacementProximiteDescription).toBe(
      "Transport en commun",
    );
    expect(siteOrganisme!.vehiculesAdaptes).toBe(true);

    expect(
      await HebergementsRepositoryShared.getHebergementSiteId(hebergementId),
    ).toBe(unite!.siteId);
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

  it("archive l'ancienne unité et crée une nouvelle unité courante", async () => {
    await createUserAndOrganisme();
    const createResponse = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send(buildActifFixture());
    const hebergementId = createResponse.body.id;

    const uniteAvant =
      await HebergementsRepositoryShared.getUniteHebergementById(hebergementId);
    expect(uniteAvant).not.toBeNull();

    const response = await request(getFoAppHelper(authUser))
      .post(`/hebergement/${hebergementId}`)
      .send(
        buildHebergementFixture({
          informationsLocaux: {
            ...buildActifFixture().informationsLocaux,
            chambresDoubles: false,
            nombreLits: 25,
            nombreMaxPersonnesCouchage: 25,
          },
          nom: "Hebergement corrige",
        }),
      );

    expect(response.status).toBe(200);

    const ancienneUnite =
      await HebergementsRepositoryShared.getUniteHebergementById(hebergementId);
    expect(ancienneUnite).toBeNull();

    const uniteCouranteId =
      await getCurrentUniteIdByHebergementId(hebergementId);
    expect(uniteCouranteId).not.toBeNull();
    expect(uniteCouranteId).not.toBe(hebergementId);

    const uniteCourante =
      await HebergementsRepositoryShared.getUniteHebergementById(
        uniteCouranteId!,
      );
    expect(uniteCourante).not.toBeNull();
    expect(uniteCourante!.current).toBe(true);
    expect(uniteCourante!.hebergementId).toBe(uniteAvant!.hebergementId);
    expect(uniteCourante!.siteId).toBe(uniteAvant!.siteId);
    expect(uniteCourante!.nombreCouchageTotal).toBe(25);
    expect(uniteCourante!.chambresDoubles).toBe(false);
    expect(await getUniteStatutValue(uniteCouranteId!)).toBe(
      HebergementStatuts.ACTIF,
    );

    const site = await HebergementsRepositoryShared.getSiteById(
      uniteCourante!.siteId!,
    );
    expect(site!.nomSiteOfficiel).toBe("Hebergement corrige");
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

  it("retourne 200 quand la desactivation reussit et crée une unité courante désactivée", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });
    expect(await getUniteStatutValue(hebergementId)).toBe(
      HebergementStatuts.ACTIF,
    );

    const response = await request(getFoAppHelper(authUser)).put(
      `/hebergement/${hebergementId}/desactivate`,
    );

    expect(response.status).toBe(200);

    expect(
      await HebergementsRepositoryShared.getUniteHebergementById(hebergementId),
    ).toBeNull();

    const uniteCouranteId =
      await getCurrentUniteIdByHebergementId(hebergementId);
    expect(uniteCouranteId).not.toBeNull();
    expect(uniteCouranteId).not.toBe(hebergementId);
    expect(await getUniteStatutValue(uniteCouranteId!)).toBe(
      HebergementStatuts.DESACTIVE,
    );
  });
});

describe("PUT /hebergement/:id/reactivate", () => {
  it("retourne 200 et synchronise le statut de l'unité sur actif", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      hebergement: { statut: HebergementStatuts.DESACTIVE },
      organismeId,
      userId: authUser.id,
    });
    expect(await getUniteStatutValue(hebergementId)).toBe(
      HebergementStatuts.DESACTIVE,
    );

    const response = await request(getFoAppHelper(authUser)).put(
      `/hebergement/${hebergementId}/reactivate`,
    );

    expect(response.status).toBe(200);
    expect(await getUniteStatutValue(hebergementId)).toBe(
      HebergementStatuts.ACTIF,
    );
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
  it("retourne 200 avec un body valide et écrit l'unité au statut brouillon", async () => {
    authUser = await createUsagersUser();
    await createOrganisme({ userId: authUser.id });
    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/brouillon")
      .send(buildHebergementFixture());

    expect(response.status).toBe(200);

    const unite = await HebergementsRepositoryShared.getUniteHebergementById(
      response.body.id,
    );
    expect(unite).not.toBeNull();
    expect(unite!.current).toBe(true);
    expect(unite!.siteId).toEqual(expect.any(String));
    expect(await getUniteStatutValue(response.body.id)).toBe(
      HebergementStatuts.BROUILLON,
    );
  });
});

describe("PUT /hebergement/:id/brouillon", () => {
  it("retourne 200 et met à jour l'unité et le site en place", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      hebergement: { statut: HebergementStatuts.BROUILLON },
      organismeId,
      userId: authUser.id,
    });
    const uniteAvant =
      await HebergementsRepositoryShared.getUniteHebergementById(hebergementId);
    const response = await request(getFoAppHelper(authUser))
      .put(`/hebergement/${hebergementId}/brouillon`)
      .send(buildHebergementFixture());

    expect(response.status).toBe(200);

    const uniteApres =
      await HebergementsRepositoryShared.getUniteHebergementById(hebergementId);
    expect(uniteApres).not.toBeNull();
    expect(uniteApres!.current).toBe(true);
    expect(uniteApres!.siteId).toBe(uniteAvant!.siteId);
    expect(uniteApres!.nombreCouchageTotal).toBe(10);
    expect(await getUniteStatutValue(hebergementId)).toBe(
      HebergementStatuts.BROUILLON,
    );

    const site = await HebergementsRepositoryShared.getSiteById(
      uniteApres!.siteId!,
    );
    expect(site!.nomSiteOfficiel).toBe("Hebergement fixture");
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

describe("module site/unite : lectures partagées du référentiel", () => {
  it("retourne le site et l'unité créés via les fonctions du référentiel partagé", async () => {
    await createUserAndOrganisme();
    const createResponse = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send(buildActifFixture());
    const hebergementId = createResponse.body.id;

    const unite =
      await HebergementsRepositoryShared.getUniteHebergementById(hebergementId);
    expect(unite).not.toBeNull();
    expect(unite!.id).toBe(hebergementId);

    const uniteParHebergementId =
      await HebergementServiceShared.getUniteHebergementByHebergementId(
        unite!.hebergementId,
      );
    expect(uniteParHebergementId!.id).toBe(hebergementId);

    const site = await HebergementServiceShared.getSiteById(unite!.siteId!);
    expect(site).not.toBeNull();
    expect(site!.id).toEqual(expect.any(Number));

    const siteParIdentifiant =
      await HebergementsRepositoryShared.getSiteByIdentifier(site!.id);
    expect(siteParIdentifiant!.siteId).toBe(unite!.siteId);

    const sites = await HebergementServiceShared.getSitesByOrganismeId(
      unite!.organismeId,
    );
    expect(sites.some((s) => s.siteId === unite!.siteId)).toBe(true);

    const unitesParSite =
      await HebergementServiceShared.getUniteHebergementsBySiteId(
        unite!.siteId!,
      );
    expect(unitesParSite.some((u) => u.id === unite!.id)).toBe(true);

    expect(
      await HebergementsRepositoryShared.getUniteHebergementTypePensions(
        unite!.id,
      ),
    ).toEqual([]);

    expect(
      await HebergementsRepositoryShared.getHebergementSiteId(hebergementId),
    ).toBe(unite!.siteId);
  });

  it("passe le site courant à false via unsetSiteCurrent", async () => {
    await createUserAndOrganisme();
    const createResponse = await request(getFoAppHelper(authUser))
      .post("/hebergement")
      .send(buildActifFixture());
    const hebergementId = createResponse.body.id;

    const unite =
      await HebergementsRepositoryShared.getUniteHebergementById(hebergementId);
    expect(unite).not.toBeNull();

    const client = await getPool().connect();
    try {
      await HebergementsRepositoryShared.unsetSiteCurrent(
        client,
        unite!.siteId!,
      );
    } finally {
      client.release();
    }

    expect(
      await HebergementsRepositoryShared.getSiteById(unite!.siteId!),
    ).toBeNull();
  });

  it("gère un type d'hébergement inconnu lors de la création d'un site", async () => {
    const organismeId = await createUserAndOrganisme();
    const siteId = await HebergementServiceShared.createSite(
      {
        adresseId: null,
        createdBy: authUser.id,
        deplacementProximiteDescription: null,
        descriptif: null,
        excursionDescription: null,
        hebergementTypeId: null,
        hebergementTypeValue: "type_inconnu",
        nomSiteOfficiel: "Site secondaire",
        organismeId,
        respEmail: null,
        respNomPrenom: null,
        respTelephone: null,
        vehiculesAdaptes: null,
      },
      undefined,
    );

    expect(siteId).toEqual(expect.any(String));
  });

  it("ignore la mise à jour d'une unité inconnue", async () => {
    await createUserAndOrganisme();

    await expect(
      HebergementServiceShared.updateUniteHebergementInPlace(999999, {
        editedBy: authUser.id,
        informationsLocaux: buildHebergementFixture().informationsLocaux,
        statutId: null,
        typePensions: [],
      }),
    ).resolves.toBeUndefined();
  });
});

it("POST /hebergement/:id avec uniteData préserve le contexte legacy", async () => {
  await createUserAndOrganisme();
  const createResponse = await request(getFoAppHelper(authUser))
    .post("/hebergement")
    .send(buildActifFixture());
  const hebergementId = createResponse.body.id;

  const base = buildHebergementFixture();
  await Hebergement.update(
    authUser.id,
    hebergementId,
    {
      ...base,
      informationsLocaux: {
        ...base.informationsLocaux,
        prestationsHotelieres: [],
      },
      uniteData: {
        accessibilitePmr: false,
        litsSuperposes: false,
        nombreCouchageTotal: 10,
        visiteLocaux: true,
      },
    } as Parameters<typeof Hebergement.update>[2] & { uniteData: object },
    HebergementStatuts.ACTIF,
  );

  const uniteCouranteId = await getCurrentUniteIdByHebergementId(hebergementId);
  expect(uniteCouranteId).not.toBeNull();
  expect(uniteCouranteId).not.toBe(hebergementId);

  const uniteCourante = await HebergementServiceShared.getUniteHebergementById(
    uniteCouranteId!,
  );
  expect(uniteCourante!.litsSuperposes).toBe(false);
  expect(uniteCourante!.accessibilitePmr).toBe(false);
});

it("updateStatut rejette avec un statut inconnu", async () => {
  await createUserAndOrganisme();
  const createResponse = await request(getFoAppHelper(authUser))
    .post("/hebergement")
    .send(buildActifFixture());
  const hebergementId = createResponse.body.id;

  await expect(
    Hebergement.updateStatut(authUser.id, hebergementId, "STATUT_INEXISTANT"),
  ).rejects.toThrow(/Statut inconnu/);
});
