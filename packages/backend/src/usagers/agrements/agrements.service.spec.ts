import { AGREMENT_STATUT } from "@vao/shared-bridge";

import Region from "../../services/geo/Region";
import { mailService } from "../../services/mail";
import Organisme from "../../services/Organisme";
import TerritoireService from "../../services/Territoire";
import { AgrementsRepositoryShared } from "../../shared/agrements/agrements.repository";
import { withTransaction } from "../../utils/pgpool";
import { AgrementMailUsagers } from "./agrements.mail";
import { AgrementsRepository } from "./agrements.repository";
import { AgrementService } from "./agrements.service";

// On mocke le module repository

jest.mock("../../shared/agrements/agrements.repository", () => ({
  AgrementsRepositoryShared: {
    getAllActivites: jest.fn(),
    insertSvaPeriode: jest.fn(),
    updateSvaTimer: jest.fn(),
  },
}));
jest.mock("./agrements.repository", () => ({
  AgrementsRepository: {
    getById: jest.fn(),
    getMessages: jest.fn(),
    getUserMail: jest.fn(),
    insertHistoryEvent: jest.fn(),
    insertMessage: jest.fn(),
    markMessagesAsRead: jest.fn(),
    updateStatut: jest.fn(),
  },
}));
jest.mock("../../utils/pgpool", () => ({
  withTransaction: jest.fn(),
}));
jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));
jest.mock("../../services/Organisme", () => ({
  __esModule: true,
  default: { getOne: jest.fn() },
}));
jest.mock("../../services/geo/Region", () => ({
  __esModule: true,
  default: { fetchOne: jest.fn() },
}));
jest.mock("../../services/Territoire", () => ({
  __esModule: true,
  default: {
    readFicheIdByTerCode: jest.fn(),
    readOne: jest.fn(),
  },
}));
jest.mock("./agrements.mail", () => ({
  AgrementMailUsagers: {
    sendStatutTransmisMail: jest.fn(),
  },
}));

describe("Service: getAllActivites", () => {
  const mockActivites = [
    {
      activite_type: "SPORT",
      code: "BAIGNADE",
      id: 1,
      libelle: "Baignade",
    },
    {
      activite_type: "SPORT",
      code: "RANDONNEE",
      id: 2,
      libelle: "Randonnée",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait appeler AgrementsRepository.getAllActivites et retourner les activités", async () => {
    (AgrementsRepositoryShared.getAllActivites as jest.Mock).mockResolvedValue(
      mockActivites,
    );

    const result = await AgrementService.getAllActivites();

    expect(AgrementsRepositoryShared.getAllActivites).toHaveBeenCalledTimes(1);

    expect(result).toEqual([
      {
        activiteType: "SPORT",
        code: "BAIGNADE",
        id: 1,
        libelle: "Baignade",
      },
      {
        activiteType: "SPORT",
        code: "RANDONNEE",
        id: 2,
        libelle: "Randonnée",
      },
    ]);
  });

  it("devrait propager une erreur si le repository échoue", async () => {
    (AgrementsRepositoryShared.getAllActivites as jest.Mock).mockRejectedValue(
      new Error("Erreur DB"),
    );

    await expect(AgrementService.getAllActivites()).rejects.toThrow(
      "Erreur DB",
    );
  });
});

describe("AgrementService when agrement does not exist (coverage)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AgrementsRepository.getById as jest.Mock).mockResolvedValue(null);
  });

  it("getMessages should throw 404 when agrement does not exist", async () => {
    await expect(AgrementService.getMessages(999999)).rejects.toMatchObject({
      message: "Agrement non trouvé",
      statusCode: 404,
    });
  });

  it("markMessagesAsRead should throw 404 when agrement does not exist", async () => {
    await expect(
      AgrementService.markMessagesAsRead(999999),
    ).rejects.toMatchObject({
      message: "Agrement non trouvé",
      statusCode: 404,
    });
  });

  it("postMessage should throw 404 when agrement does not exist", async () => {
    await expect(
      AgrementService.postMessage({
        agrementId: 999999,
        message: "message test",
        userId: 1,
      }),
    ).rejects.toMatchObject({
      message: "Agrement non trouvé",
      statusCode: 404,
    });
  });

  it("updateStatut should throw 404 when agrement does not exist", async () => {
    await expect(
      AgrementService.updateStatut({
        agrementId: 999999,
        statut: "TRANSMIS" as never,
        usagerUserId: "1",
      }),
    ).rejects.toMatchObject({
      message: "Agrement non trouvé",
      statusCode: 404,
    });
  });
});

