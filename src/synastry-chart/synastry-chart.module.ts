import { Module } from '@nestjs/common';
import { PromptModule } from 'src/prompts/prompt.module';
import { SynastryController } from './synastry-chart.controller';
import { SynastryService } from './synastry-chart.service';

@Module({
  imports: [PromptModule], 
  controllers: [SynastryController],
  providers: [SynastryService],
  exports: [SynastryService],
})
export class SynastryModule {}
