import { Module } from '@nestjs/common';
import { PromoService } from './promo.service';
import { PromoController } from './promo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Promo, PromoSchema } from './promo.schema';

@Module({
  imports: [
      MongooseModule.forFeature(
          [{ name: Promo.name, schema: PromoSchema }],
          'synastryConnection'
      )
  ],
  providers: [PromoService],
  exports: [PromoService],
  controllers: [PromoController]
})
export class PromoModule {}
