import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { CoordinateService } from "./coordinate.service";

@Module({
  exports: [CoordinateService],
  imports: [HttpModule],
  providers: [CoordinateService],
})
export class CoordinateModule {}
