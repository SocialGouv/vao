import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { randomUUID } from "crypto";

import { AuthService } from "../auth/auth.service";
import { AuthGuardRequest } from "../types/auth.type";
import { FileController } from "./file.controller";
import { FileService } from "./file.service";

describe("FileController", () => {
  let fileController: FileController;
  let fileService: FileService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: {
            uploadFile: jest.fn(),
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

    fileController = module.get(FileController);
    fileService = module.get(FileService);
  });

  it("should be defined", () => {
    expect(fileController).toBeDefined();
    expect(fileService).toBeDefined();
  });

  it("should throw an error if no file is uploaded", async () => {
    const req = {
      user: { email: "user@email.fr", id: 123 },
    } as AuthGuardRequest;

    await expect(fileController.create(req, null as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should throw an error for invalid file types", async () => {
    const req = {
      user: { email: "user@email.fr", id: 123 },
    } as AuthGuardRequest;
    const invalidFile = {
      buffer: Buffer.from("test"),
      filename: "test.exe",
      mimetype: "application/x-msdos-program",
    } as Express.Multer.File;

    await expect(fileController.create(req, invalidFile)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("should call fileService.uploadFile with correct arguments", async () => {
    const uuid = randomUUID();
    const req = {
      user: { email: "user@email.fr", id: 123 },
    } as AuthGuardRequest;
    const validFile = {
      buffer: Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]), // magic number for pdf
      filename: "test.pdf",
      mimetype: "application/pdf",
      originalname: "test.pdf",
    } as Express.Multer.File;

    jest.spyOn(fileService, "uploadFile").mockResolvedValueOnce(uuid);

    const result = await fileController.create(req, validFile);
    expect(fileService.uploadFile).toHaveBeenCalledWith(
      {
        category: "default",
        data: validFile.buffer,
        filename: validFile.originalname,
        mimetype: validFile.mimetype,
      },
      req.user.id,
    );
    expect(result).toEqual({ status: "success", uuid });
  });
});
