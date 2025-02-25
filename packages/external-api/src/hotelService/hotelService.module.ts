import { Module } from "@nestjs/common";

import { HotelServiceService } from "./hotelService.service";

@Module({
  exports: [HotelServiceService],
  providers: [HotelServiceService],
})
export class HotelServiceModule {}
