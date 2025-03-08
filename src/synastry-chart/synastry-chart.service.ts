import { Injectable } from "@nestjs/common";
import axios from "axios";
import puppeteer from "puppeteer";
import * as nodemailer from "nodemailer";
import * as PDFDocument from "pdfkit";
import { Partner, SynastryDto } from "./synastry-chart.dto";

@Injectable()
export class SynastryService {
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
    
    async svgToPng(svg: string, scale: number = 1): Promise<Buffer> {
        console.log("Launching Puppeteer...");
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
    
        console.log("Setting SVG content...");
        await page.setContent(`
            <html>
            <body style="margin:0;">
                <div id="svg-container">${svg}</div>
                <script>
                    const svgElement = document.getElementById('svg-container').children[0];
                    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                    document.body.appendChild(svgElement);
                </script>
            </body>
            </html>
        `);
    
        // Wait for the SVG to be available in the DOM
        await page.waitForSelector("svg");
    
        console.log("Extracting SVG element...");
        const svgElement = await page.$("svg");
        if (!svgElement) throw new Error("SVG element not found");
    
        const boundingBox = await svgElement.boundingBox();
        if (!boundingBox) throw new Error("Failed to get SVG bounding box");
    
        console.log("Taking a screenshot...");
        const pngUint8Array = await svgElement.screenshot({
            type: "png",
            clip: {
                x: boundingBox.x,
                y: boundingBox.y,
                width: boundingBox.width * scale,  // Scale the width
                height: boundingBox.height * scale,  // Scale the height
            },
        });
    
        console.log("Closing Puppeteer...");
        await browser.close();
    
        // ✅ Convert Uint8Array to Buffer
        return Buffer.from(pngUint8Array);
    }
    
    async createPdf(pngBuffer: Buffer): Promise<Buffer> {
        try {
            const doc = new PDFDocument({ autoFirstPage: true });
            const pdfChunks: Buffer[] = [];
        
            return new Promise((resolve, reject) => {
                doc.on("data", (chunk) => pdfChunks.push(chunk));
                doc.on("end", () => resolve(Buffer.concat(pdfChunks)));
                doc.on("error", reject);
        
                // Scale the image when placing it in the PDF (e.g., scale to 800px wide)
                const width = 600;  // New width
                const height = (width / 400) * 200;  // Maintain aspect ratio (based on original size)
    
                doc.image(pngBuffer, { x: 10, y: 15, width, height }); // Explicit position and scaled size
                doc.end();
            });
        } catch (error) {
            console.error("PDF generation failed:", error);
            throw new Error("Failed to generate PDF");
        }
    }
    

    async sendMail(email: string, pdf: Buffer) {
        try {
            console.log("Sending email to:", email);
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER_NAME,
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

    async generatePdf(body: SynastryDto) {
        try {
            console.log("Generating PDF for:", body);

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

            const res = await axios.post(`${process.env.BASEAPIURL}synastry-chart`, reqBody, {
                headers: {
                    "x-rapidapi-key": process.env.XRapidAPIKey,
                    "x-rapidapi-host": "astrologer.p.rapidapi.com",
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            console.log("API Response received.");

            if (!res.data || !res.data.chart) {
                throw new Error("API response is missing chart data");
            }

            console.log("Converting SVG to PNG...");
            const pngBuffer = await this.svgToPng(res.data.chart);
            console.log("PNG conversion successful.");

            console.log("Generating PDF...");
            const pdfBuffer = await this.createPdf(pngBuffer);
            console.log("PDF created successfully.");

            console.log("Sending email...");
            const status = await this.sendMail(body.email, pdfBuffer);
            console.log("Email sent successfully.");

            return status?.message;
        } catch (error) {
            console.error("Error in generatePdf():", error);
            throw new Error("Failed to generate and send PDF");
        }
    }
}
