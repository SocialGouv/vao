import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";

@Global()
@Module({
  exports: ["PG_CONNECTION", "PG_CONNECTION_DOC"],
  providers: [
    {
      inject: [ConfigService],
      provide: "PG_CONNECTION",
      useFactory: async (config: ConfigService) => {
        const database = config.get<string>("postgres.database");
        const host = config.get<string>("postgres.host");
        const password = config.get<string>("postgres.password");
        const port = parseInt(
          config.get<string>("postgres.port") || "5432",
          10,
        );
        const user = config.get<string>("postgres.user");

        // Validation des valeurs critiques
        if (!database || !host || !password || !user) {
          throw new Error(
            "Missing PostgreSQL configuration for main connection",
          );
        }

        return new Pool({
          database,
          host,
          idleTimeoutMillis: 30000,
          max: 15,
          password,
          port,
          user,
        });
      },
    },
    {
      inject: [ConfigService],
      provide: "PG_CONNECTION_DOC",
      useFactory: async (config: ConfigService) => {
        const database = config.get<string>("postgres.database");
        const host = config.get<string>("postgres.host");
        const password = config.get<string>("postgres.document.password");
        const port = parseInt(
          config.get<string>("postgres.port") || "5432",
          10,
        );
        const user = config.get<string>("postgres.document.user");

        // Validation des valeurs critiques
        if (!database || !host || !password || !user) {
          throw new Error(
            "Missing PostgreSQL configuration for document connection",
          );
        }

        return new Pool({
          database,
          host,
          idleTimeoutMillis: 30000,
          max: 15,
          password,
          port,
          user,
        });
      },
    },
  ],
})
export class DatabaseModule {}
