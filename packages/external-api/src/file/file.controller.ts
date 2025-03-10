import "multer";

import {
  BadRequestException,
  Controller,
  Logger,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Express } from "express";
import { filetypeinfo } from "magic-bytes.js";

import { AuthGuard } from "../auth/auth.guard";
import {
  fileValidationExtension,
  fileValidationMimetype,
} from "../helpers/file";
import { CreateFileResponse } from "../schemas/file.schema";
import type { AuthGuardRequest } from "../types/auth.type";
import { FileService } from "./file.service";

@ApiTags("file")
@ApiBearerAuth()
@Controller("file")
export class FileController {
  constructor(private fileService: FileService) {}
  private readonly logger = new Logger(FileController.name);

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 5 * 1048576 } }), // 5 * 1MB
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "File to upload",
    schema: {
      properties: {
        file: {
          format: "binary",
          type: "string",
        },
      },
      required: ["file"],
      type: "object",
    },
  })
  @ApiOkResponse({ description: "Upload a file", type: CreateFileResponse })
  @ApiUnauthorizedResponse({
    description:
      "Unauthorized, invalid or missing token. | Too many failed attempts, IP is banned.",
  })
  @ApiBadRequestResponse({
    description: "Missing file | Invalid file",
  })
  async create(
    @Request() req: AuthGuardRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("Missing file");
    }

    try {
      const [result] = filetypeinfo(file.buffer);
      if (
        !fileValidationExtension(result?.extension ?? "") ||
        !fileValidationMimetype(result?.mime ?? "")
      ) {
        throw new BadRequestException("Invalid file type");
      }
    } catch (error) {
      if (!(error instanceof BadRequestException)) {
        this.logger.error(error);
      }
      throw new BadRequestException("Invalid file type");
    }

    const userId = req.user.id;

    const fileData = {
      category: "default",
      data: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
    };

    const uuid = await this.fileService.uploadFile(fileData, userId);
    return { status: "success", uuid };
  }
}
