import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SynastryModule } from './synastry-chart/synastry-chart.module';
import { PaypalModule } from './paypal/paypal.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ZodiacSignsModule } from './zodiac_signs/zodiac_signs.module';
import { NatalModule } from './natal-chart/natal-chart.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${process.env.NODE_ENV}.env` }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get('MONGO_LINK');
        const appEnv = configService.get('APP_ENV');
        console.log(uri);
        
        return {
          uri,
          dbName: "zodiac_signs"
        };
      },
    }),
    SynastryModule,
    PaypalModule,
    ZodiacSignsModule,
    NatalModule,
    StripeModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
