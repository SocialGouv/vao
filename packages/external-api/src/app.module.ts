import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { SentryGlobalFilter, SentryModule } from "@sentry/nestjs/setup";
import { IncomingMessage } from "http";
import { LoggerModule } from "nestjs-pino";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";
import { v4 as uuidv4 } from "uuid";

import { AccommodationModule } from "./accommodation/accommodation.module";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import configuration from "./config/configuration";
import { FileModule } from "./file/file.module";
import { DatabaseModule } from "./global/database.module";
import { S3Module } from "./global/s3.module";
import { OrganismModule } from "./organism/organism.module";
import { UserModule } from "./user/user.module";

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // TODO
    SentryModule.forRoot(),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const env = config.get<string>("nodeEnv") || "development";
        const logLevel =
          {
            production: "info",
            test: "warning",
          }[env] || "debug";
        return {
          pinoHttp: {
            genReqId: (request: IncomingMessage) =>
              request.headers["x-correlation-id"] || uuidv4(),
            level: logLevel,
            transport:
              env !== "production"
                ? {
                    options: {
                      colorize: true,
                    },
                    target: "pino-pretty",
                  }
                : undefined,
          },
        };
      },
    }),
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
