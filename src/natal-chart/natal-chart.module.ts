import { Module } from "@nestjs/common";
import { NatalService } from "./natal-chart.service";
import { NatalController } from "./natal-chart.controller";

@Module({
    providers: [NatalService],
    controllers: [NatalController],
    exports: [NatalService],
})
export class NatalModule {}