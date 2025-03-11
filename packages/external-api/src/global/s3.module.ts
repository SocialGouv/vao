import { S3Client } from "@aws-sdk/client-s3";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  exports: ["S3_CLIENT"],
  providers: [
    {
      inject: [ConfigService],
      provide: "S3_CLIENT",
      useFactory: (config: ConfigService) => {
        const accessKeyId = config.get<string>("s3.accesskey");
        const secretAccessKey = config.get<string>("s3.secretKey");
        const endpoint = config.get<string>("s3.endpoint");
        const region = config.get<string>("s3.region");

        if (!accessKeyId || !secretAccessKey || !endpoint || !region) {
          throw new Error("Missing S3 configuration values");
        }

        return new S3Client({
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
          endpoint,
          forcePathStyle: true,
          region,
        });
      },
    },
  ],
})
export class S3Module {}
