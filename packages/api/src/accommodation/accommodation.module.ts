import { Module } from "@nestjs/common";

import { AddressModule } from "../address/address.module";
import { AuthModule } from "../auth/auth.module";
import { CoordinateModule } from "../coordinate/coordinate.module";
import { FileModule } from "../file/file.module";
import { HotelServiceModule } from "../hotelService/hotelService.module";
import { OrganismModule } from "../organism/organism.module";
import { AccommodationController } from "./accommodation.controller";
import { AccommodationService } from "./accommodation.service";

@Module({
  controllers: [AccommodationController],
  imports: [
    AuthModule,
    CoordinateModule,
    OrganismModule,
    FileModule,
    AddressModule,
    HotelServiceModule,
  ],
  providers: [AccommodationService],
})
export class AccommodationModule {}
