import { Body, Controller, Post } from '@nestjs/common';
import { SignDto } from './zodiac_signs.dto';
import { ZodiacSignsService } from './zodiac_signs.service';

@Controller('zodiac-signs')
export class ZodiacSignsController {
  constructor(private readonly zodiacSignsService: ZodiacSignsService) {}

    @Post('zodiac-data')
    async zodiacData(
        @Body() body: SignDto
    ){
        const res = await this.zodiacSignsService.getZodiacData(body);
        return res;
    }
}
