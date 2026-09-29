import "./lib/instrument";

import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";
import { patchNestJsSwagger } from "nestjs-zod";

import { AppModule } from "./app.module";

patchNestJsSwagger();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.use((_req, res, next) => {
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-XSS-Protection", "0");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    );
    next();
  });
  app.useLogger(app.get(Logger));
  const config = new DocumentBuilder()
    .setTitle("VAO Api")
    .setDescription("Api for VAO")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
