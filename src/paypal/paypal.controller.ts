import { Controller, Post, Body, Param } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { Payment } from './paypal.dto';
import { SynastryDto } from 'src/synastry-chart/synastry-chart.dto';

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Post('create-order')
  async createOrder(@Body() body: Payment) {
    return this.paypalService.createOrder(body);
  }

  @Post('capture-order/:id')
  async captureOrder(
    @Param('id') id: string,
    @Body() body: SynastryDto,
  ) {
    return this.paypalService.captureOrder(id, body);
  }
}

