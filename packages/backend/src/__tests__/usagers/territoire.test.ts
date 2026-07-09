import { AGREMENT_STATUT } from "@vao/shared-bridge";
import request from "supertest";

import { buildAgrementFixture } from "../fixtures/agrementsFixture";
import { createAgrement } from "../helpers/agrementsHelper";
import { getFoAppHelper } from "../helpers/appHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import { createTerritoire } from "../helpers/territoireHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("GET /territoire/get-by-agrement-region-user", () => {
  it("devrait retourner un territoire pour l'utilisateur l'agrément avec succès", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.VALIDE,
    });
    await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const territoireId = await createTerritoire({
      territoireCode: "IDF",
    });
    const response = await request(getFoAppHelper(frontUser)).get(
      `/territoire/get-by-agrement-region-user`,
    );
    expect(response.status).toBe(200);
    expect(response.body.territoire.territoire_id).toEqual(territoireId);
  });

  it("devrait retourner 404 si aucun agrement n'est lié à l'organisme de cet utilisateur", async () => {
    const frontUser = await createUsagersUser();

    const response = await request(getFoAppHelper(frontUser)).get(
      `/territoire/get-by-agrement-region-user`,
    );

    expect(response.status).toBe(404);
  });
});
