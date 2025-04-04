import { Injectable } from "@nestjs/common";
import axios from "axios";
import * as nodemailer from "nodemailer";
import { SVG } from '@svgdotjs/svg.js';
import { JSDOM } from 'jsdom';
import puppeteer from "puppeteer";
import { GoogleSheetsService } from "src/google-sheets-service/google-sheets.service";
import { Partner, SynastryDto } from "./synastry-chart.dto";
import { NatalChart } from "src/types";
import { UIGenerator } from "src/utils/ui";
import { UIGeneratorService } from "src/utils/ui/ui-generator";

@Injectable()
export class SynastryService {
    uiGenerator: UIGenerator;
    constructor(private readonly googleSheetsService: GoogleSheetsService) {
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
    
    async generatePdf(body: SynastryDto) {
        try {
            console.log("Generating PDF for:", body);

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

            const pdf = await this.uiGenerator.createPdfFile({
                name1: first_subject.name,
                name2: second_subject.name,
                birthDate1: first_subject.birthDate,
                birthDate2: second_subject.birthDate,
                birthPlace1: `${first_subject.nation}, ${first_subject.city}`,
                birthPlace2: `${second_subject.nation}, ${second_subject.city}`,
                natal1: resNatalFirst.data,
                natal2: resNatalSecond.data,
                synastry: resSynastry.data
            });

            console.log("Sending email...");
            // await this.googleSheetsService.appendRow(body.email);
            const status = await this.sendMail(body.email, pdf);
            console.log("Email sent successfully.");

            return status?.message;
        } catch (error) {
            console.error("Error in generatePdf():", error);
            throw new Error("Failed to generate and send PDF");
        }
    }

    async sendMail(email: string, pdf: Buffer) {
        try {
            console.log("Sending email to:", email);
            const transporter = nodemailer.createTransport({
                host: "mail.adm.tools",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                {
                    from: process.env.EMAIL_USER_NAME,
                }
                logger: true, // Додати логування для відправки
                debug: true,  // Вивести додаткові відомості для діагностики
            });

            const mailOptions = {
                to: email,
                subject: "Your Synastry Chart PDF",
                text: "Please find the attached PDF.",
                attachments: [
                    {
                        filename: "synastry.pdf",
                        content: pdf,
                        contentType: "application/pdf",
                    },
                ],
            };

            const info = await transporter.sendMail(mailOptions);
            console.log("Email sent successfully:", info.response);
            return { message: "Email sent successfully" };
        } catch (error) {
            console.error("Email sending failed:", error);
            throw new Error("Failed to send email");
        }
    }
}
