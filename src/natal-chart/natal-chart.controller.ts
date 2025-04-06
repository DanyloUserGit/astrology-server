import { Body, Controller, Post } from '@nestjs/common';
import { Partner } from 'src/synastry-chart/synastry-chart.dto';
import { NatalService } from './natal-chart.service';

@Controller('natal')
export class NatalController {
  constructor(private readonly natalService: NatalService) {}

    @Post('chart')
    async chart(
        @Body() body: Partner
    ){
        const res = await this.natalService.getChart(body);
        return res;
    }
}
