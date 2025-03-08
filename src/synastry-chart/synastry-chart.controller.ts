import { Body, Controller, Post } from "@nestjs/common";
import { SynastryService } from "./synastry-chart.service";
import { SynastryDto } from "./synastry-chart.dto";

@Controller('synastry')
export class SynastryController{
    constructor(private readonly synastryService:SynastryService){}

    @Post('generate-pdf')
    async generatePdf(@Body() body:SynastryDto) {
        console.log(body)
        return await this.synastryService.generatePdf(body)
    }   
}