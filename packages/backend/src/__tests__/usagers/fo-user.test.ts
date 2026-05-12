import { STATUS_USER_FRONT } from "@vao/shared-bridge";
import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import checkJWT from "../../middlewares/checkJWT";
import { UsersRepository } from "../../repositories/usagers/Users";
import { link as linkOrganisme } from "../../services/Organisme";
import { User, UserRequest } from "../../types/request";
import {
  createOrganisme,
  generateRandomSiret,
} from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

jest.mock("../../middlewares/checkJWT", () =>
  jest.fn((req: UserRequest, _res: Response, next: NextFunction) => {
    req.decoded = { id: 1 } as unknown as User;
    next();
  }),
);
jest.mock("../../middlewares/checkJWTWithoutCGU", () =>
  jest.fn((_req: UserRequest, _res: Response, next: NextFunction) => next()),
);
jest.mock("../../middlewares/checkPermissionFoRole", () =>
  jest.fn(
    () => (_req: UserRequest, _res: Response, next: NextFunction) => next(),
  ),
);
jest.mock("../../middlewares/checkPermissionBOForUpdateStatusFo", () =>
  jest.fn((_req: UserRequest, _res: Response, next: NextFunction) => next()),
);
jest.mock("../../middlewares/checkPermissionBoForFoStatus", () =>
  jest.fn((_req: UserRequest, _res: Response, next: NextFunction) => next()),
);
jest.mock("../../middlewares/checkPermissionFOForUpdateStatusFo", () =>
  jest.fn((_req: UserRequest, _res: Response, next: NextFunction) => next()),
);

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Domaine /fo-user", () => {
  describe("GET /fo-user/get-roles/", () => {
    it("retourne 500 (UnexpectedError) avec la stack actuelle", async () => {
      const user = await createUsagersUser();

      (checkJWT as jest.Mock).mockImplementation(
        (req: UserRequest, _res: Response, next: NextFunction) => {
          req.decoded = { id: user.id } as unknown as User;
          next();
        },
      );

      const response = await request(app).get("/fo-user/get-roles/");

      expect(response.status).toBe(500);
      expect(response.body.name).toBe("UnexpectedError");
    });
  });

  describe("POST /fo-user/change-status/:userId", () => {
    it("retourne 200 et met à jour le statut avec historique", async () => {
      const actor = await createUsagersUser({
        statusCode: STATUS_USER_FRONT.VALIDATED,
      });
      const orgId = await createOrganisme({ userId: actor.id });

      const stamp = Date.now();
      const { user: created } = await UsersRepository.create({
        user: {
          email: `cible-change-status-${stamp}@example.com`,
          nom: "Cible",
          password: "Motdepassevalid1!",
          prenom: "Statut",
          siret: generateRandomSiret(),
          status_code: STATUS_USER_FRONT.BLOCKED,
          telephone: "0102030405",
          ter_code: "FRA",
        },
      });
      const target = created[0];
      await linkOrganisme(target.id, orgId);

      (checkJWT as jest.Mock).mockImplementation(
        (req: UserRequest, _res: Response, next: NextFunction) => {
          req.decoded = { id: actor.id } as unknown as User;
          next();
        },
      );

      const response = await request(app)
        .post(`/fo-user/change-status/${target.id}`)
        .query({ status: STATUS_USER_FRONT.VALIDATED })
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Status updated");
    });

    it("retourne 400 quand le statut est invalide", async () => {
      const response = await request(app)
        .post("/fo-user/change-status/1")
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.name).toBe("AppError");
    });
  });

  describe("POST /fo-user/accept-cgu", () => {
    it("retourne 403 sans utilisateur authentifié (JWT sans CGU)", async () => {
      const response = await request(app).post("/fo-user/accept-cgu").send({});

      expect(response.status).toBe(403);
    });
  });

  describe("GET /fo-user/get-one/:userId", () => {
    it("retourne 200 avec le détail utilisateur", async () => {
      const user = await createUsagersUser();
      await createOrganisme({ userId: user.id });

      (checkJWT as jest.Mock).mockImplementation(
        (req: UserRequest, _res: Response, next: NextFunction) => {
          req.decoded = { id: user.id } as unknown as User;
          next();
        },
      );

      const response = await request(app).get(`/fo-user/get-one/${user.id}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
    });
  });

  describe("GET /fo-user/list", () => {
    it("retourne 200 avec users et total", async () => {
      const user = await createUsagersUser();

      (checkJWT as jest.Mock).mockImplementation(
        (req: UserRequest, _res: Response, next: NextFunction) => {
          req.decoded = { id: user.id } as unknown as User;
          next();
        },
      );

      const response = await request(app).get("/fo-user/list");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("users");
      expect(response.body).toHaveProperty("total");
    });
  });

  describe("GET /fo-user/get-by-organisme", () => {
    it("retourne 200 avec les utilisateurs de l'organisme", async () => {
      const user = await createUsagersUser();
      await createOrganisme({ userId: user.id });

      (checkJWT as jest.Mock).mockImplementation(
        (req: UserRequest, _res: Response, next: NextFunction) => {
          req.decoded = { id: user.id } as unknown as User;
          next();
        },
      );

      const response = await request(app).get("/fo-user/get-by-organisme");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("users");
      expect(response.body).toHaveProperty("total");
    });
  });

  describe("POST /fo-user/roles/:userId", () => {
    it("retourne 200 et met à jour les rôles", async () => {
      const user = await createUsagersUser();

      (checkJWT as jest.Mock).mockImplementation(
        (req: UserRequest, _res: Response, next: NextFunction) => {
          req.decoded = { id: user.id } as unknown as User;
          next();
        },
      );

      const response = await request(app)
        .post(`/fo-user/roles/${user.id}`)
        .send({ roles: [] });

      expect(response.status).toBe(200);
      expect(response.body.userRole).toBeDefined();
    });
  });

  describe("POST /fo-user/update-status/:userId", () => {
    it("retourne 200 et envoie l'email (source FO)", async () => {
      const cible = await createUsagersUser();

      (checkJWT as jest.Mock).mockImplementation(
        (req: UserRequest, _res: Response, next: NextFunction) => {
          req.decoded = { id: cible.id } as unknown as User;
          next();
        },
      );

      const response = await request(app)
        .post(`/fo-user/update-status/${cible.id}`)
        .query({ status: STATUS_USER_FRONT.NEED_SIRET_VALIDATION })
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Email sent");
    });
  });
});
