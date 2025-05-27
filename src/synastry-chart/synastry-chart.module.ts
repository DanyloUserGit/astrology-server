import { forwardRef, Module } from '@nestjs/common';
import { PromptModule } from 'src/prompts/prompt.module';
import { SynastryController } from './synastry-chart.controller';
import { SynastryService } from './synastry-chart.service';
import { ZodiacSignsModule } from 'src/zodiac_signs/zodiac_signs.module';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  imports: [PromptModule, ZodiacSignsModule, forwardRef(() => StripeModule),], 
  controllers: [SynastryController],
  providers: [SynastryService],
  exports: [SynastryService],
})
export class SynastryModule {}
