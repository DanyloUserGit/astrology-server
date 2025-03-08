import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SynastryModule } from './synastry-chart/synastry-chart.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${process.env.NODE_ENV}.env` }),
    SynastryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
