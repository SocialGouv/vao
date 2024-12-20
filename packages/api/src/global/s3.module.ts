import { S3Client } from "@aws-sdk/client-s3";
import { Global, Module } from "@nestjs/common";

import { s3 } from "../config";

@Global()
@Module({
  exports: ["S3_CLIENT"],
  providers: [
    {
      provide: "S3_CLIENT",
      useFactory: () => {
        const s3Client = new S3Client({
          credentials: {
            accessKeyId: s3.accesskey,
            secretAccessKey: s3.secretKey,
          },
          endpoint: s3.endpoint,
          forcePathStyle: true,
          region: s3.region,
        });

        return s3Client;
      },
    },
  ],
})
export class S3Module {}
