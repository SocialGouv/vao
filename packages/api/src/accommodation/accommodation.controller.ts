import {
  BadRequestException,
  Body,
  Controller,
  Logger,
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
import { UUID } from "crypto";
import { ZodValidationPipe } from "nestjs-zod";

import { AddressService } from "../address/address.service";
import { AuthGuard } from "../auth/auth.guard";
import { CoordinateService } from "../coordinate/coordinate.service";
import { FileService } from "../file/file.service";
import { OrganismService } from "../organism/organism.service";
import {
  CreateAccommodation,
  CreateAccommodationDto,
  CreateAccommodationDtoSchema,
} from "../schemas/accommodation.schema";
import type { AuthGuardRequest } from "../types/auth.type";
import { AccommodationService } from "./accommodation.service";

@ApiTags("accommodation")
@ApiBearerAuth()
@Controller("accommodation")
export class AccommodationController {
  constructor(
    private accommodationService: AccommodationService,
    private coordinateService: CoordinateService,
    private organismService: OrganismService,
    private fileService: FileService,
    private addressService: AddressService,
  ) {}
  private readonly logger = new Logger(AccommodationController.name);

  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new ZodValidationPipe(CreateAccommodationDtoSchema))
  @ApiForbiddenResponse({
    description: "Too many failed attempts, IP is banned.",
  })
  @ApiUnauthorizedResponse({
    description: "Unauthorized, invalid or missing token.",
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
    const organismPromise = this.organismService.findOne(userId);
    const coordinatePromise = this.coordinateService.getCoordinate(
      accommodationCreateDto.coordinates.address,
    );
    const [organism, coordinate] = await Promise.all([
      organismPromise,
      coordinatePromise,
    ]);
    if (!organism) {
      throw new BadRequestException("User is missing organism");
    }
    if (!coordinate) {
      throw new BadRequestException("The address could not be found.");
    }
    const fileToCheck = [
      "lastMayorAuthorizationFile",
      "lastSafetyCertificateFile",
      "responseFromOwnerOrOperatorFile",
    ] as const;
    const filesToCheckPromise = fileToCheck.flatMap((file) =>
      accommodationCreateDto.accommodationInfo[file]
        ? [
            this.fileService.getMetaDataFile(
              accommodationCreateDto.accommodationInfo[file] as UUID,
            ),
          ]
        : [],
    );
    const filesMetaData = await Promise.all(filesToCheckPromise);
    const filesNotOk: string[] = [];
    filesMetaData.forEach((fileMetaData, index) => {
      if (
        !fileMetaData ||
        (fileMetaData.userId !== null && fileMetaData.userId !== userId)
      ) {
        filesNotOk.push(fileToCheck[index]);
      }
    });
    if (filesNotOk.length) {
      throw new BadRequestException(
        `Uuids provided for ${filesNotOk.join(", ")} aren't valid`,
      );
    }
    const newAddress = await this.addressService.create({
      department: coordinate.properties.context.substring(0, 2),
      inseeCode: coordinate.properties.citycode,
      inseeKey: coordinate.properties.id,
      label: coordinate.properties.label,
      lat: coordinate.geometry.coordinates[0],
      long: coordinate.geometry.coordinates[0],
      postalCode: coordinate.properties.postcode,
    });
    const newAccommodation: CreateAccommodation = {
      ...accommodationCreateDto,
      coordinates: {
        addressId: newAddress.id,
        email: accommodationCreateDto.coordinates.email,
        managerName: accommodationCreateDto.coordinates.managerName,
        phoneNumber1: accommodationCreateDto.coordinates.phoneNumber1,
        phoneNumber2: accommodationCreateDto.coordinates.phoneNumber2,
      },
    };
    const accommodation = await this.accommodationService.create(
      newAccommodation,
      userId,
      organism.id,
    );
    return accommodation;
  }
}
