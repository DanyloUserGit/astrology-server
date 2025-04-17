import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './stripe.service';


@Controller('stripe')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-intent')
  async createPaymentIntent() {
    return this.paymentService.createPaymentIntent();
  }
}
