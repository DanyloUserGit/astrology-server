import { Module } from '@nestjs/common';
import { PromptModule } from 'src/prompts/prompt.module';
import { SynastryController } from './synastry-chart.controller';
import { SynastryService } from './synastry-chart.service';
import { ZodiacSignsModule } from 'src/zodiac_signs/zodiac_signs.module';

@Module({
  imports: [PromptModule, ZodiacSignsModule], 
  controllers: [SynastryController],
  providers: [SynastryService],
  exports: [SynastryService],
})
export class SynastryModule {}
