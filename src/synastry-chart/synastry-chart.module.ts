import { Module } from '@nestjs/common';
import { SynastryController } from './synastry-chart.controller';
import { SynastryService } from './synastry-chart.service';

@Module({
  imports: [], 
  controllers: [SynastryController],
  providers: [SynastryService],
  exports: [SynastryService],
})
export class SynastryModule {}
