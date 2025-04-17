import { Controller, Post, Body, Param } from '@nestjs/common';
import { PaymentService } from './stripe.service';
import { SynastryDto } from 'src/synastry-chart/synastry-chart.dto';


@Controller('stripe')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-intent')
  async createPaymentIntent() {
    return this.paymentService.createPaymentIntent();
  }
  @Post('capture-order/:id')
  async captureOrder(
    @Param('id') id: string,
    @Body() body: SynastryDto,
  ) {
    return this.paymentService.captureOrder(id, body);
  }
}
