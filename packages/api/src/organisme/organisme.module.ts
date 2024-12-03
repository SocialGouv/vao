import { Module } from "@nestjs/common";

import { OrganismeService } from "./organisme.service";

@Module({
  exports: [OrganismeService],
  providers: [OrganismeService],
})
export class OrganismeModule {}