describe("AgrementService additional branch coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (withTransaction as jest.Mock).mockImplementation(async (callback) =>
      callback({}),
    );
    (AgrementsRepository.insertHistoryEvent as jest.Mock).mockResolvedValue(
      undefined,
    );
    (mailService.send as jest.Mock).mockResolvedValue(undefined);
    (Organisme.getOne as jest.Mock).mockResolvedValue(null);
    (Region.fetchOne as jest.Mock).mockResolvedValue({ text: "Ile-de-France" });
    (TerritoireService.readFicheIdByTerCode as jest.Mock).mockResolvedValue({
      id: 1,
    });
    (TerritoireService.readOne as jest.Mock).mockResolvedValue({
      service_mail: "region@example.com",
    });
    (AgrementMailUsagers.sendStatutTransmisMail as jest.Mock).mockReturnValue({
      to: "usager@example.com",
    });
  });

  it("postMessage should throw 500 when inserted is false", async () => {
    (AgrementsRepository.getById as jest.Mock).mockResolvedValue({
      id: 1,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    (AgrementsRepository.insertMessage as jest.Mock).mockResolvedValue(false);

    await expect(
      AgrementService.postMessage({
        agrementId: 1,
        message: "test",
        userId: 1,
      }),
    ).rejects.toMatchObject({
      message: "Échec de l'insertion du message",
      statusCode: 500,
    });
  });

  it("updateStatut should throw 500 when updated is false", async () => {
    (AgrementsRepository.getById as jest.Mock).mockResolvedValue({
      dateDepot: null,
      id: 1,
      organismeId: 1,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    (AgrementsRepository.updateStatut as jest.Mock).mockResolvedValue(false);

    await expect(
      AgrementService.updateStatut({
        agrementId: 1,
        statut: AGREMENT_STATUT.TRANSMIS,
        usagerUserId: "1",
      }),
    ).rejects.toMatchObject({
      message: "Échec de la mise à jour du statut",
      statusCode: 500,
    });
  });

  it("updateStatut should return true when email is missing", async () => {
    (AgrementsRepository.getById as jest.Mock).mockResolvedValue({
      dateDepot: null,
      id: 1,
      organismeId: 1,
      regionObtention: null,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    (AgrementsRepository.updateStatut as jest.Mock).mockResolvedValue(true);
    (AgrementsRepository.getUserMail as jest.Mock).mockResolvedValue(null);

    const result = await AgrementService.updateStatut({
      agrementId: 1,
      statut: AGREMENT_STATUT.TRANSMIS,
      usagerUserId: "1",
    });

    expect(result).toBe(true);
    expect(mailService.send).not.toHaveBeenCalled();
  });

  it("updateStatut should handle region without fiche id", async () => {
    (AgrementsRepository.getById as jest.Mock).mockResolvedValue({
      dateDepot: null,
      id: 1,
      organismeId: 1,
      regionObtention: "IDF",
      statut: AGREMENT_STATUT.BROUILLON,
    });
    (AgrementsRepository.updateStatut as jest.Mock).mockResolvedValue(true);
    (AgrementsRepository.getUserMail as jest.Mock).mockResolvedValue(
      "usager@example.com",
    );
    (TerritoireService.readFicheIdByTerCode as jest.Mock).mockResolvedValue(
      null,
    );

    const result = await AgrementService.updateStatut({
      agrementId: 1,
      statut: AGREMENT_STATUT.TRANSMIS,
      usagerUserId: "1",
    });

    expect(result).toBe(true);
    expect(mailService.send).toHaveBeenCalledTimes(1);
  });

  it("updateSvaTimer should throw 500 when timerId is missing", async () => {
    (AgrementsRepositoryShared.updateSvaTimer as jest.Mock).mockResolvedValue(
      null,
    );

    await expect(
      AgrementService.updateSvaTimer({
        agrementId: 1,
        statut: AGREMENT_STATUT.COMPLETUDE_CONFIRME,
        tx: {} as never,
      }),
    ).rejects.toMatchObject({
      message: "SVA Timer non trouvé pour l'agrément",
      statusCode: 500,
    });
  });
});
