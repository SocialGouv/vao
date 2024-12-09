import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { FileController } from "./file.controller";
import { FileService } from "./file.service";

@Module({
  controllers: [FileController],
  imports: [AuthModule],
  providers: [FileService],
})
export class FileModule {}
