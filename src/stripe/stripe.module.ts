import { Module } from '@nestjs/common';
import { PaymentService } from './stripe.service';
import { PaymentController } from './stripe.controller';
import { SynastryModule } from 'src/synastry-chart/synastry-chart.module';
import { PromoModule } from 'src/promo/promo.module';
import { StripeTokensService } from './stripe-tokens.service';

@Module({
  imports: [SynastryModule, PromoModule],
  providers: [PaymentService, StripeTokensService],
  controllers:[PaymentController],
  exports: [PaymentService, StripeTokensService],
})
export class StripeModule {}
