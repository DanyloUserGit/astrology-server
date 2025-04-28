import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promo } from './promo.schema';
import { ValidatePromoDto } from './promo.dto';

@Injectable()
export class PromoService {
    constructor (@InjectModel(Promo.name, 'synastryConnection') private promoModel: Model<Promo>) {}

    async validatePromo(dto: ValidatePromoDto){
        try {
            const promo = await this.promoModel.findOne({promo:dto.promo});
            if(!promo) throw new Error("Promo was not found");
            const discountNumber = (promo.discount / 100) * parseFloat(process.env.PDF_PRICE || '9.99');
            const priceAfterDiscount = parseFloat(process.env.PDF_PRICE || '9.99') - discountNumber;

            return {
                discount: promo.discount,
                title:promo.title,
                promo: promo.promo,
                discountNumber,
                priceAfterDiscount,
            }
        } catch (error) {
            console.log(error);
        }
    }
}
