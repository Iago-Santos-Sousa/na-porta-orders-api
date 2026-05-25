import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from "@nestjs/swagger";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    // origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    origin: "*",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    exposedHeaders: ["Content-Disposition"],
  });

  app.setGlobalPrefix("/api");

  const config = new DocumentBuilder()
    .setTitle("Na porta - API de pedidos")
    .setDescription("API para gerenciamento de pedidos.")
    .setVersion("1.0")
    .addTag("auth", "Autenticação e gerenciamento de sessão")
    .addTag("users", "Gerenciamento de usuários")
    .addTag("orders", "Gerenciamento de pedidos")
    .addTag("addresses", "Gerenciamento de endereços")
    .addBearerAuth({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      in: "header",
      name: "Authorization",
      description: "Informe o access_token retornado pelo endpoint /auth/login",
    })
    .addSecurityRequirements("bearer")
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
    extraModels: [],
  };

  const document = SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.APP_PORT ?? 3001);
}
bootstrap()
  .then(() => console.log(`Server running on port: ${process.env.APP_PORT ?? 3001}`))
  .catch((err) => console.error(err));
