import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { randomUUID } from "crypto";

import { AuthService } from "../auth/auth.service";
import {
  type Accommodation,
  CreateAccommodationDto,
} from "../schemas/accommodation.schema";
import { AuthGuardRequest } from "../types/auth.type";
import { AccommodationController } from "./accommodation.controller";
import { AccommodationService } from "./accommodation.service";

describe("FileController", () => {
  let accommodationController: AccommodationController;
  let accommodationService: AccommodationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AccommodationController],
      providers: [
        {
          provide: AccommodationService,
          useValue: {
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    accommodationController = module.get(AccommodationController);
    accommodationService = module.get(AccommodationService);
  });

  it("should be defined", () => {
    expect(accommodationController).toBeDefined();
    expect(accommodationService).toBeDefined();
  });

  describe("delete", () => {
    it("should delete an accommodation and return success message", async () => {
      const userId = 123;
      const accommodationId = 456;
      const req = { user: { id: userId } } as AuthGuardRequest;

      jest
        .spyOn(accommodationService, "delete")
        .mockResolvedValueOnce(undefined);

      const result = await accommodationController.delete(accommodationId, req);

      expect(accommodationService.delete).toHaveBeenCalledWith(
        userId,
        accommodationId,
      );
      expect(result).toEqual({
        message: `Accommodation with id ${accommodationId} successfully deleted.`,
      });
    });

    it("should throw BadRequestException if the service throws BadRequestException", async () => {
      const userId = 123;
      const accommodationId = 456;
      const req = { user: { id: userId } } as AuthGuardRequest;

      jest
        .spyOn(accommodationService, "delete")
        .mockRejectedValueOnce(
          new BadRequestException(
            "Accommodation not found or already deleted.",
          ),
        );

      await expect(
        accommodationController.delete(accommodationId, req),
      ).rejects.toThrow(BadRequestException);

      expect(accommodationService.delete).toHaveBeenCalledWith(
        userId,
        accommodationId,
      );
    });

    it("should throw ForbiddenException if the service throws ForbiddenException", async () => {
      const userId = 123;
      const accommodationId = 456;
      const req = { user: { id: userId } } as AuthGuardRequest;

      jest
        .spyOn(accommodationService, "delete")
        .mockRejectedValueOnce(
          new ForbiddenException(
            "You are not authorized to delete this accommodation.",
          ),
        );

      await expect(
        accommodationController.delete(accommodationId, req),
      ).rejects.toThrow(ForbiddenException);

      expect(accommodationService.delete).toHaveBeenCalledWith(
        userId,
        accommodationId,
      );
    });
  });

  describe("create", () => {
    it("should create an accommodation and return the result", async () => {
      const userId = 123;
      const req = { user: { id: userId } } as AuthGuardRequest;

      const responseFromOwnerOrOperatorFile = randomUUID();
      const lastSafetyCertificateFile = randomUUID();
      const lastMayorAuthorizationFile = randomUUID();

      const accommodationCreateDto: CreateAccommodationDto = {
        accommodationInfo: {
          accessibility: "accessible",
          accommodationDescription: "A beautiful hotel with great amenities.",
          accommodationType: "petit_dejeuner",
          bunkBeds: true,
          doubleRooms: true,
          erpRegulations: true,
          hotelServices: [],
          individualBeds: true,
          individualStorage: true,
          lastMayorAuthorizationFile,
          lastSafetyCertificateFile,
          localInspection: true,
          localInspectionDate: "2024-01-01T00:00:00Z",
          maxSleepingCapacity: 20,
          numberOfBeds: 10,
          numberOfBunkBeds: 1,
          responseFromOwnerOrOperatorFile,
          singleSexRooms: true,
          specificAdaptations: true,
          specificAdaptationsDetails: "Some details",
          type: "hotel",
        },
        coordinates: {
          address: "new address for test",
          email: "test@example.com",
          managerName: "John Doe",
          phoneNumber1: "0123456789",
          phoneNumber2: "0987654321",
        },
        name: "test",
        transportInfo: {
          adaptedVehicles: false,
          excursion: "Some excursion",
          nearbyTravel: "Some nearbyTravel",
        },
      };

      const address = {
        department: "32",
        inseeCode: "inseeCode",
        inseeKey: "inseKey",
        label: "Address for test",
        lat: 1,
        long: 1,
        postalCode: "75001",
      };

      const createdAccommodation: Accommodation = {
        accommodationInfo: accommodationCreateDto.accommodationInfo,
        coordinates: {
          address: {
            ...address,
            id: 1,
          },
          email: "test@example.com",
          managerName: "John Doe",
          phoneNumber1: "0123456789",
          phoneNumber2: "0987654321",
        },
        createdAt: "2024-01-01T00:00:00Z",
        editedAt: "2024-01-01T00:00:00Z",
        id: 123,
        name: "test",
        transportInfo: {
          adaptedVehicles: false,
          excursion: "Some excursion",
          nearbyTravel: "Some nearbyTravel",
        },
      };

      jest
        .spyOn(accommodationService, "create")
        .mockResolvedValueOnce(createdAccommodation);

      const result = await accommodationController.create(
        accommodationCreateDto,
        req,
      );

      expect(accommodationService.create).toHaveBeenCalledWith(
        userId,
        accommodationCreateDto,
      );
      expect(result).toEqual(createdAccommodation);
    });
  });
});
