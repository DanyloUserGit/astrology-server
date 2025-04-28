import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NatalModule } from './natal-chart/natal-chart.module';
import { PaypalModule } from './paypal/paypal.module';
import { PromoModule } from './promo/promo.module';
import { PromptModule } from './prompts/prompt.module';
import { StripeModule } from './stripe/stripe.module';
import { SynastryModule } from './synastry-chart/synastry-chart.module';
import { ZodiacSignsModule } from './zodiac_signs/zodiac_signs.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${process.env.NODE_ENV}.env` }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get('MONGO_LINK');
        return {
          uri,
          dbName: "zodiac_signs"
        };
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      connectionName: 'synastryConnection',
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get('MONGO_LINK');
        return {
          uri,
          dbName: "synastry"
        };
      },
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 30 * 1000
    }),
    SynastryModule,
    PaypalModule,
    ZodiacSignsModule,
    NatalModule,
    StripeModule,
    PromptModule,
    PromoModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
