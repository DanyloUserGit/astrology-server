import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
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
    @Get('get-generated-file/:token')
    async getGeneratedFile(
        @Param('token') token: string
    ) {
        return await this.synastryService.getFile(token);
    }
}