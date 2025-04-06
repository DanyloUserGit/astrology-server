import { HttpModule } from "@nestjs/axios";
import { Module } from '@nestjs/common';
import { SynastryModule } from "src/synastry-chart/synastry-chart.module";
import { PaypalController } from "./paypal.controller";
import { PaypalService } from "./paypal.service";

@Module({
    imports: [HttpModule, SynastryModule],
    providers: [PaypalService],
    controllers: [PaypalController],
    exports: [PaypalService],
})
export class PaypalModule {}