import { Controller, Get } from '@nestjs/common';

@Controller('price')
export class PriceController {
  @Get("/")
  async getPrice() {
    const p = process.env.PDF_PRICE;
    return { price: p };
  }
}
