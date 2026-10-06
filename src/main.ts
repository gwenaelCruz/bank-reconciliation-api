import { NestFactory } from '@nestjs/core';
import { AppModule } from '#app/app.module.js';
import {ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const documentConfig = new DocumentBuilder()
    .setTitle('Movements API')
    .setVersion('1.0')
    .addTag('movements')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('doc', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
