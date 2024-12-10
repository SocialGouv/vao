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
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { AuthGuard } from "../auth/auth.guard";
import type { AuthGuardRequest } from "../types/auth.type";
import { FileService } from "./file.service";

@ApiTags("file")
@ApiBearerAuth()
@Controller("file")
export class FileController {
  constructor(private fileService: FileService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor("file"))
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
      type: "object",
    },
  })
  @ApiForbiddenResponse({
    description: "Too many failed attempts, IP is banned.",
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized, invalid or missing token.",
  })
  @ApiBadRequestResponse({
    description: "Invalid file",
  })
  async create(
    @Request() req: AuthGuardRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (
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

    this.fileService.uploadFile(fileData, userId);
    return { status: "success", userId };
  }
}
