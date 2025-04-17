import { Module } from '@nestjs/common';
import { PaymentService } from './stripe.service';
import { PaymentController } from './stripe.controller';
import { SynastryModule } from 'src/synastry-chart/synastry-chart.module';

@Module({
  imports: [SynastryModule],
  providers: [PaymentService],
  controllers:[PaymentController],
  exports: [PaymentService],
})
export class StripeModule {}
