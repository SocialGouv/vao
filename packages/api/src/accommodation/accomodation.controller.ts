import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { ZodValidationPipe } from "nestjs-zod";

import { AuthGuard } from "../auth/auth.guard";
import { CoordinateService } from "../coordinate/coordinate.service";
import { OrganismeService } from "../organisme/organisme.service";
import {
  CreateAccomodation,
  CreateAccomodationDto,
  CreateAccomodationSchema,
} from "../schemas/accomodation.schema";
import type { AuthGuardRequest } from "../types/auth.type";
import { AccomodationService } from "./accomodation.service";

@ApiTags("accomodation")
@ApiBearerAuth()
@Controller("accomodation")
export class AccomodationController {
  constructor(
    private accomodationService: AccomodationService,
    private coordinateService: CoordinateService,
    private organismeService: OrganismeService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new ZodValidationPipe(CreateAccomodationSchema))
  @ApiForbiddenResponse({
    description: "Too many failed attempts, IP is banned.",
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized, invalid or missing token.",
  })
  @ApiBadRequestResponse({
    description:
      "User need organisme to create accomodation | The adresse could not be found",
  })
  async create(
    @Body() accomodationCreateDto: CreateAccomodationDto,
    @Request() req: AuthGuardRequest,
  ) {
    const userId = req.user.id;
    const orgamismePromise = this.organismeService.findOne(userId);
    const coordinatePromise = this.coordinateService.getCoordinate(
      accomodationCreateDto.coordinates.address,
    );
    const [organisme, coordinate] = await Promise.all([
      orgamismePromise,
      coordinatePromise,
    ]);
    if (!organisme) {
      throw new BadRequestException("User is missing organisme");
    }
    if (!coordinate) {
      throw new BadRequestException("The address could not be found.");
    }
    const newAccomodation: CreateAccomodation = {
      ...accomodationCreateDto,
      coordinates: {
        ...accomodationCreateDto.coordinates,
        address: {
          codeInsee: coordinate.properties.citycode,
          codePostal: coordinate.properties.postcode,
          coordinates: coordinate.geometry.coordinates,
          departement: coordinate.properties.context.substring(0, 2),
          label: coordinate.properties.label,
        },
      },
    };
    return this.accomodationService.create(
      newAccomodation,
      userId,
      organisme.id,
    );
  }
}
