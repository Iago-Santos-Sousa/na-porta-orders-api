import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { User } from "./user/entities/user.entity";
import { Address } from "./address/entities/address.entity";
import { Order } from "./orders/entities/order.entity";
import { OrderItem } from "./orders/entities/order-item.entity";
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from "@nestjs/swagger";
import helmet from "helmet";
import { Reflector } from "@nestjs/core";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
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
    .addTag("Auth", "Autenticação e gerenciamento de sessão")
    .addTag("Users", "Gerenciamento de usuários")
    .addTag("Orders", "Gerenciamento de pedidos")
    .addTag("Addresses", "Gerenciamento de endereços")
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
    extraModels: [User, Address, Order, OrderItem],
  };

  const document = SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup("/api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: false,
    },
  });

  await app.listen(process.env.APP_PORT ?? 8080);
}
bootstrap()
  .then(() => console.log(`Server running on port: ${process.env.APP_PORT ?? 8080}`))
  .catch((err) => console.error(err));
