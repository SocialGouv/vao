import { Module } from "@nestjs/common";

import { OrganismService } from "./organism.service";

@Module({
  exports: [OrganismService],
  providers: [OrganismService],
})
export class OrganismModule {}
