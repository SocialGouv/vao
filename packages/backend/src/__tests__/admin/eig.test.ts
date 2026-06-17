import { AGREMENT_STATUT, STATUS_USER_FRONT } from "@vao/shared-bridge";
import request from "supertest";

import { roles } from "../../helpers/users";
import eigService from "../../services/eig";
import { mailService } from "../../services/mail";
import { createAgrement } from "../helpers/agrementsHelper";
import { AppHelperUser, getBoAppHelper } from "../helpers/appHelper";
import { createDemandeSejour } from "../helpers/demandeSejourHelper";
import { createEig } from "../helpers/eigHelper";
import { createHebergement } from "../helpers/hebergementHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import {
  createAdminUserValide,
  createUsagersUserValide,
} from "../helpers/userHelper";

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));
jest.mock("../../services/pdf/eig/generate", () =>
  jest.fn().mockResolvedValue(Buffer.from("pdf")),
);

let foUser: AppHelperUser;
let boUser: AppHelperUser;
let declarationId = 0;

beforeAll(async () => {
  await createTestContainer();
  foUser = await createUsagersUserValide({
    statusCode: STATUS_USER_FRONT.VALIDATED,
  });
  boUser = await createAdminUserValide({
    roles: [
      roles.EIG,
      roles.DEMANDE_SEJOUR_LECTURE,
      roles.DEMANDE_SEJOUR_ECRITURE,
    ],
    ter_code: "FRA",
    territoireCode: "FRA",
  });

  const organismeId = await createOrganisme({ userId: foUser.id });
  await createAgrement({
    agrement: {
      regionObtention: "IDF",
      statut: AGREMENT_STATUT.VALIDE,
    },
    organismeId,
  });
  declarationId = await createDemandeSejour({
    organismeId,
    statut: "SEJOUR EN COURS",
  });
  await createHebergement({ declarationId, organismeId });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  (mailService.send as jest.Mock).mockResolvedValue(undefined);
});

describe("Domaine /eig (admin)", () => {
  it("GET /eig/admin/ds/:declarationId retourne les eig", async () => {
    const eigId = await createEig({ declarationId, userId: foUser.id });
    await eigService.depose(eigId);

    const response = await request(getBoAppHelper(boUser)).get(
      `/eig/admin/ds/${declarationId}`,
    );
    expect(response.status).toBe(200);
    expect(response.body.eigs).toBeInstanceOf(Array);
  });

  it("GET /eig/admin retourne la liste admin", async () => {
    const eigId = await createEig({ declarationId, userId: foUser.id });
    await eigService.depose(eigId);

    const response = await request(getBoAppHelper(boUser))
      .get("/eig/admin")
      .query({
        search: "{}",
      });
    expect(response.status).toBe(200);
    expect(response.body.eig).toBeInstanceOf(Array);
    expect(response.body.total).toBeDefined();
  });

  it("GET /eig/admin accepte un tri valide", async () => {
    const eigId = await createEig({ declarationId, userId: foUser.id });
    await eigService.depose(eigId);

    const response = await request(getBoAppHelper(boUser))
      .get("/eig/admin")
      .query({
        search: "{}",
        sortBy: "libelle",
        sortDirection: "ASC",
      });
    expect(response.status).toBe(200);
    expect(response.body.eig).toBeInstanceOf(Array);
    expect(response.body.total).toBeDefined();
  });

  it("GET /eig/admin retourne 400 avec un sortBy invalide", async () => {
    const response = await request(getBoAppHelper(boUser))
      .get("/eig/admin")
      .query({
        search: "{}",
        sortBy: 'id"; SELECT pg_sleep(10); --',
        sortDirection: "ASC",
      });
    expect(response.status).toBe(400);
  });

  it("GET /eig/admin retourne 400 avec un sortDirection invalide", async () => {
    const response = await request(getBoAppHelper(boUser))
      .get("/eig/admin")
      .query({
        search: "{}",
        sortBy: "libelle",
        sortDirection: "INVALID",
      });
    expect(response.status).toBe(400);
  });

  it("GET /eig/admin/pdf/:id retourne un pdf", async () => {
    const eigId = await createEig({ declarationId, userId: foUser.id });
    await eigService.depose(eigId);

    const response = await request(getBoAppHelper(boUser)).get(
      `/eig/admin/pdf/${eigId}`,
    );
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
  });

  it("GET /eig/admin/pdf/:id retourne 500 si eig inconnu", async () => {
    const response = await request(getBoAppHelper(boUser)).get(
      "/eig/admin/pdf/999999999",
    );
    expect(response.status).toBe(400);
  });

  it("GET /eig/admin/total-to-read retourne le total", async () => {
    const response = await request(getBoAppHelper(boUser)).get(
      "/eig/admin/total-to-read",
    );
    expect(response.status).toBe(200);
    expect(response.body.totalToRead).toBeDefined();
  });

  it("GET /eig/admin/:id retourne un eig", async () => {
    const eigId = await createEig({ declarationId, userId: foUser.id });
    await eigService.depose(eigId);

    const response = await request(getBoAppHelper(boUser)).get(
      `/eig/admin/${eigId}`,
    );
    expect(response.status).toBe(200);
    expect(response.body.eig.id).toBe(eigId);
  });

  it("POST /eig/admin/:id/mark-as-read marque comme lu", async () => {
    const eigId = await createEig({ declarationId, userId: foUser.id });
    await eigService.depose(eigId);

    const response = await request(
      getBoAppHelper({ ...boUser, territoireCode: "75" }),
    ).post(`/eig/admin/${eigId}/mark-as-read`);
    expect(response.status).toBe(200);
    expect(response.body.markAsRead).toBe(true);
    expect(mailService.send).toHaveBeenCalledTimes(1);
    const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
    expect(mailPayload.subject).toContain("Consultation de votre EIG");
  });

  it("POST /eig/admin/:id/mark-as-read envoie le mail DREETS", async () => {
    const eigId = await createEig({ declarationId, userId: foUser.id });
    await eigService.depose(eigId);

    const response = await request(
      getBoAppHelper({ ...boUser, territoireCode: "IDF" }),
    ).post(`/eig/admin/${eigId}/mark-as-read`);
    expect(response.status).toBe(200);
    expect(mailService.send).toHaveBeenCalledTimes(1);
    const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
    expect(mailPayload.html).toContain("préfecture");
  });

  it("POST /eig/admin/:id/mark-as-read retourne 400 en statut brouillon", async () => {
    const eigId = await createEig({ declarationId, userId: foUser.id });
    const response = await request(getBoAppHelper(boUser)).post(
      `/eig/admin/${eigId}/mark-as-read`,
    );
    expect(response.status).toBe(400);
    expect(response.body.name).toBe("AppError");
  });
});
