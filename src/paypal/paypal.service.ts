// paypal.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Payment } from './paypal.dto';
import { SynastryDto } from 'src/synastry-chart/synastry-chart.dto';
import { SynastryService } from 'src/synastry-chart/synastry-chart.service';

@Injectable()
export class PaypalService {
  private readonly clientId = process.env.CLIENT_ID;
  private readonly clientSecret = process.env.CLIENT_SECRET;
  private readonly baseUrl = process.env.PAYPAL_BASE_URL; // або 'https://api-m.paypal.com' для продакшн

  constructor(private readonly httpService: HttpService, private readonly synastryService:SynastryService) {}

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );

    return response.data.access_token;
  }
  async createOrder(body: Payment) {
    const accessToken = await this.getAccessToken();
    const context = {brand_name:body.brand_name, cancel_url:body.cancel_url, return_url:body.return_url}

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: body.amount,
              },
            },
          ],
          application_context: {
            ...context,
            user_action: "PAY_NOW"
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data;
  }

  async captureOrder(orderId: string, body: SynastryDto) {
    const accessToken = await this.getAccessToken();

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );
    if(response.data.status==="COMPLETED"){
      return await this.synastryService.generatePdf(body)
    }else{
      return response.data;
    }
  }
}
