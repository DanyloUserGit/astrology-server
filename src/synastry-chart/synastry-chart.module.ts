import { Module } from '@nestjs/common';
import { SynastryController } from './synastry-chart.controller';
import { SynastryService } from './synastry-chart.service';
import { GoogleSheetsModule } from 'src/google-sheets-service/google-sheets.module';

@Module({
  imports: [GoogleSheetsModule], 
  controllers: [SynastryController],
  providers: [SynastryService],
})
export class SynastryModule {}
