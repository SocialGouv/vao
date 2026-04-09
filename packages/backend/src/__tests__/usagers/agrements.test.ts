import { AGREMENT_STATUT, USER_TYPE } from "@vao/shared-bridge";
import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import checkJwt from "../../middlewares/checkJWT";
import { mailService } from "../../services/mail";
import { User, UserRequest } from "../../types/request";
import { buildAgrementFixture } from "../helper/fixtures/agrementsFixture";
import {
  createAgrement,
  getAgrement,
} from "../helper/fixtures/agrementsHelper";
import { createAgrementMessage } from "../helper/fixtures/agrementsMessageHelper";
import { createOrganisme } from "../helper/fixtures/organismeHelper";
import {
  createAdminUser,
  createUsagersUser,
} from "../helper/fixtures/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

jest.mock("../../middlewares/checkJWT", () =>
  jest.fn((req: UserRequest, _res: Response, next: NextFunction) => {
    req.decoded = { id: 1, role: "admin" } as unknown as User;
    next();
  }),
);

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

beforeAll(async () => await createTestContainer());
afterAll(async () => await removeTestContainer());

beforeEach(() => {
  jest.resetAllMocks();
});

describe("GET /agrements/", () => {
  it("devrait retourner une liste d'agréments lié à l'utilisateur connecté", async () => {
    const authUser = await createUsagersUser();
    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: authUser.id };
      next();
    });
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(app).get(`/agrements/`);

    // Vérification des résultats
    expect(response.status).toBe(200);
    expect(response.body.agrements).not.toBeNull();
    expect(response.body.agrements[0].id).toEqual(agrementId);
  });
  it("devrait retourner une liste avec un agrement valide à l'utilisateur connecté", async () => {
    const authUser = await createUsagersUser();
    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: authUser.id };
      next();
    });
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData1 = await buildAgrementFixture({ organismeId });
    await createAgrement({
      agrement: agrementData1,
      organismeId,
    });
    const agrementData2 = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.VALIDE,
    });
    const agrementId2 = await createAgrement({
      agrement: agrementData2,
      organismeId,
    });
    const response = await request(app).get(`/agrements?statut=VALIDE`);

    // Vérification des résultats
    expect(response.status).toBe(200);
    expect(response.body.agrements).not.toBeNull();
    expect(response.body.agrements[0].id).toEqual(agrementId2);
  });
});

describe("GET /agrements/:agrementId", () => {
  it("devrait retourner un agrément", async () => {
    const authUser = await createUsagersUser();
    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: authUser.id };
      next();
    });
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(app).get(`/agrements/${agrementId}`);

    // Vérification des résultats
    expect(response.status).toBe(200);
    expect(response.body.agrement).not.toBeNull();
    expect(response.body.agrement.id).toEqual(agrementId);
  });

  it("devrait retourner un agrément introuvalbe", async () => {
    const authUser = await createUsagersUser();
    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: authUser.id };
      next();
    });
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(app).get(`/agrements/invalid`);

    expect(response.status).toBe(400);
  });
  it("devrait retourner un agrement introuvable", async () => {
    const adminUser = await createUsagersUser();
    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: adminUser.id };
      next();
    });
    const organismeId = await createOrganisme({ userId: adminUser.id });
    const response = await request(app).get(
      `/agrements/organisme/${organismeId}`,
    );

    // Vérification des résultats
    expect(response.status).toBe(404);
  });
});

describe("POST /agrements", () => {
  it("devrait créer un agrément (POST /agrements)", async () => {
    const adminUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: adminUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: adminUser.id };
      next();
    });

    const response = await request(app).post(`/agrements/`).send(agrementData);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
  it("devrait mettre à jour un agrément (POST /agrements)", async () => {
    const adminUser = await createUsagersUser();
    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: adminUser.id };
      next();
    });
    const organismeId = await createOrganisme({ userId: adminUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.VALIDE,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const { agrement } = await getAgrement(agrementId);
    const response = await request(app).post(`/agrements/`).send(agrement!);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});

describe("PATCH /agrements/:agrementId/statut", () => {
  it("devrait changer le statut d'un agrément avec succès", async () => {
    const adminUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: adminUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: adminUser.id };
      next();
    });
    const response = await request(app)
      .patch(`/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.TRANSMIS });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const { agrement } = await getAgrement(agrementId);
    expect(agrement?.statut).toBe(AGREMENT_STATUT.TRANSMIS);
  });

  it("workflow changement statut de l'agrement", async () => {
    const adminUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: adminUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: adminUser.id };
      next();
    });
    const response = await request(app)
      .patch(`/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.TRANSMIS });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const { agrement } = await getAgrement(agrementId);
    expect(agrement?.statut).toBe(AGREMENT_STATUT.TRANSMIS);

    expect(mailService.send).toHaveBeenCalledTimes(1);
  });
});

describe("Messagerie d'agrément", () => {
  let agrementId: number;

  beforeEach(async () => {
    const authUser = await createUsagersUser();
    (checkJwt as jest.Mock).mockImplementation((req, _res, next) => {
      req.decoded = { id: authUser.id };
      next();
    });
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
  });

  it("POST /message devrait créer un message et retourner 201", async () => {
    const postResponse = await request(app)
      .post(`/agrements/${agrementId}/message`)
      .send({ message: "Message de test" });
    expect(postResponse.status).toBe(201);
    expect(postResponse.body.success).toBe(true);
  });

  it("GET /messages devrait retourner les messages existants", async () => {
    await request(app)
      .post(`/agrements/${agrementId}/message`)
      .send({ message: "Message de test" });

    const getResponse = await request(app).get(
      `/agrements/${agrementId}/messages`,
    );
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.messages).toBeDefined();
    expect(getResponse.body.count).toBe(1);
    expect(getResponse.body.messages[0].message).toBe("Message de test");
    expect(getResponse.body.messages[0].backUserPrenom).toBeDefined();
  });

  it("POST /message devrait retourner 404 pour un agrément inexistant", async () => {
    const response = await request(app)
      .post(`/agrements/999999/message`)
      .send({ message: "test" });
    expect(response.status).toBe(404);
  });

  it("GET /messages devrait retourner 404 pour un agrément inexistant", async () => {
    const response = await request(app).get(`/agrements/999999/messages`);
    expect(response.status).toBe(404);
  });

  it("PATCH /messages devrait marquer tous les messages non lus comme lus et retourner le bon count", async () => {
    const authUserBo = await createAdminUser({ territoireCode: "IDF" });
    await createAgrementMessage({
      agrementId,
      agrementMessage: { back_user_id: authUserBo.id },
      userType: USER_TYPE.BO,
    });
    await createAgrementMessage({
      agrementId,
      agrementMessage: { back_user_id: authUserBo.id },
      userType: USER_TYPE.BO,
    });
    await request(app).get(`/agrements/${agrementId}/messages`);

    const patchResponse = await request(app).patch(
      `/agrements/${agrementId}/messages/read`,
    );
    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.count).toBe(2);

    const getResponse = await request(app).get(
      `/agrements/${agrementId}/messages`,
    );
    expect(getResponse.body.unreadCount).toBe(0);
  });
});
