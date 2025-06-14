import { error } from 'console';
import { StripeTokensService } from './stripe-tokens.service';
import { Injectable } from '@nestjs/common';
import { PromoService } from 'src/promo/promo.service';
import { SynastryDto } from 'src/synastry-chart/synastry-chart.dto';
import { SynastryService } from 'src/synastry-chart/synastry-chart.service';
import { v4 as uuid } from 'uuid';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private readonly synastryService:SynastryService,
    private readonly promoService:PromoService,
    private readonly stripeTokensService:StripeTokensService
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  async createPaymentIntent(body?:{promo:string}) {
    let realPrice: number = parseFloat(process.env.PDF_PRICE || '9.99');;
    if(body?.promo){
      const price = await this.promoService.validatePromo(body);
      if(!price) return new Error("Promo price was not found");
      
      realPrice = price?.priceAfterDiscount;
    }

    if (realPrice <= 0) {
      const token = await this.stripeTokensService.generateToken();
      return {
        token,
        clientSecret: null,
        isFree: true,
      };
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: realPrice * 100,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });
    if(realPrice){
      return {
        price:realPrice,
        clientSecret: paymentIntent.client_secret,
      };
    }else{
      return {
        clientSecret: paymentIntent.client_secret,
      };
    }
  }
  async captureOrder(body: SynastryDto, paymentIntentId?: string | null, ) {
    const fileToken = uuid();
    if(!paymentIntentId){
      if(!body.token) return new Error("Token was not presented");
      const status = await this.stripeTokensService.verifyAndConsumeToken(body.token);
      if(status){
        this.synastryService.generatePdf(body, fileToken).catch((error)=>{
          console.log(error)
        })
        return { success: true, message: "Generation started successfully", fileToken };
      }else{
        return {
          status,
          message: "Invalid token"
        };
      }
    }
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if(paymentIntent.status==="succeeded"){
      this.synastryService.generatePdf(body, fileToken).catch((error)=>{
        console.log(error);
      })
      return { success: true, message: "Generation started successfully", fileToken};
    }else{
      return {
        status: paymentIntent.status,
      };
    }
  }
  
}
