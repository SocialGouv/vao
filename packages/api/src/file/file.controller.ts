import {
  BadRequestException,
  Controller,
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

import { AuthGuard } from "../auth/auth.guard";
import { fileValidationExtension } from "../helpers/file";
import { CreateFileResponse } from "../schemas/file.schema";
import type { AuthGuardRequest } from "../types/auth.type";
import { FileService } from "./file.service";

@ApiTags("file")
@ApiBearerAuth()
@Controller("file")
export class FileController {
  constructor(private fileService: FileService) {}

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
    if (
      !fileValidationExtension(file.filename) &&
      !["application/pdf", "image/png", "image/jpeg"].includes(file.mimetype)
    ) {
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
