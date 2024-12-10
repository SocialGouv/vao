import { Global, Module } from "@nestjs/common";
import { Pool } from "pg";

import { postgres } from "./config";

@Global()
@Module({
  exports: ["PG_CONNECTION"],
  providers: [
    {
      provide: "PG_CONNECTION",
      useFactory: async () => {
        const pool = new Pool({
          database: postgres.database,
          host: postgres.host,
          idleTimeoutMillis: 30000,
          max: 15,
          password: postgres.password,
          port: parseInt(postgres.port, 10),
          user: postgres.user,
        });
        return pool;
      },
    },
  ],
})
export class DatabaseModule {}
