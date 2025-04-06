import { Controller, Post, Body, Get } from '@nestjs/common';
import { ZodiacSignsService } from './zodiac_signs.service';
import { SignDto } from './zodiac_signs.dto';

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
