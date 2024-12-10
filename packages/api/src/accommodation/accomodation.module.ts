import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { CoordinateModule } from "../coordinate/coordinate.module";
import { OrganismeModule } from "../organisme/organisme.module";
import { AccomodationController } from "./accomodation.controller";
import { AccomodationService } from "./accomodation.service";

@Module({
  controllers: [AccomodationController],
  imports: [AuthModule, CoordinateModule, OrganismeModule],
  providers: [AccomodationService],
})
export class AccomodationModule {}
