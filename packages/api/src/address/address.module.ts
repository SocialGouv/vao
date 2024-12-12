import { Module } from "@nestjs/common";

import { AddressService } from "./address.service";

@Module({
  exports: [AddressService],
  providers: [AddressService],
})
export class AddressModule {}
