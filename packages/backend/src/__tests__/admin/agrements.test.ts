import {
  AGREMENT_HISTORY_TYPE,
  AGREMENT_STATUT,
  AGREMENT_SVA_TIMER_STATUT,
  AgrementDto,
  ERRORS_COMMON,
  FILE_CATEGORY,
  FUNCTIONAL_ERRORS,
  USER_TYPE,
} from "@vao/shared-bridge";
import request from "supertest";

import { AgrementsRepository } from "../../admin/agrements/agrements.repository";
import { AgrementService } from "../../admin/agrements/agrements.service";
import { partOrganisme } from "../../helpers/org-part";
import { mailService } from "../../services/mail";
import { buildAgrementFixture } from "../fixtures/agrementsFixture";
import { createAgrement } from "../helpers/agrementsHelper";
import { createAgrementMessage } from "../helpers/agrementsMessageHelper";
import { AppHelperUser, getBoAppHelper } from "../helpers/appHelper";
import { createDocument } from "../helpers/documentHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import { createTerritoire } from "../helpers/territoireHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createAdminUser, createUsagersUser } from "../helpers/userHelper";

let authUser = { id: 1, role: "admin" };
let authUser2 = { id: 2, role: "admin" };
let authUserBo: AppHelperUser;

beforeAll(async () => await createTestContainer());
afterAll(async () => await removeTestContainer());

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /admin/agrements/activites", () => {
  it("devrait retourner une liste d'activités avec succès", async () => {
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements/activites`,
    );
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.length).toBe(22);
  });
});

describe("GET /admin/agrements", () => {
  it("devrait retourner une liste d'agréments avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId1 = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId: organismeId1,
    });
    const agrementId1 = await createAgrement({
      agrement: agrementData,
      organismeId: organismeId1,
      userId: authUser.id,
    });
    authUser2 = await createUsagersUser();
    const organismeId2 = await createOrganisme({ userId: authUser2.id });
    const agrementData2 = await buildAgrementFixture({
      organismeId: organismeId2,
    });
    const agrementId2 = await createAgrement({
      agrement: agrementData2,
      organismeId: organismeId2,
      userId: authUser2.id,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements`,
    );

    expect(response.status).toBe(200);
    expect(response.body.agrements).toBeDefined();
    expect(response.body.agrements.length).toBe(2);
    expect(response.body.agrements[0].id).toEqual(agrementId1);
    expect(response.body.agrements[1].id).toEqual(agrementId2);
  });

  it("devrait retourner un seul agréments filtré avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId1 = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId: organismeId1,
    });
    await createAgrement({
      agrement: agrementData,
      organismeId: organismeId1,
      userId: authUser.id,
    });
    authUser2 = await createUsagersUser();
    const organismeId2 = await createOrganisme({ userId: authUser2.id });
    const agrementData2 = await buildAgrementFixture({
      organismeId: organismeId2,
    });
    await createAgrement({
      agrement: agrementData2,
      organismeId: organismeId2,
      userId: authUser2.id,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements?limit=1&offset=0&search={"numero":"${agrementData.numero}"}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.agrements).toBeDefined();
    expect(response.body.agrements.length).toBe(1);
    expect(response.body.agrements[0].numero).toEqual(agrementData.numero);
  });
  it("devrait ne retourner aucun agrément avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId1 = await createOrganisme({ userId: authUser.id });
    await buildAgrementFixture({
      organismeId: organismeId1,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements?limit=1&offset=0&siret=80399410200025`,
    );
    expect(response.status).toBe(200);
    expect(response.body.agrements.length).toBe(0);
  });

  it("retourne 400 si le filtre statut est invalide", async () => {
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements?statut=STATUT_INVALIDE`,
    );

    expect(response.status).toBe(400);
    expect(response.body.name).toBe(ERRORS_COMMON.INVALID_QUERY);
  });
});

