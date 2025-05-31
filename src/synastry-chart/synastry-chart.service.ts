import { Injectable } from "@nestjs/common";
import axios from "axios";
import * as nodemailer from "nodemailer";
import { UIGenerator } from "src/utils/ui";
import { UIGeneratorService } from "src/utils/ui/ui-generator";
import { Partner, SynastryDto } from "./synastry-chart.dto";
import { PromptService } from "src/prompts/prompt.service";
import { ProcessTimer } from "src/utils/process-timer";
import { ProcessTimerImpl } from "src/utils/process-timer/impl";
import { ZodiacSignsService } from "src/zodiac_signs/zodiac_signs.service";
import { StripeTokensService } from "src/stripe/stripe-tokens.service";

@Injectable()
export class SynastryService {
    uiGenerator: UIGenerator;
    processTimer: ProcessTimer;
    constructor(
        private readonly promptService:PromptService,
        private readonly zodiacSignsService:ZodiacSignsService,
        private readonly stripeTokensService:StripeTokensService
    ) {
        this.uiGenerator = new UIGeneratorService();
        this.processTimer = new ProcessTimerImpl();
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
    
    async generatePdf(body: SynastryDto,fileToken?:string | null, tries=0) {
        try {
            console.log("Generating PDF for:", body);
            this.processTimer.start();
            // Prepare API request payload
            const first_subject = {
                ...this.subjectObj(body.first_subject),
                zodiac_type: "Tropic",
                sidereal_mode: null,
                perspective_type: "Apparent Geocentric",
                houses_system_identifier: "P",
            };

            const second_subject = {
                ...this.subjectObj(body.second_subject),
                zodiac_type: "Tropic",
                sidereal_mode: null,
                perspective_type: "Apparent Geocentric",
                houses_system_identifier: "P",
            };

            const reqBody = { first_subject, second_subject, theme: "classic", language: "EN", wheel_only: false };

            console.log("Sending API request to:", `${process.env.BASEAPIURL}synastry-chart`);
            console.log("Request Body:", JSON.stringify(reqBody, null, 2));

            const resSynastry = await axios.post(`${process.env.BASEAPIURL}synastry-chart`, reqBody, {
                headers: {
                    "x-rapidapi-key": process.env.XRapidAPIKey,
                    "x-rapidapi-host": "astrologer.p.rapidapi.com",
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            console.log("API Response received.");

            if (!resSynastry.data) {
                throw new Error("API response is missing chart data");
            }

            const reqNatalFirst = {subject:reqBody.first_subject, language:reqBody.language, theme:reqBody.theme, wheel_only:reqBody.wheel_only};

            const resNatalFirst = await axios.post(`${process.env.BASEAPIURL}birth-chart`, reqNatalFirst, {
                headers: {
                    "x-rapidapi-key": process.env.XRapidAPIKey,
                    "x-rapidapi-host": "astrologer.p.rapidapi.com",
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            console.log("API Response received.");

            if (!resNatalFirst.data) {
                throw new Error("API response is missing chart data");
            }

            const reqNatalSecond = {subject:reqBody.second_subject, language:reqBody.language, theme:reqBody.theme, wheel_only:reqBody.wheel_only};

            const resNatalSecond = await axios.post(`${process.env.BASEAPIURL}birth-chart`, reqNatalSecond, {
                headers: {
                    "x-rapidapi-key": process.env.XRapidAPIKey,
                    "x-rapidapi-host": "astrologer.p.rapidapi.com",
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            console.log("API Response received.");

            if (!resNatalSecond.data) {
                throw new Error("API response is missing chart data");
            }
            let pages: any = [];
            for(let i = 8; i<12; i++){
                const page = await this.promptService.generateSummary(resSynastry.data, body.lang, i);
                if(page) pages.push(page);
            }
            const match = await this.promptService.generateSummary(resSynastry.data, body.lang, 1);
            const zodiac_signs = await this.zodiacSignsService.getFile();
            if(!zodiac_signs) throw new Error("Couldn't download file zodiac_signs.json from DB");
            const pdf = await this.uiGenerator.createPdfFile({
                name1: first_subject.name,
                name2: second_subject.name,
                birthDate1: first_subject.birthDate,
                birthDate2: second_subject.birthDate,
                birthPlace1: `${first_subject.nation}, ${first_subject.city}`,
                birthPlace2: `${second_subject.nation}, ${second_subject.city}`,
                natal1: resNatalFirst.data,
                natal2: resNatalSecond.data,
                synastry: resSynastry.data,
                pages,
                zodiac_signs,
                lang:body.lang,
                match
            });
            if(!pdf) return new Error("Error in generating after 2 tries");
            console.log("Sending email...");
            const status = await this.sendMail(body.email, pdf, {name1:body.first_subject.name, name2:body.second_subject.name});

            if(fileToken) await this.stripeTokensService.createTokenFile(fileToken, status);

            return {...status, fileName:`Synastry Chart for ${first_subject.name} and ${second_subject.name}`};
        } catch (error) {
            console.error("Error in generatePdf(), retrying", error);
            if(tries<=3){
                tries++;
                this.generatePdf(body, fileToken || null, tries);
            }else{
                throw new Error("Generation failed after 3 tries");
            }
        }
    }

    async getFile(token:string){
        try {
            const data = await this.stripeTokensService.verifyAndGetFile(token);
            if(!data) return {success: false, message:"The file is still being generated."};

            return data;
        } catch (error) {
            console.log(error);
        }
    }

    async sendMail(email: string, pdf: Buffer, names:{name1:string, name2:string}) {
        try {
            console.log("Sending email to:", email);
            const transporter = nodemailer.createTransport({
                host: "mail.adm.tools",
                port: 2525,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                // logger: true,
                // debug: true,  
            });

            const mailOptions = {
                from: `"${process.env.EMAIL_USER_NAME}" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Your Compatibility Report Is Ready 💫",
                html: `
                  <p>Thank you for your order. Your synastry report for ${names.name1} and ${names.name2} is attached to this email as a PDF.</p>
                  <p><i>→ Click to download. It’s yours to keep forever.</i></p>
                `,
                attachments: [
                  {
                    filename: `Synastry Chart for ${names.name1} and ${names.name2}.pdf`,
                    content: pdf,
                    contentType: "application/pdf",
                  },
                ]
              };
              
            const info = await transporter.sendMail(mailOptions);
            this.processTimer.end();

            const base64Pdf = pdf.toString("base64");
            return { success: true, message: "Email sent successfully", pdf:`data:application/pdf;base64,${base64Pdf}` };
        } catch (error) {
            console.error("Email sending failed:", error);
            throw new Error("Failed to send email");
        }
    }
}
