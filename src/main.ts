import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from "dotenv";
import { OpenAIService } from './utils/openai/openai';
import * as path from "path";
import * as fs from "fs";
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "*"
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true,
      transform: true, 
    }),
  );

  app.setGlobalPrefix('api');

  const PORT = process.env.PORT || 8000;
  await app.listen(PORT);
  console.log(`🚀 Server running on http://localhost:${PORT}/api`);
//   const rawInfoPath = path.join(__dirname, "../src/files/mocs/synastry.json");
// const data = JSON.parse(fs.readFileSync(rawInfoPath, 'utf-8'));
// const generator = new OpenAIService();
// const prompt = await generator.generateSummary(data, 'en', generator.buildPromptP8);
// console.log(prompt)
}
bootstrap();