describe("PATCH /admin/agrements/{idAgrement}/statut", () => {
  it("devrait changer le statut d'un agrément avec succès BROUILLON => EN_COURS", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });

    const response = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.PRIS_EN_CHARGE });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Vérifier que le statut a bien changé en base
    const listResponse = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements`,
    );
    const agrement = listResponse.body.agrements.find(
      (a: AgrementDto) => a.id === agrementId,
    );
    expect(agrement.statut).toBe(AGREMENT_STATUT.PRIS_EN_CHARGE);
  });

  it("devrait remonter une erreur si le statut d'un agrément n'est pas valide", async () => {
    authUser = await createUsagersUser();
    await createOrganisme({ userId: authUser.id });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });

    const response = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/999/statut`)
      .send({ statut: AGREMENT_STATUT.PRIS_EN_CHARGE });

    expect(response.status).toBe(422);
  });

  it("devrait modifier le statut et historiser", async () => {
    const sendSpy = jest.spyOn(mailService, "send");
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const uuid = await createDocument({ userId: null });
    const response = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({
        commentaire: "L'agrément est à modifier",
        file: {
          agrementId,
          category: FILE_CATEGORY.AMODIFER,
          fileUuid: uuid.toString(),
        },
        statut: AGREMENT_STATUT.A_COMPLETER,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(sendSpy).toHaveBeenCalledTimes(1);

    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const aModifierEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.STATUT_CHANGE ||
        event.type_precision === AGREMENT_STATUT.A_COMPLETER,
    );

    expect(aModifierEvent).toBeDefined();
    expect(aModifierEvent?.bo_user).toBeDefined();
  });

  it("devrait modifier le statut COMPLETUDE et historiser", async () => {
    const sendSpy = jest.spyOn(mailService, "send");
    authUser = await createUsagersUser();

    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.PRIS_EN_CHARGE,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    await createTerritoire({ territoireCode: "IDF" });

    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const uuid = await createDocument({ userId: null });
    const response = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({
        file: {
          agrementId,
          category: FILE_CATEGORY.COMPLETUDE,
          fileUuid: uuid.toString(),
        },
        statut: AGREMENT_STATUT.EN_INSTRUCTION,
      });

    expect(response.status).toBe(200);

    const svaTimer = await AgrementsRepository.getSvaTimerByStatut({
      agrementId,
      statut: AGREMENT_SVA_TIMER_STATUT.RUNNING,
    });
    expect(svaTimer?.createdAt).toBeDefined();
    expect(response.body.success).toBe(true);
    expect(sendSpy).toHaveBeenCalledTimes(2); // BO + usager
    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const aModifierEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.STATUT_CHANGE ||
        event.type_precision === AGREMENT_STATUT.EN_INSTRUCTION,
    );

    expect(aModifierEvent).toBeDefined();
    expect(aModifierEvent?.bo_user).toBeDefined();
  });

  it("devrait modifier le statut A_CORRIGER Organisme Personne Morale", async () => {
    const sendSpy = jest.spyOn(mailService, "send");
    authUser = await createUsagersUser();

    const organismeId = await createOrganisme({
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: authUser.id,
    });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.PRIS_EN_CHARGE,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    await createTerritoire({ territoireCode: "IDF" });

    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const uuid = await createDocument({ userId: null });
    const response = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({
        file: {
          agrementId,
          category: FILE_CATEGORY.COMPLETUDE,
          fileUuid: uuid.toString(),
        },
        statut: AGREMENT_STATUT.EN_INSTRUCTION,
      });

    expect(response.status).toBe(200);

    const svaTimer = await AgrementsRepository.getSvaTimerByStatut({
      agrementId,
      statut: AGREMENT_SVA_TIMER_STATUT.RUNNING,
    });
    expect(svaTimer?.createdAt).toBeDefined();
    expect(response.body.success).toBe(true);
    expect(sendSpy).toHaveBeenCalledTimes(2); // BO + usager
    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const completudeConfirmeEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.STATUT_CHANGE ||
        event.type_precision === AGREMENT_STATUT.EN_INSTRUCTION,
    );

    expect(completudeConfirmeEvent).toBeDefined();
    expect(completudeConfirmeEvent?.bo_user).toBeDefined();

    // Passage au statut à CORRIGER
    const uuidACorriger = await createDocument({ userId: null });

    const responseACorriger = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({
        commentaire: "Dossier à corriger rapidement sinon refus du dossier",
        file: {
          agrementId,
          category: FILE_CATEGORY.ACORRIGER,
          fileUuid: uuidACorriger.toString(),
        },
        statut: AGREMENT_STATUT.A_CORRIGER,
      });

    expect(responseACorriger.status).toBe(200);

    expect(responseACorriger.body.success).toBe(true);
    expect(sendSpy).toHaveBeenCalledTimes(4); // BO + usager
  });

  it("devrait modifier le statut A_CORRIGER et historiser Personne Physique", async () => {
    const sendSpy = jest.spyOn(mailService, "send");
    authUser = await createUsagersUser();

    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.PRIS_EN_CHARGE,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    await createTerritoire({ territoireCode: "IDF" });

    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const uuid = await createDocument({ userId: null });
    const response = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({
        file: {
          agrementId,
          category: FILE_CATEGORY.COMPLETUDE,
          fileUuid: uuid.toString(),
        },
        statut: AGREMENT_STATUT.EN_INSTRUCTION,
      });

    expect(response.status).toBe(200);

    const svaTimer = await AgrementsRepository.getSvaTimerByStatut({
      agrementId,
      statut: AGREMENT_SVA_TIMER_STATUT.RUNNING,
    });
    expect(svaTimer?.createdAt).toBeDefined();
    expect(response.body.success).toBe(true);
    expect(sendSpy).toHaveBeenCalledTimes(2); // BO + usager
    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const completudeConfirmeEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.STATUT_CHANGE ||
        event.type_precision === AGREMENT_STATUT.EN_INSTRUCTION,
    );

    expect(completudeConfirmeEvent).toBeDefined();
    expect(completudeConfirmeEvent?.bo_user).toBeDefined();

    // Passage au statut à CORRIGER
    const uuidACorriger = await createDocument({ userId: null });

    const responseACorriger = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({
        commentaire: "Dossier à corriger rapidement sinon refus du dossier",
        file: {
          agrementId,
          category: FILE_CATEGORY.ACORRIGER,
          fileUuid: uuidACorriger.toString(),
        },
        statut: AGREMENT_STATUT.A_CORRIGER,
      });

    expect(responseACorriger.status).toBe(200);

    const svaTimerACorriger = await AgrementsRepository.getSvaTimerByStatut({
      agrementId,
      statut: AGREMENT_SVA_TIMER_STATUT.PAUSED,
    });
    expect(svaTimerACorriger?.createdAt).toBeDefined();
    expect(responseACorriger.body.success).toBe(true);
    expect(sendSpy).toHaveBeenCalledTimes(4); // BO + usager
    // Vérifier que l'événement a bien été historisé
    const historyACorriger = await AgrementService.getHistory(agrementId);
    const aCorrigerEvent = historyACorriger.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.VERIFICATION ||
        event.type_precision === AGREMENT_STATUT.A_COMPLETER,
    );
    expect(aCorrigerEvent).toBeDefined();
    expect(aCorrigerEvent?.bo_user).toBeDefined();
    const commentaireEvent = historyACorriger.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.VERIFICATION &&
        event.type_precision === AGREMENT_STATUT.A_CORRIGER &&
        event.metadata?.commentaire,
    );
    expect(commentaireEvent).toBeDefined();
    expect(commentaireEvent?.bo_user).toBeDefined();
  });

  it("devrait remonter une erreur file required pour statut EN_INSTRUCTION", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.PRIS_EN_CHARGE,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({
        statut: AGREMENT_STATUT.EN_INSTRUCTION,
      });

    expect(response.status).toBe(400);
  });

  it("devrait modifier le statut de l'agrément à VALIDE Organisme Personne Morale", async () => {
    const sendSpy = jest.spyOn(mailService, "send");
    authUser = await createUsagersUser();

    const organismeId = await createOrganisme({
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: authUser.id,
    });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.PRIS_EN_CHARGE,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    await createTerritoire({ territoireCode: "IDF" });

    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const uuid = await createDocument({ userId: null });
    const response = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({
        file: {
          agrementId,
          category: FILE_CATEGORY.COMPLETUDE,
          fileUuid: uuid.toString(),
        },
        statut: AGREMENT_STATUT.EN_INSTRUCTION,
      });

    expect(response.status).toBe(200);

    // Passage au statut à VALIDE
    const uuidArreteAgrement = await createDocument({ userId: null });

    const responseAgrementValide = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({
        file: {
          agrementId,
          category: FILE_CATEGORY.ARRETE_AGREMENT,
          fileUuid: uuidArreteAgrement.toString(),
        },
        numeroAgrement: "AGR-2026-075-00001",
        statut: AGREMENT_STATUT.VALIDE,
      });

    expect(responseAgrementValide.status).toBe(200);

    expect(responseAgrementValide.body.success).toBe(true);
    expect(sendSpy).toHaveBeenCalledTimes(4); // BO + usager
    const svaTimer = await AgrementsRepository.getSvaTimerByStatut({
      agrementId,
      statut: AGREMENT_SVA_TIMER_STATUT.STOPPED,
    });
    expect(svaTimer?.createdAt).toBeDefined();
  });

  it("devrait modifier le statut REFUSE et historiser", async () => {
    const sendSpy = jest.spyOn(mailService, "send");
    authUser = await createUsagersUser();

    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.PRIS_EN_CHARGE,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    await createTerritoire({ territoireCode: "IDF" });

    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const uuid = await createDocument({ userId: null });
    const response = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({
        file: {
          agrementId,
          category: FILE_CATEGORY.REFUS,
          fileUuid: uuid.toString(),
        },
        statut: AGREMENT_STATUT.REFUSE,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(sendSpy).toHaveBeenCalledTimes(1); // usager
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Portail VAO - Refus de votre agrément",
      }),
    );
    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const aModifierEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.STATUT_CHANGE ||
        event.type_precision === AGREMENT_STATUT.REFUSE,
    );

    expect(aModifierEvent).toBeDefined();
    expect(aModifierEvent?.bo_user).toBeDefined();
  });

  it("devrait remonter une erreur file required pour statut REFUSE", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.PRIS_EN_CHARGE,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({
        statut: AGREMENT_STATUT.REFUSE,
      });

    expect(response.status).toBe(400);
  });

  it("devrait retourner une 422 si l'agrément n'existe pas", async () => {
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/999999/statut`)
      .send({ statut: "PRIS_EN_CHARGE" });
    expect(response.status).toBe(422);
    expect(response.body.name).toBe(FUNCTIONAL_ERRORS.AGREMENT_NOT_FOUND);
  });

  it("devrait historiser l'événement de prise en charge", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });

    await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.PRIS_EN_CHARGE });

    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const priseEnChargeEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.STATUT_CHANGE ||
        event.type_precision === AGREMENT_STATUT.PRIS_EN_CHARGE,
    );
    expect(priseEnChargeEvent).toBeDefined();
    expect(priseEnChargeEvent?.bo_user).toBeDefined();
  });

  it("devrait changer retourner une erreur 400 paramètre manquant", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });

    const response = await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.A_COMPLETER });

    expect(response.status).toBe(400);
  });
});

describe("GET /admin/agrements/:id", () => {
  it("devrait retourner un agrément existant avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });

    const response = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements/${agrementId}`,
    );
    expect(response.status).toBe(200);
    expect(response.body.agrement).toBeDefined();
    expect(response.body.agrement.id).toBe(agrementId);
    expect(response.body.agrement.agrementFiles).toBeDefined();
    expect(response.body.agrement.agrementFiles.length).toBeGreaterThanOrEqual(
      2,
    );
  });

  it("devrait retourner une 404 si l'agrément n'existe pas", async () => {
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements/999999`,
    );
    expect(response.status).toBe(404);
  });
});

describe("GET /admin/agrements/history/:agrementId", () => {
  it("devrait retourner l'historique d'un agrément existant", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    await request(getBoAppHelper(authUserBo))
      .patch(`/admin/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.PRIS_EN_CHARGE });
    const response = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements/history/${agrementId}`,
    );
    expect(response.status).toBe(200);
    expect(response.body.history).toBeDefined();
    expect(Array.isArray(response.body.history)).toBe(true);
    expect(response.body.history.length).toBeGreaterThan(0);
    const event = response.body.history[0];
    expect(event).toHaveProperty("id");
    expect(event).toHaveProperty("agrement_id", agrementId);
    expect(event).toHaveProperty("type");
    expect(event).toHaveProperty("created_at");
  });
  it("devrait retourner un tableau vide si aucun historique", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements/history/${agrementId}`,
    );
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.history)).toBe(true);
    expect(response.body.history.length).toBe(0);
  });
  it("devrait retourner 200 et un tableau vide pour un agrément inexistant", async () => {
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
    const response = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements/history/9999999`,
    );
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.history)).toBe(true);
    expect(response.body.history.length).toBe(0);
  });
});

describe("Messagerie d'agrément", () => {
  let agrementId: number;

  beforeEach(async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
      userId: authUser.id,
    });
    authUserBo = await createAdminUser({ territoireCode: "IDF" });
  });

  it("POST /message devrait créer un message et retourner 201", async () => {
    const postResponse = await request(getBoAppHelper(authUserBo))
      .post(`/admin/agrements/${agrementId}/message`)
      .send({ message: "Message de test" });
    expect(postResponse.status).toBe(201);
    expect(postResponse.body.success).toBe(true);
  });

  it("GET /messages devrait retourner les messages existants", async () => {
    await request(getBoAppHelper(authUserBo))
      .post(`/admin/agrements/${agrementId}/message`)
      .send({ message: "Message de test" });

    const getResponse = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements/${agrementId}/messages`,
    );
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.messages).toBeDefined();
    expect(getResponse.body.count).toBe(1);
    expect(getResponse.body.messages[0].message).toBe("Message de test");
    expect(getResponse.body.messages[0].backUserPrenom).toBeDefined();
  });

  it("POST /message devrait retourner 404 pour un agrément inexistant", async () => {
    const response = await request(getBoAppHelper(authUserBo))
      .post(`/admin/agrements/999999/message`)
      .send({ message: "test" });
    expect(response.status).toBe(404);
  });

  it("GET /messages devrait retourner 404 pour un agrément inexistant", async () => {
    const response = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements/999999/messages`,
    );
    expect(response.status).toBe(404);
  });

  it("PATCH /messages devrait marquer tous les messages non lus comme lus et retourner le bon count", async () => {
    await createAgrementMessage({
      agrementId,
      agrementMessage: { front_user_id: authUser.id },
      userType: USER_TYPE.FU,
    });

    await createAgrementMessage({
      agrementId,
      agrementMessage: { front_user_id: authUser.id },
      userType: USER_TYPE.FU,
    });

    const patchResponse = await request(getBoAppHelper(authUserBo)).patch(
      `/admin/agrements/${agrementId}/messages/read`,
    );
    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.count).toBe(2);

    const getResponse = await request(getBoAppHelper(authUserBo)).get(
      `/admin/agrements/${agrementId}/messages`,
    );
    expect(getResponse.body.unreadCount).toBe(0);
  });

  it("PATCH /messages/read devrait retourner 0 si aucun message non lu", async () => {
    const response = await request(getBoAppHelper(authUserBo)).patch(
      `/admin/agrements/${agrementId}/messages/read`,
    );

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(0);
  });

  it("PATCH /messages devrait remonter une erreur si l'agrément n'existe pas", async () => {
    const patchResponse = await request(getBoAppHelper(authUserBo)).patch(
      `/admin/agrements/999/messages/read`,
    );
    expect(patchResponse.status).toBe(404);
  });
});
