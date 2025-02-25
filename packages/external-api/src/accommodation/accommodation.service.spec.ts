import { Test } from "@nestjs/testing";
import { randomUUID } from "crypto";
import { Pool } from "pg";

import { AddressService } from "../address/address.service";
import { CoordinateService } from "../coordinate/coordinate.service";
import { FileService } from "../file/file.service";
import { HotelServiceService } from "../hotelService/hotelService.service";
import { OrganismService } from "../organism/organism.service";
import {
  type Accommodation,
  CreateAccommodation,
  CreateAccommodationDto,
  CreateAccommodationResult,
} from "../schemas/accommodation.schema";
import { Address } from "../schemas/address.schema";
import { Feature } from "../types/geoCodeJson.type";
import { AccommodationService } from "./accommodation.service";

describe("AccommodationService", () => {
  let service: AccommodationService;
  let pool: Pool;
  let addressService: AddressService;
  let hotelServiceService: HotelServiceService;
  let coordinateService: CoordinateService;
  let fileService: FileService;
  let organismService: OrganismService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AccommodationService,
        {
          provide: "PG_CONNECTION",
          useValue: {
            query: jest.fn(),
          },
        },
        {
          provide: AddressService,
          useValue: {
            createFromCoordinates: new AddressService(pool)
              .createFromCoordinates,
            save: jest.fn(),
          },
        },
        {
          provide: HotelServiceService,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: CoordinateService,
          useValue: {
            getCoordinates: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            getMetaDataFile: jest.fn(),
          },
        },
        {
          provide: OrganismService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AccommodationService);
    pool = module.get("PG_CONNECTION");
    addressService = module.get(AddressService);
    hotelServiceService = module.get(HotelServiceService);
    coordinateService = module.get(CoordinateService);
    fileService = module.get(FileService);
    organismService = module.get(OrganismService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(pool).toBeDefined();
    expect(addressService).toBeDefined();
    expect(hotelServiceService).toBeDefined();
    expect(coordinateService).toBeDefined();
    expect(fileService).toBeDefined();
    expect(organismService).toBeDefined();
  });

  describe("build", () => {
    it("should build a CreateAccommodation object from DTO and address", () => {
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
          localInspection: true,
          localInspectionDate: null,
          maxSleepingCapacity: 20,
          numberOfBeds: 10,
          numberOfBunkBeds: 1,
          responseFromOwnerOrOperatorFile: randomUUID(),
          singleSexRooms: true,
          specificAdaptations: true,
          type: "hotel",
        },
        coordinates: {
          address: "new address for test",
          email: "test@example.com",
          managerName: "John Doe",
          phoneNumber1: "1234567890",
          phoneNumber2: "0987654321",
        },
        name: "test",
        transportInfo: {
          adaptedVehicles: false,
          excursion: "",
          nearbyTravel: "",
        },
      };

      const address: Address = {
        department: "32",
        id: 1,
        inseeCode: "inseeCode",
        inseeKey: "inseKey",
        label: "Address for test",
        lat: 1,
        long: 1,
        postalCode: "75001",
      };

      const result = service.build(accommodationCreateDto, address);

      expect(result).toEqual({
        ...accommodationCreateDto,
        coordinates: {
          addressId: 1,
          email: "test@example.com",
          managerName: "John Doe",
          phoneNumber1: "1234567890",
          phoneNumber2: "0987654321",
        },
      });
    });
  });

  describe("checkFiles", () => {
    it("should return an empty array if all files are valid", async () => {
      const userId = 123;
      const uuids = [randomUUID(), randomUUID(), randomUUID()];
      const accommodationInfo: CreateAccommodationDto["accommodationInfo"] = {
        accessibility: "accessible",
        accommodationDescription: "A beautiful hotel with great amenities.",
        accommodationType: "petit_dejeuner",
        bunkBeds: true,
        doubleRooms: true,
        erpRegulations: true,
        hotelServices: [],
        individualBeds: true,
        individualStorage: true,
        lastMayorAuthorizationFile: uuids[0],
        lastSafetyCertificateFile: uuids[1],
        localInspection: true,
        localInspectionDate: "2024-01-01T00:00:00Z",
        maxSleepingCapacity: 20,
        numberOfBeds: 10,
        numberOfBunkBeds: 1,
        responseFromOwnerOrOperatorFile: uuids[2],
        singleSexRooms: true,
        specificAdaptations: true,
        specificAdaptationsDetails: "Some details",
        type: "hotel",
      };

      const metadata = {
        category: "default",
        filename: "test.pdf",
        mimeType: "application/pdf",
        userId: 123,
      };

      jest.spyOn(fileService, "getMetaDataFile").mockResolvedValueOnce({
        ...metadata,
        userId: null, // Legacy with no userId is considered as valid file
        uuid: uuids[0],
      });
      jest.spyOn(fileService, "getMetaDataFile").mockResolvedValueOnce({
        ...metadata,
        uuid: uuids[1],
      });
      jest.spyOn(fileService, "getMetaDataFile").mockResolvedValueOnce({
        ...metadata,
        uuid: uuids[2],
      });

      const result = await service.checkFiles(userId, accommodationInfo);

      expect(fileService.getMetaDataFile).toHaveBeenCalledTimes(3);
      expect(result).toEqual([]);
    });

    it("should return an array of invalid file keys if some files are invalid", async () => {
      const userId = 123;
      const uuids = [randomUUID(), randomUUID(), randomUUID()];
      const accommodationInfo: CreateAccommodationDto["accommodationInfo"] = {
        accessibility: "accessible",
        accommodationDescription: "A beautiful hotel with great amenities.",
        accommodationType: "petit_dejeuner",
        bunkBeds: true,
        doubleRooms: true,
        erpRegulations: true,
        hotelServices: [],
        individualBeds: true,
        individualStorage: true,
        lastMayorAuthorizationFile: uuids[0],
        lastSafetyCertificateFile: uuids[1],
        localInspection: true,
        localInspectionDate: null,
        maxSleepingCapacity: 20,
        numberOfBeds: 10,
        numberOfBunkBeds: 1,
        responseFromOwnerOrOperatorFile: uuids[2],
        singleSexRooms: true,
        specificAdaptations: true,
        type: "hotel",
      };

      const metadata = {
        category: "default",
        filename: "test.pdf",
        mimeType: "application/pdf",
        userId: 123,
      };

      jest.spyOn(fileService, "getMetaDataFile").mockResolvedValueOnce(null); // Invalid file
      jest
        .spyOn(fileService, "getMetaDataFile")
        .mockResolvedValueOnce({ ...metadata, uuid: uuids[1] });
      jest
        .spyOn(fileService, "getMetaDataFile")
        .mockResolvedValueOnce({ ...metadata, userId: 321, uuid: uuids[1] }); // Unauthorized file

      const result = await service.checkFiles(userId, accommodationInfo);

      expect(fileService.getMetaDataFile).toHaveBeenCalledTimes(3);
      expect(result).toEqual([
        "lastMayorAuthorizationFile",
        "responseFromOwnerOrOperatorFile",
      ]);
    });
  });

  describe("delete", () => {
    it("should delete an accommodation if user is authorized and conditions are met", async () => {
      const userId = 123;
      const accommodationId = 123;
      const organism = { id: 123 };
      const accommodation = {
        deleted: false,
        organismId: 123,
        statusId: 1,
      };

      jest.spyOn(organismService, "findOne").mockResolvedValueOnce(organism);
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [accommodation],
      });
      (pool.query as jest.Mock).mockResolvedValueOnce(undefined); // For the delete query

      await expect(
        service.delete(userId, accommodationId),
      ).resolves.toBeUndefined();

      expect(organismService.findOne).toHaveBeenCalledWith(userId);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT organisme_id as "organismeId"/),
        [accommodationId],
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/UPDATE front.hebergement/),
        [accommodationId],
      );
    });

    it("should throw an error if the user does not have an organism", async () => {
      const userId = 123;
      const accommodationId = 123;

      jest.spyOn(organismService, "findOne").mockResolvedValueOnce(null);

      await expect(service.delete(userId, accommodationId)).rejects.toThrow(
        "User is missing organism",
      );

      expect(organismService.findOne).toHaveBeenCalledWith(userId);
    });

    it("should throw an error if the accommodation does not exist or is already deleted", async () => {
      const userId = 123;
      const accommodationId = 123;
      const organism = { id: 123 };

      jest.spyOn(organismService, "findOne").mockResolvedValueOnce(organism);
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await expect(service.delete(userId, accommodationId)).rejects.toThrow(
        "Accommodation not found or already deleted.",
      );

      expect(organismService.findOne).toHaveBeenCalledWith(userId);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT organisme_id as "organismeId"/),
        [accommodationId],
      );
    });

    it("should throw an error if the user is not authorized to delete the accommodation", async () => {
      const userId = 123;
      const accommodationId = 123;
      const organism = { id: 123 };
      const accommodation = {
        deleted: false,
        organismId: 321,
        statusId: 1,
      };

      jest.spyOn(organismService, "findOne").mockResolvedValueOnce(organism);
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [accommodation],
      });

      await expect(service.delete(userId, accommodationId)).rejects.toThrow(
        "You are not authorized to delete this accommodation.",
      );

      expect(organismService.findOne).toHaveBeenCalledWith(userId);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT organisme_id as "organismeId"/),
        [accommodationId],
      );
    });

    it("should throw an error if the accommodation is already marked as deleted", async () => {
      const userId = 123;
      const accommodationId = 123;
      const organism = { id: 123 };
      const accommodation = {
        deleted: true,
        organismId: 123,
        statusId: 3,
      };

      jest.spyOn(organismService, "findOne").mockResolvedValueOnce(organism);
      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [accommodation],
      });

      await expect(service.delete(userId, accommodationId)).rejects.toThrow(
        "Accommodation is already marked as deleted.",
      );

      expect(organismService.findOne).toHaveBeenCalledWith(userId);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT organisme_id as "organismeId"/),
        [accommodationId],
      );
    });
  });

  describe("save", () => {
    it("should save a new accommodation and return the saved object", async () => {
      const responseFromOwnerOrOperatorFile = randomUUID();
      const lastSafetyCertificateFile = randomUUID();
      const accommodationToSave: CreateAccommodation = {
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
          addressId: 1,
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

      const userId = 123;
      const organismId = 123;

      const accommodation: CreateAccommodationResult = {
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
          address: {
            department: "idf",
            id: 1,
            inseeCode: "inseeCode",
            inseeKey: "inseKey",
            label: "Address for test",
            lat: 1,
            long: 1,
            postalCode: "75001",
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

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [accommodation],
      });
      jest.spyOn(hotelServiceService, "save").mockResolvedValueOnce([]);

      const result = await service.save(
        accommodationToSave,
        userId,
        organismId,
      );

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringMatching(/INSERT INTO front.hebergement/),
        expect.any(Array),
      );
      expect(hotelServiceService.save).toHaveBeenCalledWith(
        accommodation.id,
        accommodation.accommodationInfo.hotelServices,
      );
      expect(result).toEqual(accommodation);
    });
  });

  describe("create", () => {
    it("should create a new accommodation and return the saved object", async () => {
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

      const userId = 123;

      const coordinates: Feature = {
        geometry: {
          coordinates: [1, 1],
          type: "Point",
        },
        properties: {
          city: "Paris",
          citycode: "inseeCode",
          context: "32",
          id: "inseKey",
          importance: 0.9,
          label: "Address for test",
          name: "Paris",
          postcode: "75001",
          score: 0.9,
          type: "city",
          x: 1,
          y: 1,
        },
        type: "Feature",
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

      const organism = { id: 123 };

      const accommodationToSave: CreateAccommodation = {
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
          addressId: 1,
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

      const savedAccommodation: Accommodation = {
        accommodationInfo: accommodationToSave.accommodationInfo,
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

      jest.spyOn(service, "checkFiles").mockResolvedValueOnce([]);
      jest.spyOn(organismService, "findOne").mockResolvedValueOnce(organism);
      jest
        .spyOn(coordinateService, "getCoordinates")
        .mockResolvedValueOnce(coordinates);
      jest
        .spyOn(addressService, "save")
        .mockResolvedValueOnce({ ...address, id: 1 });
      jest.spyOn(service, "build").mockReturnValueOnce(accommodationToSave);
      jest.spyOn(service, "save").mockResolvedValueOnce(savedAccommodation);

      const result = await service.create(userId, accommodationCreateDto);

      expect(service.checkFiles).toHaveBeenCalledWith(
        userId,
        accommodationCreateDto.accommodationInfo,
      );
      expect(organismService.findOne).toHaveBeenCalledWith(userId);
      expect(coordinateService.getCoordinates).toHaveBeenCalledWith(
        accommodationCreateDto.coordinates.address,
      );
      expect(addressService.save).toHaveBeenCalledWith(address);
      expect(service.build).toHaveBeenCalledWith(accommodationCreateDto, {
        id: 1,
        ...address,
      });
      expect(service.save).toHaveBeenCalledWith(
        accommodationToSave,
        userId,
        organism.id,
      );
      expect(result).toEqual(savedAccommodation);
    });

    it("should throw an error if files are invalid", async () => {
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

      const organism = { id: 123 };

      const coordinates: Feature = {
        geometry: {
          coordinates: [1, 1],
          type: "Point",
        },
        properties: {
          city: "Paris",
          citycode: "inseeCode",
          context: "32",
          id: "inseKey",
          importance: 0.9,
          label: "Address for test",
          name: "Paris",
          postcode: "75001",
          score: 0.9,
          type: "city",
          x: 1,
          y: 1,
        },
        type: "Feature",
      };

      jest
        .spyOn(service, "checkFiles")
        .mockResolvedValueOnce(["lastMayorAuthorizationFile"]);

      jest
        .spyOn(coordinateService, "getCoordinates")
        .mockResolvedValueOnce(coordinates);

      jest.spyOn(organismService, "findOne").mockResolvedValueOnce(organism);

      await expect(service.create(123, accommodationCreateDto)).rejects.toThrow(
        "Uuids provided for lastMayorAuthorizationFile aren't valid",
      );

      expect(service.checkFiles).toHaveBeenCalled();
    });
  });

  it("should throw an error if organism is missing", async () => {
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

    const organism = null;

    jest
      .spyOn(service, "checkFiles")
      .mockResolvedValueOnce(["lastMayorAuthorizationFile"]);

    jest.spyOn(organismService, "findOne").mockResolvedValueOnce(organism);

    await expect(service.create(123, accommodationCreateDto)).rejects.toThrow(
      "User is missing organism",
    );
  });

  it("should throw an error address is not found", async () => {
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

    const organism = { id: 123 };

    jest
      .spyOn(service, "checkFiles")
      .mockResolvedValueOnce(["lastMayorAuthorizationFile"]);

    jest.spyOn(coordinateService, "getCoordinates").mockResolvedValueOnce(null);

    jest.spyOn(organismService, "findOne").mockResolvedValueOnce(organism);

    await expect(service.create(123, accommodationCreateDto)).rejects.toThrow(
      "The address could not be found.",
    );
  });
});
