import { Module } from '@nestjs/common';
import { ZodiacSignsService } from './zodiac_signs.service';
import { ZodiacSignsController } from './zodiac_signs.controller';
import { Zodiac, ZodiacSchema } from './zodiac_signs.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Zodiac.name, schema: ZodiacSchema },
        ])
    ],
    providers: [ZodiacSignsService],
    controllers: [ZodiacSignsController],
    exports: [ZodiacSignsService],
})
export class ZodiacSignsModule {}