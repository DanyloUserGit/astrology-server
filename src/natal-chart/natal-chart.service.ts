import { Injectable } from "@nestjs/common";
import axios from "axios";
import { Partner } from "src/synastry-chart/synastry-chart.dto";
import { UIGenerator } from "src/utils/ui";
import { UIGeneratorService } from "src/utils/ui/ui-generator";

@Injectable()
export class NatalService {
    uiGenerator: UIGenerator;
    constructor() {
        this.uiGenerator = new UIGeneratorService();
    }

    subjectObj(body: Partner) {
        const date = new Date(body.birthDate);
        return {
            ...body,
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
            hour: date.getUTCHours(),
            minute: date.getUTCMinutes(),
        };
    }
    async getChart(body: Partner){
        try {
            const subject = {
                ...this.subjectObj(body),
                zodiac_type: "Tropic",
                sidereal_mode: null,
                perspective_type: "Apparent Geocentric",
                houses_system_identifier: "P",
            };
            const reqNatal = {subject:subject, theme: "classic", language: "EN", wheel_only: false};
            const resNatal = await axios.post(`${process.env.BASEAPIURL}birth-chart`, reqNatal, {
                headers: {
                    "x-rapidapi-key": process.env.XRapidAPIKey,
                    "x-rapidapi-host": "astrologer.p.rapidapi.com",
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            console.log("API Response received.");

            if (!resNatal.data) {
                throw new Error("API response is missing chart data");
            }
            const chart = this.uiGenerator.createSvgNatal(resNatal.data);

            if(!chart){
                throw new Error("Chart could not be generated");
            }

            return {chart};
        } catch (error) {
            console.log(error);
        }
    }
}