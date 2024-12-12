import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { SentryGlobalFilter, SentryModule } from "@sentry/nestjs/setup";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";

import { AccommodationModule } from "./accommodation/accommodation.module";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { FileModule } from "./file/file.module";
import { DatabaseModule } from "./global/database.module";
import { S3Module } from "./global/s3.module";
import { OrganismModule } from "./organism/organism.module";
import { UserModule } from "./user/user.module";

@Module({
  controllers: [AppController],
  imports: [
    SentryModule.forRoot(),
    DatabaseModule,
    S3Module,
    AccommodationModule,
    AuthModule,
    FileModule,
    OrganismModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
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
