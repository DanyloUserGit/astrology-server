import { Injectable } from '@nestjs/common';
import { SynastryDto } from 'src/synastry-chart/synastry-chart.dto';
import { SynastryService } from 'src/synastry-chart/synastry-chart.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private readonly synastryService:SynastryService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  async createPaymentIntent() {
    const pdfPrice = parseFloat(process.env.PDF_PRICE || '9.99');
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: pdfPrice * 100,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }
  async captureOrder(paymentIntentId: string, body: SynastryDto) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if(paymentIntent.status==="succeeded"){
      return await this.synastryService.generatePdf(body)
    }else{
      return {
        status: paymentIntent.status,
      };
    }
  }
  
}
