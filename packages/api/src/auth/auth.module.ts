import { Module } from "@nestjs/common";

import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";

@Module({
  controllers: [],
  exports: [AuthService],
  imports: [UserModule],
  providers: [AuthService],
})
export class AuthModule {}
