import { Body, Controller, Post } from "@nestjs/common";
import { PromptService } from "./prompt.service";
import * as path from "path";
import * as fs from "fs";

@Controller('prompt')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Post('page')
  async generatePage(
    @Body() body:{page:number}
  ) {
    const rawInfoPath = path.join(__dirname, "../../src/files/mocs/synastry.json");
    const data = JSON.parse(fs.readFileSync(rawInfoPath, 'utf-8'));
    return await this.promptService.generateSummary(data, 'en', body.page);
  }
}