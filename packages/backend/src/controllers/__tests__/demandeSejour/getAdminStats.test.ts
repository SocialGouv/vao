import type { NextFunction, Response } from "express";

import { UserRequest } from "../../../types/request";
import AppError from "../../../utils/error";

// Mock du service avec une factory function pour CommonJS
const mockGetAdminStats = jest.fn();

jest.mock("../../../services/DemandeSejour", () => {
  return {
    __esModule: true,
    default: {
      getAdminStats: mockGetAdminStats,
    },
  };
});

jest.mock("../../../utils/logger", () => {
  return jest.fn(() => ({
    e: jest.fn(),
    i: jest.fn(),
    w: jest.fn(),
  }));
});

// Import APRÈS les mocks
const getController = require("../../demandeSejour/getAdminStats");

describe("GET Controller - getAdminStats", () => {
  let mockRequest: Partial<UserRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset des mocks avant chaque test
    jest.clearAllMocks();
    mockGetAdminStats.mockReset();

    // Configuration du mock de la requête
    mockRequest = {
      decoded: {
        territoireCode: "FR",
      },
      departements: [
        { label: "Paris", value: "75" },
        { label: "Rhône", value: "69" },
      ],
    };

    // Configuration du mock de la réponse
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    // Configuration du mock de next
    mockNext = jest.fn();
  });

  describe("Cas de succès", () => {
    it("devrait retourner les statistiques avec un statut 200", async () => {
      // Arrange
      const mockStats = {
        demandesEnCours: 50,
        demandesRefusees: 20,
        demandesValidees: 30,
        totalDemandes: 100,
      };

      mockGetAdminStats.mockResolvedValue({
        stats: mockStats,
      });

      // Act
      await getController(
        mockRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockGetAdminStats).toHaveBeenCalledWith({
        departementCodes: ["75", "69"],
        territoireCode: "FR",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ stats: mockStats });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("devrait gérer le cas où departements est un tableau vide", async () => {
      // Arrange
      mockRequest.departements = [];
      const mockStats = { totalDemandes: 0 };

      mockGetAdminStats.mockResolvedValue({
        stats: mockStats,
      });

      // Act
      await getController(
        mockRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockGetAdminStats).toHaveBeenCalledWith({
        departementCodes: [],
        territoireCode: "FR",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ stats: mockStats });
    });
  });

  describe("Cas d'erreurs - Service", () => {
    it("devrait gérer les erreurs du service DemandeSejour", async () => {
      // Arrange
      const serviceError = new Error("Erreur de base de données");
      mockGetAdminStats.mockRejectedValue(serviceError);

      // Act
      await getController(
        mockRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockGetAdminStats).toHaveBeenCalledWith({
        departementCodes: ["75", "69"],
        territoireCode: "FR",
      });
      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("devrait gérer les AppError du service", async () => {
      // Arrange
      const appError = new AppError("Service indisponible", {
        statusCode: 503,
      });
      mockGetAdminStats.mockRejectedValue(appError);

      // Act
      await getController(
        mockRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(appError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe("Cas limites", () => {
    it("devrait gérer un territoireCode undefined", async () => {
      // Arrange
      mockRequest.decoded = { territoireCode: undefined };
      const mockStats = { totalDemandes: 10 };

      mockGetAdminStats.mockResolvedValue({
        stats: mockStats,
      });

      // Act
      await getController(
        mockRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockGetAdminStats).toHaveBeenCalledWith({
        departementCodes: ["75", "69"],
        territoireCode: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("devrait gérer de nombreux départements", async () => {
      // Arrange
      mockRequest.departements = Array.from({ length: 100 }, (_, i) => ({
        label: `Dept ${i}`,
        value: `${i}`,
      }));
      const mockStats = { totalDemandes: 1000 };

      mockGetAdminStats.mockResolvedValue({
        stats: mockStats,
      });

      // Act
      await getController(
        mockRequest as UserRequest,
        mockResponse as Response,
        mockNext,
      );

      // Assert
      expect(mockGetAdminStats).toHaveBeenCalledWith({
        departementCodes: expect.arrayContaining(["0", "50", "99"]),
        territoireCode: "FR",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
