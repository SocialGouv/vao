import { Module } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { SentryGlobalFilter, SentryModule } from "@sentry/nestjs/setup";
import { ZodValidationPipe } from "nestjs-zod";

import { AccomodationModule } from "./accommodation/accomodation.module";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database.module";
import { FileModule } from "./file/file.module";
import { OrganismeModule } from "./organisme/organisme.module";
import { S3Module } from "./s3.module";
import { UserModule } from "./user/user.module";

@Module({
  controllers: [AppController],
  imports: [
    SentryModule.forRoot(),
    DatabaseModule,
    S3Module,
    AccomodationModule,
    AuthModule,
    FileModule,
    OrganismeModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
