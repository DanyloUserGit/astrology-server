import { Module } from "@nestjs/common";
import { PromptService } from "./prompt.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Prompt, PromptSchema } from "./prompt.schema";
import { PromptController } from "./prompt.controller";
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Prompt.name, schema: PromptSchema },
        ])
    ],
    providers: [PromptService],
    exports: [PromptService],
    controllers: [PromptController]
})
export class PromptModule {}