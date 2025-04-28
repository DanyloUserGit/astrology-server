import { ValidatePromoDto } from './promo.dto';
import { PromoService } from './promo.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('promo')
export class PromoController {
    constructor (private readonly promoService:PromoService) {}

    @Post("validate-promo")
    async validatePromo(@Body() dto:ValidatePromoDto){
        return await this.promoService.validatePromo(dto);
    }
}
