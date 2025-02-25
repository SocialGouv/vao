import {
  Body,
  Controller,
  Delete,
  Logger,
  Param,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";

import { AuthGuard } from "../auth/auth.guard";
import {
  type Accommodation,
  CreateAccommodationDto,
  CreateAccommodationDtoSchema,
  CreateAccommodationResult,
} from "../schemas/accommodation.schema";
import type { AuthGuardRequest } from "../types/auth.type";
import { AccommodationService } from "./accommodation.service";

@ApiTags("accommodation")
@ApiBearerAuth()
@Controller("accommodation")
export class AccommodationController {
  constructor(private accommodationService: AccommodationService) {}
  private readonly logger = new Logger(AccommodationController.name);

  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new ZodValidationPipe(CreateAccommodationDtoSchema))
  @ApiCreatedResponse({
    description: "The record has been successfully created.",
    type: CreateAccommodationResult,
  })
  @ApiUnauthorizedResponse({
    description:
      "Unauthorized, invalid or missing token. | Too many failed attempts, IP is banned.",
  })
  @ApiBadRequestResponse({
    description:
      "User need organism to create accommodation | The address could not be found | files are",
  })
  async create(
    @Body() accommodationCreateDto: CreateAccommodationDto,
    @Request() req: AuthGuardRequest,
  ) {
    const userId = req.user.id;
    return this.accommodationService.create(userId, accommodationCreateDto);
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  @ApiOkResponse({
    description: "Item successfully deleted.",
    schema: {
      example: { message: "Item with id 123 successfully deleted." },
      properties: {
        message: { type: "string" },
      },
    },
  })
  @ApiParam({
    description: "Id of the accomodation to delete",
    name: "id",
    required: true,
    type: String,
  })
  @ApiUnauthorizedResponse({
    description:
      "Unauthorized, invalid or missing token. | Too many failed attempts, IP is banned.",
  })
  @ApiForbiddenResponse({
    description: "You are not authorized to delete this accommodation.",
  })
  @ApiBadRequestResponse({
    description:
      "User need organism to delete accommodation | Accommodation not found or already deleted | Accommodation is already marked as deleted",
  })
  async delete(
    @Param("id") id: Accommodation["id"],
    @Request() req: AuthGuardRequest,
  ) {
    const userId = req.user.id;
    await this.accommodationService.delete(userId, id);

    return { message: `Accommodation with id ${id} successfully deleted.` };
  }
}
