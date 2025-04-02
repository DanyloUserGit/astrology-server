import { CelestialBody, NatalChart } from "src/types";
import { PDFInfo, planetNames, planetsDescription, UIGenerator } from ".";
import puppeteer from "puppeteer";
import * as path from "path";
import * as fs from "fs";
import { DateTimeFormatter, ZonedDateTime, ZoneId } from "@js-joda/core";
import { Locale } from "@js-joda/locale_en";

export class UIGeneratorService implements UIGenerator{
    constructor () {}
    loadPlanetSvgByName(dir:string){
        const directoryPath = path.resolve(__dirname, `../../../src/files/planets/${dir}.svg`);
        return fs.readFileSync(directoryPath, 'utf-8')
    }
    loadSignSvgByName(dir:string){
        const directoryPath = path.resolve(__dirname, `../../../src/files/signs_big/${dir}.svg`);
        return fs.readFileSync(directoryPath, 'utf-8')
    }
    loadSvg(dir:string){
        const directoryPath = path.resolve(__dirname, `../../../src/files/${dir}`);

        const svgFiles = fs.readdirSync(directoryPath)
            .filter(file => file.endsWith('.svg')); 
    
        const svgArray = svgFiles.map(fileName => {
            const filePath = path.join(directoryPath, fileName);
            return fs.readFileSync(filePath, 'utf-8');
        });
    
        return svgArray;
    }
    getPlanets(data: NatalChart) {
        const formatDegrees = (degrees: number): string => {
            return `${Math.floor(degrees)}°`;
        };
    
        const planets = Object.entries(data.data)
            .filter(([key, obj]: [string, any]) => obj && obj.point_type === "Planet") // Перевіряємо, що obj не null
            .map(([key, obj]) => obj);
        let list = "";
        
        planets
        .filter(planet => fs.existsSync(path.join(__dirname, '../../../src/files/planets', `${planet.name.toLowerCase()}.svg`)))
        .map((planet: any) => {
            const icon = this.loadPlanetSvgByName(planet.name.toLowerCase());
            list += `<li><div class="planet-icon">${icon}</div> ${planet.name} in <span style="color:#CB8020;">${formatDegrees(planet.position)} ${planet.sign}</span></li>`;
        });
        console.log("path: ", path.join(__dirname, '../../../src/files/planets'));
        return `<ul class="planet-list">${list}</ul>`;
    }
    
    createSvg(rawData: NatalChart) {
        try {
            const natalData = rawData.data;
            const aspects = rawData.aspects;
            const width = 650;
            const height = 650;
            const radius = 300;
            const center = { x: width / 2, y: height / 2 };
    
            let svgString = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
            // Фон
            svgString += `<circle cx="${center.x}" cy="${center.y}" r="${radius}" fill="#CB8020" stroke="none" stroke-width="3"/>`;
            
        // Радіус центрального кола
        const centralRadius = 52;

        // Лінії поділу на 12 частин
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * (Math.PI / 180);
            
            // Обчислення кінцевих точок для лінії (між центром і центральним колом)
            const x1 = Math.cos(angle) * (radius-25) + center.x;
            const y1 = Math.sin(angle) * (radius-25) + center.y;

            // Обчислення координат для кінця лінії на зовнішньому радіусі
            const x2 = Math.cos(angle) * radius + center.x;
            const y2 = Math.sin(angle) * radius + center.y;

            // Додаємо лінію від центра до краю центрального кола
            svgString += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FAE4C8" stroke-width="2"/>`;
        }


        // Малюємо центральне коло
        svgString += `<circle cx="${center.x}" cy="${center.y}" r="${radius-25}" fill="#FFFFFF" stroke="none" stroke-width="2"/>`;
        svgString += `<circle cx="${center.x}" cy="${center.y}" r="${radius-50}" fill="#FFF7ED" stroke="#E4B77C" stroke-width="1"/>`;
        svgString += `<circle cx="${center.x}" cy="${center.y}" r="${centralRadius}" fill="#FFFFFF" stroke="none" stroke-width="2"/>`;
        // Лінії поділу на 12 частин (Довгі)
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * (Math.PI / 180);
            
            // Обчислення кінцевих точок для лінії (між центром і центральним колом)
            const x1 = Math.cos(angle) * centralRadius + center.x;
            const y1 = Math.sin(angle) * centralRadius + center.y;

            // Обчислення координат для кінця лінії на зовнішньому радіусі
            const x2 = Math.cos(angle) * (radius-25) + center.x;
            const y2 = Math.sin(angle) * (radius-25) + center.y;

            // Додаємо лінію від центра до краю центрального кола
            svgString += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#E4B77C" stroke-width="1"/>`;
        }
            // Знаки зодіаку та їхні сузір'я
            const zodiacSigns = [
                { name: "Virgo", emoji: "♈" }, { name: "Leo", emoji: "♉" },
                { name: "Cancer", emoji: "♊" }, { name: "Gemini", emoji: "♋" },
                { name: "Taurus", emoji: "♌" }, { name: "Aries", emoji: "♍" },
                { name: "Pisces", emoji: "♎" }, { name: "Aquarius", emoji: "♏" },
                { name: "Capricorn", emoji: "♐" }, { name: "Sagittarius", emoji: "♑" },
                { name: "Scorpio", emoji: "♒" }, { name: "Libra", emoji: "♓" }
            ];

            const textRadius = radius-20; 

            zodiacSigns.forEach((sign, i) => {
                const sectorAngle = 30; 
                const baseAngle = i * sectorAngle; 
                const centerAngle = baseAngle + sectorAngle / 2; 
                
                const angleRad = ((centerAngle - 90) * Math.PI) / 180; // Переведення в радіани
                const textX = Math.cos(angleRad) * textRadius + center.x;
                const textY = Math.sin(angleRad) * textRadius + center.y;
                
                const rotation = centerAngle; // Поворот тексту у межах секції
            
                svgString += `
                    <text x="${textX}" y="${textY}" font-size="20" fill="#FFF9F1" text-anchor="middle"
                          transform="rotate(${rotation}, ${textX}, ${textY})">
                        ${sign.name}
                    </text>
                `;
            });
            const innerRadius = radius - 70;
        const outerRadius = radius - 25;
        const exceptions = ["Mean_Node"];
        const normal = ["north_node"];
        const exceptionsMap: Record<string, string> = Object.fromEntries(
            exceptions.map((exception, index) => [exception.toLowerCase(), normal[index]])
          );
        let planetPositions = {};
        Object.values(natalData.first_subject || {}).forEach((planet: CelestialBody) => {
            if (planet && typeof planet === "object" && planet.abs_pos !== undefined && fs.existsSync(path.join(__dirname, '../../../src/files/planets', `${planet.name.toLowerCase()}.svg`))) {
                const angleRad = ((planet.abs_pos - 90) * Math.PI) / 180;
                const x = Math.cos(angleRad) * innerRadius + center.x;
                const y = Math.sin(angleRad) * innerRadius + center.y;
                
                const planetName = planet.name ? planet.name.toLowerCase() : "unknown";
                const planetSvg = this.loadPlanetSvgByName(planetName) || "";
                
                svgString += `<g transform="translate(${x}, ${y})">${planetSvg}</g>`;
                planetPositions[planet.name] = { x, y };
            }else if(planet && typeof planet === "object" && planet.abs_pos !== undefined && exceptions.includes(planet.name)){
                const angleRad = ((planet.abs_pos - 90) * Math.PI) / 180;
                const x = Math.cos(angleRad) * innerRadius + center.x;
                const y = Math.sin(angleRad) * innerRadius + center.y;
                
                const planetName = planet.name ? planet.name.toLowerCase() : "unknown";
                const planetSvg = this.loadPlanetSvgByName(exceptionsMap[planetName]) || "";
                
                const resizedPlanetSvg = planetSvg.replace(
                    /<svg([^>]*)>/,
                    `<svg$1 width="8" height="8">`
                  );
                svgString += `<g transform="translate(${x}, ${y})">${resizedPlanetSvg}</g>`;
                planetPositions[planet.name] = { x, y };
            }
        });

        if (!aspects || !Array.isArray(aspects)) {
            console.error("Error: Aspects data is missing or invalid");
        } else {
            aspects.forEach(({ p1_name, p2_name, aspect }) => {
                if (planetPositions[p1_name] && planetPositions[p2_name]) {
                    const { x: x1, y: y1 } = planetPositions[p1_name];
                    const { x: x2, y: y2 } = planetPositions[p2_name];
                    let x1f, x2f, y1f, y2f;
                    if(y1 > 0 || y2 > 0){
                        y1f = y1+15;
                        y2f = y2+15;
                    }else{
                        y1f = y1-15;
                        y2f = y2-15;
                    }
                    if(x1 > 0 || x2 > 0){
                        x1f = x1+15;
                        x2f = x2+15;
                    }else{
                        x1f = x1-15;
                        x2f = x2-15;
                    }
                    let color;
                    switch (aspect) {
                        case "trine": color = "#7CE483"; break;
                        case "square": color = "#EF3C25"; break;
                        case "opposition": color = "#E4B77C"; break;
                        default: color = "#E4B77C";
                    }
                    
                    svgString += `<line x1="${x1f}" y1="${y1f}" x2="${x2f}" y2="${y2f}" stroke="${color}" stroke-width="1"/>`;
                }
            });
        }
            svgString += `</svg>`;
            return svgString;
        } catch (error) {
            console.error(error);
            throw error;  
        }
    }
    createSvgNatal(rawData: NatalChart) {
        try {
            const natalData = rawData.data;
            const aspects = rawData.aspects;
            const width = 650;
            const height = 650;
            const radius = 300;
            const center = { x: width / 2, y: height / 2 };
    
            let svgString = `<svg width="226" height="226" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    
            // Фон
            svgString += `<circle cx="${center.x}" cy="${center.y}" r="${radius}" fill="#CB8020" stroke="none" stroke-width="3"/>`;
            
        // Радіус центрального кола
        const centralRadius = 52;

        // Лінії поділу на 12 частин
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * (Math.PI / 180);
            
            // Обчислення кінцевих точок для лінії (між центром і центральним колом)
            const x1 = Math.cos(angle) * (radius-25) + center.x;
            const y1 = Math.sin(angle) * (radius-25) + center.y;

            // Обчислення координат для кінця лінії на зовнішньому радіусі
            const x2 = Math.cos(angle) * radius + center.x;
            const y2 = Math.sin(angle) * radius + center.y;

            // Додаємо лінію від центра до краю центрального кола
            svgString += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FAE4C8" stroke-width="2"/>`;
        }


        // Малюємо центральне коло
        svgString += `<circle cx="${center.x}" cy="${center.y}" r="${radius-25}" fill="#FFFFFF" stroke="none" stroke-width="2"/>`;
        svgString += `<circle cx="${center.x}" cy="${center.y}" r="${radius-70}" fill="#FFFFFF" stroke="#E4B77C" stroke-width="1"/>`;
        svgString += `<circle cx="${center.x}" cy="${center.y}" r="${centralRadius}" fill="#FFFFFF" stroke="none" stroke-width="2"/>`;
               // Лінії поділу на 12 частин
               for (let i = 0; i < 12; i++) {
                const angle = (i * 30) * (Math.PI / 180);
                
                // Обчислення кінцевих точок для лінії (між центром і центральним колом)
                const x1 = Math.cos(angle) * (radius-70) + center.x;
                const y1 = Math.sin(angle) * (radius-70) + center.y;
    
                // Обчислення координат для кінця лінії на зовнішньому радіусі
                const x2 = Math.cos(angle) * radius + center.x;
                const y2 = Math.sin(angle) * radius + center.y;
    
                // Додаємо лінію від центра до краю центрального кола
                svgString += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#E4B77C" stroke-width="1"/>`;
            }
            // Знаки зодіаку та їхні сузір'я
            const zodiacSigns = [
                { name: "Virgo", emoji: "♈" }, { name: "Leo", emoji: "♉" },
                { name: "Cancer", emoji: "♊" }, { name: "Gemini", emoji: "♋" },
                { name: "Taurus", emoji: "♌" }, { name: "Aries", emoji: "♍" },
                { name: "Pisces", emoji: "♎" }, { name: "Aquarius", emoji: "♏" },
                { name: "Capricorn", emoji: "♐" }, { name: "Sagittarius", emoji: "♑" },
                { name: "Scorpio", emoji: "♒" }, { name: "Libra", emoji: "♓" }
            ];

            const textRadius = radius-20; 

            zodiacSigns.forEach((sign, i) => {
                const sectorAngle = 30; 
                const baseAngle = i * sectorAngle; 
                const centerAngle = baseAngle + sectorAngle / 2; 
                
                const angleRad = ((centerAngle - 90) * Math.PI) / 180; // Переведення в радіани
                const textX = Math.cos(angleRad) * textRadius + center.x;
                const textY = Math.sin(angleRad) * textRadius + center.y;
                
                const rotation = centerAngle; // Поворот тексту у межах секції
            
                svgString += `
                    <text x="${textX}" y="${textY}" font-size="20" fill="#FFF9F1" text-anchor="middle"
                          transform="rotate(${rotation}, ${textX}, ${textY})">
                        ${sign.name}
                    </text>
                `;
            });
            const innerRadius = radius - 50;
        const exceptions = ["Mean_Node"];
        const normal = ["north_node"];
        const exceptionsMap: Record<string, string> = Object.fromEntries(
            exceptions.map((exception, index) => [exception.toLowerCase(), normal[index]])
          );
        let planetPositions = {};
        Object.values(natalData).forEach((planet: CelestialBody) => {
            if (planet && typeof planet === "object" && planet.abs_pos !== undefined && fs.existsSync(path.join(__dirname, '../../../src/files/planets', `${planet.name.toLowerCase()}.svg`))) {
                const angleRad = ((planet.abs_pos - 90) * Math.PI) / 180;
                const x = Math.cos(angleRad) * innerRadius + center.x;
                const y = Math.sin(angleRad) * innerRadius + center.y;
                
                const planetName = planet.name ? planet.name.toLowerCase() : "unknown";
                const planetSvg = this.loadPlanetSvgByName(planetName) || "";
                
                svgString += `<g transform="translate(${x}, ${y}) scale(1.5)">${planetSvg}</g>`;
                planetPositions[planet.name] = { x, y };
            }else if(planet && typeof planet === "object" && planet.abs_pos !== undefined && exceptions.includes(planet.name)){
                const angleRad = ((planet.abs_pos - 90) * Math.PI) / 180;
                const x = Math.cos(angleRad) * innerRadius + center.x;
                const y = Math.sin(angleRad) * innerRadius + center.y;
                
                const planetName = planet.name ? planet.name.toLowerCase() : "unknown";
                const planetSvg = this.loadPlanetSvgByName(exceptionsMap[planetName]) || "";
                
                svgString += `<g transform="translate(${x}, ${y})">${planetSvg}</g>`;
                planetPositions[planet.name] = { x, y };
            }
        });

        if (!aspects || !Array.isArray(aspects)) {
            console.error("Error: Aspects data is missing or invalid");
        } else {
            aspects.forEach(({ p1_name, p2_name, aspect }) => {
                if (planetPositions[p1_name] && planetPositions[p2_name]) {
                    const { x: x1, y: y1 } = planetPositions[p1_name];
                    const { x: x2, y: y2 } = planetPositions[p2_name];
                    let x1f, x2f, y1f, y2f;
                    if(y1 > 0 || y2 > 0){
                        y1f = y1+5;
                        y2f = y2+5;
                    }else{
                        y1f = y1-32;
                        y2f = y2-32;
                    }
                    if(x1 > 0 || x2 > 0){
                        x1f = x1+5;
                        x2f = x2+5;
                    }else{
                        x1f = x1-32;
                        x2f = x2-32;
                    }
                    let color = "#E4B77C";
                    
                    svgString += `<line x1="${x1f}" y1="${y1f}" x2="${x2f}" y2="${y2f}" stroke="${color}" stroke-width="1"/>`;
                }
            });
        }
            svgString += `</svg>`;
            return svgString;
        } catch (error) {
            console.error(error);
            throw error;  
        }
    }
    
    loadStyles(){
        const pageHeight = 1130;
        const svgPath = path.resolve(__dirname, `../../../src/files/`);
        return `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Delius+Swash+Caps&display=swap');
                html{
                    background-color: #f9f9f9;
                    padding: 16px 20px;
                    padding-right: 40px;
                    margin: 0;
                }
                body {
                    font-family: 'Roboto', sans-serif;
                    text-align: center;
                    margin: 0 auto;
                    padding: 0;
                    background-color: #f9f9f9 !important;
                    color: #333;
                }
                .page-break {
                    page-break-before: always;
                }
                .logo svg{
                    width: 81px;
                    height: 20px;
                }
                .p1-content{
                    display: flex;
                    flex-direction: column;
                    align-items:center;
                    background-color: #FAE4C8;
                    width: 708px;
                    height: 1040px;
                    padding: 24px;
                    border-radius: 12px;
                    margin-right: 20px;
                    margin-bottom: 16px;
                }
                .p2{
                    width: 100%;
                    height: 100%;
                }
                .p2-content {
                    width: 100%;
                }
                .p1-content-text{
                    margin: 32px 0;
                }
                .p1-content-title{
                    color: #161616;
                    font-size: 24px;
                    font-weight: 500;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
                .p1-content-subtitle{
                    color: #494B50;
                    font-size: 12px;
                    font-weight: 400;
                    margin-top: 8px;
                }
                .p1-twins{
                    margin: 40px 0;
                }
                .p1-twins svg{
                    width: 356px;
                    height: 396px;
                }
                .p1-content-under{
                    margin: 40px 0;
                }
                .p1-content-under-text{
                    color: #161616;
                    font-size: 14px;
                    font-weight: 400;
                }
                .p1-content-names{
                    display:flex;
                    justify-content: center;
                    gap: 3px;
                    color: #161616;
                    font-size: 14px;
                    font-weight: 400;
                }
                .p1-content-name{
                    text-align: center;
                    padding-top: 4px;
                    padding-left: 4px;
                    padding-right: 4px;
                    padding-bottom: 4px;
                    font-size: 16px;
                    color: #FFF9F1;
                    background-color: #CB8020;
                    border-radius: 4px;
                    font-weight: 400;
                }
                .p1-footer{
                    background-color: #FFF9F1;
                    text-align: center;
                    width: 100%;
                    margin: 24px;
                    border-radius: 8px;
                }
                .p1-footer-text{
                    font-family: "Delius Swash Caps", cursive;
                    font-weight: 400;
                    font-style: normal;
                    color: #CB8020;
                    font-size: 12px;
                    padding: 8px 0;
                }
                .top-element {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 9px;
                    width: 100%;
                    margin-left: 10px;
                }
                .parent-container{
                    position: relative;
                    height: 100%;
                }
                .bottom-element {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 9px;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    margin-left: 10px;
                }
                .sub {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    flex-grow: 1; /* Дозволяє зайняти весь доступний простір */
                }

                .line {
                    flex-grow: 1; /* Робить лінії однакової ширини */
                    height: 1.5px;
                    background-color: #FAE4C8;
                }

                .star {
                    flex-shrink: 0; /* Не дозволяє зменшуватися */
                }
                .page-title {
                    flex-shrink: 0; /* Запобігає стисканню */
                    font-size: 12px;
                    font-weight: 400;
                    text-align: center;
                    white-space: nowrap; /* Запобігає переносу */
                }

                .p2-text{
                    width: 100%;
                    text-align: left;
                    color: #000000;
                    font-size: 8px;
                    font-weight: 300;
                    background-color: #FAE4C8;
                    padding: 8px;
                    border-radius: 8px;
                }
                .p2-start{
                    width: 92.5% !important;
                    margin: 0 30px 0 30px;
                }
                .p12-text{
                    text-align: left;
                    color: #FFF9F1;
                    font-size: 12px;
                    font-weight:400;
                    background-color: #CB8020;
                    padding: 8px;
                    border-radius: 8px;
                }
                .p2-chart {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 300px;
                }
                .p2-chart svg {
                    transform: scale(0.4615);
                }
                .p2-plus{
                    width: 24px;
                    height: 24px;
                }
                .p2-content-name{
                    text-align: center;
                    padding-top: 4px;
                    padding-left: 4px;
                    padding-right: 4px;
                    padding-bottom: 4px;
                    font-size: 18px;
                    color: #FFF9F1;
                    background-color: #CB8020;
                    border-radius: 4px;
                    max-width: fit-content;
                }
                .p2-userinfo{
                    width: 90%;
                    margin: 12px 30px 0px 30px;
                    padding: 16px;
                    border-radius: 8px;
                    border: 1px solid #FAE4C8;
                }
                .p2-end{
                    width: 92.5%;
                    position: absolute;
                    bottom: 30px;
                    left: 30px;
                    text-align: center;
                }
                .p2-down{
                    text-align: center;
                    width: 97%;
                }
                .p2-users{
                    width: 97%;
                    padding: 8px;
                    border-radius: 8px;
                    display: flex;
                    justify-content: center;
                    gap: 5%;
                    border: 1px solid #FAE4C8;
                }
                .p2-user{
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    align-items: center;
                }
                .p2-user-text{
                    color:#9499AC;
                    font-size: 8px;
                    font-weight: 400;
                    text-align: center;
                }
                .p2-symbols{
                    display: flex;
                    justify-content:space-between;
                    margin: 10px 0;
                }
                .p2-symbols-list{
                    display: flex
                }
                .p2-symbols-list ul{
                    list-style:none;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .p2-symbols-list ul li {
                    display: flex;
                    align-items: center; 
                    gap: 8px; 
                }
                .text-right{
                    color: #494B50;
                    font-size:12px;
                }
                .text-right svg{
                    width: 14px; 
                    height: auto;
                }
                .text-left svg{
                    width: 14px; 
                    height: auto;
                }
                .text-left{
                    color: #494B50;
                    font-size:12px;
                }
                .p2-symbols-title{
                    color:#CB8020;
                    font-size: 12px;
                    font-weight: 400;
                }
                .text-block{
                    margin: 5px 0;
                    padding: 8px;
                    border: 1px solid #FAE4C8;
                    border-radius: 8px;
                    text-align:left;
                }
                .text-block-list{
                  list-style-type: none; 
                  padding-left: 20px;
                }
                .text-block-list li{
                    margin-top: 6px;
                    font-size: 8px;
                    font-weight: 200;
                    color: #000000;
                }
                .text-block-list li b{
                    font-size: 8px;
                    font-weight: 400;
                    color: #000000;
                }
                .text-block-list li svg{
                    width: 8px;
                    height: auto;
                }
                .text-block-title{
                    font-size: 8px;
                    font-weight: 400;
                    color: #000000;
                }
                .p3-text{
                    font-size: 8px;
                    line-height: 125%;
                    font-weight: 200;
                    color: #000000;
                    text-align:left;
                }
                .p3-end{
                    font-size: 8px;
                    font-weight: 400;
                    line-height: 125%;
                }
                .p3-title{
                    font-size: 10px;
                    color: #000000;
                    font-weight: 400;
                    text-align:left;
                }
                .p4-yellow{
                    color:#CB8020;
                    font-size:12px;
                    text-align:left;
                }
                .p5-natal{
                    width: 100%;
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid #FAE4C8;
                    display: flex;
                    gap:68px;
                    justify-content:center;
                }
                .p5-natal-title{
                    color: #CB8020;
                    font-size: 12px;
                    font-weight: 400;
                    width: auto;
                }
                .planet-list{
                    list-style: none;
                }
                .planet-list li{
                    display: flex;
                    gap: 5px;
                    margin-top: 3px;
                }
                .p12-content{
                    margin-top:25px;
                    height: 1020px !important;
                    position: relative;
                }
                .p12-top{
                    display:flex;
                }
                .p12-textblock-text{
                    margin: 0;
                }
                .p12-textblock{
                    display:flex;
                    flex-direction:column;
                    gap: 16px;
                    margin-left: 28px;
                }
                .p12-content h3{
                    color:#000000;
                }
                .p12-questions{
                    margin: 48px 0;
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                }
                .p12-questions p{
                    max-width: 410px;
                    font-size: 10px;
                    font-weight: 400;
                }
                .p12-qr{
                    margin: 10px 0;
                }
                .p12-qr svg{
                    width: 156px;
                    height: 156px;
                }
                .p12-social{
                    margin: 48px 0;
                    margin-top: 0 !important;
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    gap: 8px;
                }
                .p12-social h3{
                    font-size: 10px;
                    font-weight: 400;
                }
                .p12-social-svg{
                    display:flex;
                    gap: 5px;
                }
                .p12-tg{
                
                }
                .p12-logo{
                    position: absolute;
                    bottom: 48px;
                }
                .p12-title{
                    font-size: 16px;
                }
                .p7-text{
                    color: #000000;
                    font-size: 12px;
                    text-align:left;
                }
                .p7-blocks{
                    display: flex;
                    justify-content: flex-start;
                    width: 100%;
                    gap: 12px;
                    margin-left:0;
                }
                .p7-column{
                    list-style:none;
                }
                .p7-column li{
                    padding:8px;
                    display: flex;
                    gap: 12px;
                    margin-top:12px;
                    border-radius:8px;
                    border: 1px solid #FAE4C8;
                }
                .p7-column li svg{
                    width: 28px;
                    height: 28px;
                    margin: auto;
                }
                .p7-bl-text{
                    color: #000000;
                    font-weight: 400;
                    font-size: 8px;
                    text-align:left;
                }
                .p5-zodiac{
                    margin:10px 0;
                    padding: 16px;
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                    border-radius:16px;
                    border: 1px solid #FAE4C8;
                }
                .p5-zodiac-date{
                    margin-top: 12px;
                }
                .p5-zodiac-date h3{
                    color: #CB8020;
                    font-size: 14px;
                }
                .p5-zodiac-date span{
                    color: #716E68;
                    font-size: 11px;
                }
                .p5-zodiac-info{
                    display:flex;
                    flex-wrap:wrap;
                    gap:4px;
                }
                .p5-zodiac-info-item{
                    display:flex;
                    flex-direction:column;
                    border-radius:8px;
                    border: 1px solid #FAE4C8;
                    padding: 4px 8px;
                    text-align:left;
                }
                .p5-zodiac-info-item-title{
                    color: #494B50;
                    font-size: 12px;
                }
                .p5-zodiac-info-item-value{
                    color: #CB8020;
                    font-size: 12px;
                }
                .p11-arcadeons{
                    margin-top:10px;
                    width:100%;
                }
                .p11-arcadeon{
                    margin: 10px 0;
                    padding:4px;
                    display:flex;
                    justify-content:center;
                    gap:10%;
                    width:100%;
                    border-radius:8px;
                    border: 1px solid #FAE4C8;
                }
                .p11-arcadeon-text{
                    display:flex;
                    gap:4px;
                }
                .p11-arcadeon-text h3{
                    font-size: 20px;
                    color: #CB8020;
                    margin:auto 0;
                    max-width:30%;
                }
                .p11-arcadeon-text span{
                    font-size: 13px;
                    color: #CB8020;
                    margin:auto 0;
                    max-width:30%;
                }
                .p11-block{
                    padding:8px;
                    border-radius:8px;
                    border: 1px solid #FAE4C8;
                }
                .p11-block h3{
                    text-align:center;
                    color: #CB8020;
                    font-size:14px;
                }
                .p11-title{
                    color: #000000;
                    font-size:12px;
                    text-align:left;
                }
                .p11-arcadeon-info ul{
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    list-style:none;
                    text-align:left;
                }
                .p9-planets{
                    display: flex;
                    width:100%;
                    justify-content:space-between;
                    margin:10px;
                    gap:2%;
                }
                .p9-planet{
                    padding: 8px;
                    border-radius:8px;
                    border: 1px solid #FAE4C8;
                    max-width: 48%;
                }
                .p9-planet-title{
                    text-align:center;
                    margin:0 auto;
                    color: #CB8020;
                    font-size:13px;
                }
                .p9-planet-img{
                    margin: 10px 0;
                }
                .p9-planet-text{
                    text-align:left;
                    color: #000000;
                    font-size:10px;
                }
                .p9-planet-sub{
                    margin: 10px 0;
                    font-weight: 600;
                    font-size: 11px;
                    color: #000000;
                    text-align:left;
                }
                .p8-section{
                    position:relative;
                    width: 100%;
                    min-height: 350px;
                }
                .p8-chart svg{
                    transform: scale(0.4);
                    margin: 0 auto;
                }
                .p8-chart{
                    position: absolute;
                    top: -780px;
                    left: 20px;
                }
                .p8-title{
                    color: #CB8020;
                    font-size: 15px;
                    position: absolute;
                    top: 92%;
                    left: 260px;
                }
                .p8-info{
                    display: flex;
                    width:100%;
                    justify-content:space-between;
                    margin:10px;
                    gap:2%;
                }
                .p8-card{
                    padding: 8px;
                    border-radius:8px;
                    border: 1px solid #FAE4C8;
                }
                .p8-card-title{
                    color: #CB8020;
                    font-size: 12px;
                }
                .p8-card-el{
                    margin: 8px 0;
                    display: flex;
                    gap: 5px;
                }
                .p8-card-el p{
                    text-align:left;
                    color: #000000;
                    font-size: 9.5px;
                }
                .p8-card-el-img{
                
                }
                .p8-last{
                    padding: 8px;
                    border-radius:8px;
                    border: 1px solid #FAE4C8;
                    margin:10px 0;
                }
                .p8-last-title{
                    color: #CB8020;
                    font-size: 12px;
                }
                .p8-line{
                    display:flex;
                    width: 100%;
                    gap: 10px;
                    justify-content:center;
                }
                .p8-line-p{
                    padding: 4px;
                    border-radius:4px;
                    border: 1px solid #FAE4C8;
                    color: #000000;
                    font-size: 9.5px;
                }
                .p8-last-sub{
                    color: #000000;
                    font-size:10px;
                    text-align:left;
                    font-weight: 600;
                }
                .content-container{
                    width: calc(100% - 60px);
                    margin: 0 30px 0 30px;
                }
                .p12-picture{
                    width:152px;
                    height:169px;
                }
            </style>
        `;
    }
    async createPdfFile(body: PDFInfo){
        console.log("Launching Puppeteer...");
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });        
        
        const page = await browser.newPage();
        const formatter = DateTimeFormatter.ofPattern("d MMM, yyyy 'at' hh:mm a").withLocale(Locale.ENGLISH);
        
        // -- Content -- //
        const twinsPath = path.join(__dirname, "../../../src/files/twins.svg");
        const twinsContent = fs.readFileSync(twinsPath, "utf-8");

        const miniPath = path.join(__dirname, "../../../src/files/cover-picture.svg");
        const miniContent = fs.readFileSync(miniPath, "utf-8");

        const QRPath = path.join(__dirname, "../../../src/files/QR.svg");
        const QRContent = fs.readFileSync(QRPath, "utf-8");

        const telegramPath = path.join(__dirname, "../../../src/files/telegram.svg");
        const telegramContent = fs.readFileSync(telegramPath, "utf-8");

        const logoPath = path.join(__dirname, "../../../src/files/logo.svg");
        const logoContent = fs.readFileSync(logoPath, "utf-8");

        const starsPath = path.join(__dirname, "../../../src/files/stars.svg");
        const starsContent = fs.readFileSync(starsPath, "utf-8");

        const plusPath = path.join(__dirname, "../../../src/files/plus.svg");
        const plusContent = fs.readFileSync(plusPath, "utf-8");

        const markerPath = path.join(__dirname, "../../../src/files/marker.svg");
        const markerContent = fs.readFileSync(markerPath, "utf-8");

        const waterPath = path.join(__dirname, "../../../src/files/water.svg");
        const waterContent = fs.readFileSync(waterPath, "utf-8");

        const firePath = path.join(__dirname, "../../../src/files/fire.svg");
        const fireContent = fs.readFileSync(firePath, "utf-8");

        const ariesPath = path.join(__dirname, "../../../src/files/signs_big/Aries.svg");
        const ariesContent = fs.readFileSync(ariesPath, "utf-8");

        const moonPath = path.join(__dirname, "../../../src/files/explonation/Moon.svg");
        const moonContent = fs.readFileSync(moonPath, "utf-8");

        const saturnPath = path.join(__dirname, "../../../src/files/explonation/Saturn.svg");
        const saturnContent = fs.readFileSync(saturnPath, "utf-8");

        const venus_marsPath = path.join(__dirname, "../../../src/files/explonation/Venus_Mars.svg");
        const venus_marsContent = fs.readFileSync(venus_marsPath, "utf-8");

        const n1Path = path.join(__dirname, "../../../src/files/page8/1.svg");
        const n1Content = fs.readFileSync(n1Path, "utf-8");

        const n2Path = path.join(__dirname, "../../../src/files/page8/2.svg");
        const n2Content = fs.readFileSync(n2Path, "utf-8");

        const n3Path = path.join(__dirname, "../../../src/files/page8/3.svg");
        const n3Content = fs.readFileSync(n3Path, "utf-8");

        const n4Path = path.join(__dirname, "../../../src/files/page8/4.svg");
        const n4Content = fs.readFileSync(n4Path, "utf-8");
        // -- Content -- //

        // -- Styles -- //
        const styles = this.loadStyles();
        // -- Styles -- //

        // -- chart -- //
        const chart1 = this.createSvg(body.synastry);
        // -- chart -- //

        // -- Top -- //
        const topElement = (title: string)=>{
            return `
            <div class="top-element">
                <div class="sub">
                    <div class="line"></div>
                    <div class="star">${starsContent}</div>
                </div>
                <h2 class="page-title">${title}</h2>
                <div class="sub">
                    <div class="star">${starsContent}</div>
                    <div class="line"></div>
                </div>
            </div>
            `;
        }
        // -- Top -- //
         // -- down -- //
         const downElement = (number: number)=>{
             return `
             <div class="bottom-element">
                 <div class="sub">
                     <div class="line"></div>
                 </div>
                 <h2 class="page-title">${number}</h2>
                 <div class="sub">
                     <div class="line"></div>
                 </div>
             </div>
             `;
         }
         // -- down -- //

        // -- Page 1 -- //
        const page1 = `
        <div class="p1-content">
                <div class="logo">${logoContent}</div>
                <div class="p1-content-text">
                    <h1 class="p1-content-title">Your Personalized Synastry Chart</h1>
                    <h2 class="p1-content-subtitle">March 13, 2025</h2>
                </div>
                <div class="p1-twins">
                    ${twinsContent}
                </div>
                <div class="p1-content-under">
                    <h2 class="p1-content-under-text">This cosmic report is crafted exclusively for</h2>
                    <div class="p1-content-names">
                        <div class="p1-content-name">${body.name1}</div>
                         <span>and</span>
                        <div class="p1-content-name">${body.name2}</div>
                    </div> 
                </div>
                <div class="p1-footer">
                    <h1 class="p1-footer-text">
                        In this report, you'll find a unique analysis of your relationship dynamics, 
                        including your shared strengths and growth areas.
                    </h1>
                </div>
            </div>
            <div class="page-break"></div>
        `;
        // -- Page 1 -- //
        const signsSvg = this.loadSvg("signs");
        const planetsSvg = this.loadSvg("planets");
        const signNames = ["aries", "taurus", "gemini", "cancer",
            "leo", "virgo", "libra", "scorpio", "sagittarius", 
            "carpicorn", "aquarius", "pisces"
        ];
        const planetNames = ["sun", "moon", "mercury", "venus", "mars", "jupiter",
            "saturn", "uranus", "neptune", "pluto", "chiron", "ascendant", "mc", 
            "north node"
        ];
        const renderSignList = () => {
            let list:string = "";
            let list1:string = "";
            let list2:string = "";
            signNames.splice(6, 6).map((item, index)=>{
                list1 += `
                    <li class="text-right"><div class="text-right-svg">${signsSvg[index]}</div> <span>${item.toUpperCase()}</span></li>
                `;
            })
            signNames.splice(0, 6).map((item, index)=>{
                list2 += `
                    <li class="text-right"><div class="text-right-svg">${signsSvg[index+5]}</div> <span>${item.toUpperCase()}</span></li>
                `;
            })
            list = `
                <ul>
                    ${list1}
                </ul>
                <ul>
                    ${list2}
                </ul>
            `;
            return `<div class="p2-symbols-list">${list}</div>`;
        }
        const renderPlanetList = () => {
            let list:string = "";
            let list1:string = "";
            let list2:string = "";
            planetNames.splice(7, 7).map((item, index)=>{
                list1 += `
                    <li><span class="text-left">${item.toUpperCase()}</span> ${planetsSvg[index]}</li>
                `;
            })
            planetNames.splice(0, 7).map((item, index)=>{
                list2 += `
                    <li><span class="text-left">${item.toUpperCase()}</span> ${planetsSvg[index+6]}</li>
                `;
            })
            list = `
                <ul>
                    ${list1}
                </ul>
                <ul>
                    ${list2}
                </ul>
            `;
            return `<div class="p2-symbols-list">${list}</div>`;
        }
        // -- Page 2 -- //
        const page2 = `
            <div class="p2 parent-container">
                ${topElement("Synastry Chart")}
                <div class="p2-content">
                    <p class="p2-text p2-start">
                        Synastry is a branch of astrology that compares the birth charts of two people.
                        It examines how the planetary positions at the time of birth interact between partners.
                        We overlay your charts to highlight key points such as the Sun, Moon, and Ascendant.
                        These markers reveal core personality traits and relationship energies.
                        Synastry transforms complex astrological data into clear insights you can use.
                    </p>
                    <div class="p2-chart">${chart1}</div>
                    <div class="p2-userinfo">
                        <div class="p2-users">
                            <div class="p2-user">
                                <div class="p2-content-name">${body.name1}</div>
                                <span class="p2-user-text">${ZonedDateTime.parse(body.birthDate1).withZoneSameInstant(ZoneId.of('UTC')).format(formatter)}</span>
                                <span class="p2-user-text">${body.birthPlace1}</span>
                            </div>
                            <div class="p2-plus">
                                ${plusContent}
                            </div>
                            <div class="p2-user">
                                <div class="p2-content-name">${body.name2}</div>
                                <span class="p2-user-text">${ZonedDateTime.parse(body.birthDate2).withZoneSameInstant(ZoneId.of('UTC')).format(formatter)}</span>
                                <span class="p2-user-text">${body.birthPlace2}</span>
                            </div>
                        </div>
                        <div class="p2-symbols">
                            <div class="p2-symbols-signs">
                                <span class="p2-symbols-title">Zodiac Signs</span>
                                    ${renderSignList()}
                            </div>
                            <div class="p2-symbols-planets">
                                <span class="p2-symbols-title">Planet Symbols</span>
                                    ${renderPlanetList()}
                            </div>
                        </div>
                        <p class="p12-text p2-down">
                            Sun-Moon connections: potential for emotional synergy.
                        </p>
                    </div>
                    <p class="p2-text p2-end">
                        The legend below decodes each sign and planet, helping you see where your energies align or clash.
                    </p>
                </div>
                ${downElement(2)}
            </div>
        `;
        // -- Page 2 -- //
        // -- Page 3 -- //
        const page3 = `
            <div class="p3 parent-container">
                ${topElement("What is Synastry?")}
                <div class="p3-content content-container">
                    <p class="p3-text">
                        Synastry is a branch of astrology that compares the birth charts of two people.
                        It examines how the planetary positions at the time of birth interact between partners.
                        We overlay your charts to highlight key points such as the Sun, Moon, and Ascendant.
                        These markers reveal core personality traits and relationship energies.
                        Synastry transforms complex astrological data into clear insights you can use.
                    </p>
                    <div class="text-block">
                        <span class="text-block-title">
                            Key benefits of synastry:
                        </span>
                        <ul class="text-block-list">
                            <li>${markerContent}<b>Clarity: </b>Understand how each partner’s energy influences the relationship.</li>
                            <li>${markerContent}<b>Guidance: </b>Identify strengths and potential challenges.</li>
                            <li>${markerContent}<b>Awareness: </b>Learn which traits blend well and which may clash.</li>
                        </ul>
                    </div>
                    <p class="p3-text">
                        Synastry does not predict fate. It uncovers the hidden layers of your relationship.
                        It shows how you and your partner influence each other.
                        You gain a clear picture of your communication style and emotional balance.
                        Each planetary aspect comes with a brief explanation in plain language.
                        This way, you know exactly what the energies mean for your connection.
                    </p>
                    <h2 class="p3-title">The Purpose of Your Report</h2>
                    <p class="p3-text">
                        The purpose of this report is to offer deep insight into your relationship and provide actionable guidance.
                        Our goal is to simplify complex astrological data into practical advice you can apply every day.
                    </p>
                    <div class="text-block">
                        <span class="text-block-title">
                            This report does the following:
                        </span>
                        <ul class="text-block-list">
                            <li>${markerContent}<b>Breaks Down Your Charts: </b>We analyze your individual natal charts and then compare them. You see how your energies interact.</li>
                            <li>${markerContent}<b>Offers Detailed Analysis: </b>You learn why you click in some areas and face friction in others. We highlight key planetary aspects that influence your connection.</li>
                            <li>${markerContent}<b>Provides Practical Guidance: </b>Clear tips help you use your strengths and manage potential conflicts. The advice is direct and ready to apply.</li>
                            <li>${markerContent}<b>Promotes Personal Growth: </b>You discover how your relationship can help you grow. The report serves as a roadmap for building a balanced, harmonious bond.</li>
                        </ul>
                    </div>
                    <div class="text-block">
                        <span class="text-block-title">
                            Inside this report, you will find:
                        </span>
                        <ul class="text-block-list">
                            <li>${markerContent}<b>Individual Natal Charts: </b>Detailed breakdowns of your core traits, including your Sun, Moon, and Ascendant signs.</li>
                            <li>${markerContent}<b>Synastry Analysis: </b>A comprehensive look at how your charts interact, with each aspect explained briefly.</li>
                            <li>${markerContent}<b>Actionable Recommendations: </b>Clear steps to boost communication and manage emotional dynamics.</li>
                        </ul>
                    </div>
                    <p class="p3-text">
                        This report acts as your personal guide. It uses simple language without confusing astrological jargon.
                        You gain a clear view of your relationship’s strengths and challenges.
                        This clarity empowers you to nurture your connection confidently.
                    </p>
                    <h2 class="p3-title">How to Read This Report</h2>
                    <p class="p3-text">
                        This report is divided into clear, concise sections.
                        Each section builds on the previous one, making it easy to follow.
                    </p>
                    <p class="p3-text">
                        You will first read an introduction that explains what synastry is.
                        Next, you review your individual natal charts.
                        In this section, you see each partner’s core traits presented in simple graphics and bullet points.
                    </p>
                    <p class="p3-text">
                        The following section focuses on the synastry analysis.
                        Here, you find a breakdown of major planetary aspects between you and your partner.
                        Each aspect comes with a short, direct explanation.
                        We use tables and lists to make the information easy to scan.
                    </p>
                    <p class="p3-text">
                        After the analysis, you receive practical recommendations.
                        This section gives clear steps to enhance your relationship.
                        The advice is written in friendly, direct language so you can use it immediately in your daily life.
                    </p>
                    <p class="p3-text">
                        The report concludes with a summary and additional resources.
                        This final section ties together all the insights you have gained.
                        It recaps key points and guides you on the next steps.
                    </p>
                    <p class="p2-text p3-end">
                        By following this structured approach, you get a clear,
                        actionable view of your relationship’s celestial blueprint.
                        This Personalized Synastry Chart report is designed to empower you and your partner
                        to grow together and build a lasting, meaningful bond.
                    </p>
                </div>
                ${downElement(3)}
            </div>
            <div class="page-break"></div>
        `;
        // -- Page 3 -- //
        // -- Page 4 -- //
        const page4 = `
            <div class="p4 parent-container">
                ${topElement("Methodology")}
                <div class="p4-content content-container">
                    <p class="p3-text">
                        This report transforms your birth details into a clear, personalized astrological profile
                        It provides insights to help you understand your relationship and make informed decisions.
                    </p>
                    <h2 class="p3-title">Data Sources</h2>
                    <p class="p3-text">
                        You provide your birth date, time, and place. 
                        These details capture the unique snapshot of the sky at your birth.
                        This input creates your natal chart—a blueprint of your core traits and energies.
                        We use trusted astronomical sources to ensure accuracy, so your report truly reflects your cosmic imprint.
                        <b>Ensure your birth details are spot-on—every correct detail unlocks uniquely tailored,
                        precise insights that empower you to fully embrace your cosmic blueprint.</b>
                    </p>
                    <h2 class="p3-title">Astrological Analysis</h2>
                    <p class="p3-text">
                        Your personalized chart reveals essential aspects of your personality.
                        We compare your chart with your partner’s to show how your energies interact.
                    </p>
                    <div class="text-block">
                        <span class="text-block-title">
                            You get a clear breakdown of key points, including:
                        </span>
                        <ul class="text-block-list">
                            <li>${markerContent}<b>Core Personality: </b>You will learn about your Sun, Moon, and Ascendant signs. These elements will highlight your inherent traits and strengths.</li>
                            <li>${markerContent}<b>Relationship Dynamics: </b>You will see how major planetary aspects like Sun-Moon and Venus-Mars will influence your connection. This analysis will reveal where you naturally click and where challenges may occur.</li>
                            <li>${markerContent}<b>Actionable Insights: </b>You will receive straightforward advice. Each planetary aspect will be explained in plain language so you will know exactly how to nurture your strengths and address potential friction.</li>
                        </ul>
                    </div>
                    <div class="text-block">
                        <span class="text-block-title">
                            Key benefits:
                        </span>
                        <ul class="text-block-list">
                            <li>${markerContent}<b>Clarity: </b>Gain a clear view of your unique cosmic imprint.</li>
                            <li>${markerContent}<b>Guidance: </b>Learn practical steps to enhance your relationship.</li>
                            <li>${markerContent}<b>Empowerment: </b>Use actionable insights to make informed decisions.</li>
                        </ul>
                    </div>
                    <div class="p4-end">
                        <div class="p2-text">
                            <h2 class="p3-title">Important Notes</h2>
                            <p class="p3-text">
                                Remember, astrology is a tool for self-reflection.
                                The insights in your report guide you in understanding your relationship better.
                                They are not absolute predictions but serve as a roadmap for growth.
                                Knowing your cosmic blueprint helps you build a balanced and lasting bond.
                            </p>
                            <p class="p3-text">
                                This methodology ensures you receive a practical, easy-to-understand analysis.
                                Enjoy exploring your astrological profile and use these insights to enhance your relationship every day.
                            </p>
                        </div>
                        <p class="p4-yellow">
                            *Astrology is a tool, not a guarantee. Your free will and personal choices shape your path.
                        </p>
                    </div>
                </div>
                ${downElement(4)}
            </div>
            <div class="page-break"></div>
        `;
        // -- Page 4 -- //
        const rawInfoPath = path.join(__dirname, "../../../src/files/mocs/zodiac_signs.json");
        const rawInfo = JSON.parse(fs.readFileSync(rawInfoPath, 'utf-8'));
        const natal1 = this.createSvgNatal(body.natal1)
        const natal2 = this.createSvgNatal(body.natal2)
        const planetsList1 = this.getPlanets(body.natal1);
        const planetsList2 = this.getPlanets(body.natal2);
        const renderZodiacInfo = (birthDate: string) => {
            const data = rawInfo;
            const date = ZonedDateTime.parse(birthDate).withZoneSameInstant(ZoneId.of('UTC'));
            const day = date.dayOfMonth();
            const month = date.monthValue();

            const element = data.find((item) => {
                const range1 = item.date_range.range1;
                const range2 = item.date_range.range2;
              
                const isAfterRange1 = (month > range1.month || (month === range1.month && day >= range1.day));
                const isBeforeRange2 = (month < range2.month || (month === range2.month && day <= range2.day));
              
                return isAfterRange1 && isBeforeRange2;
              });
              const signContent = this.loadSignSvgByName(element.Sign);
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const { date_range, Sign, ...otherData } = element; 
              let form = "";
              Object.entries(otherData).forEach(([key, value]) => {
                const valueString = Array.isArray(value) ? value.join(', ') : value;
                form += `
                    <div class="p5-zodiac-info-item">
                        <span class="p5-zodiac-info-item-title">${key}:</span>
                        <span class="p5-zodiac-info-item-value">${valueString}</span>
                    </div>
                `;
            });
            return `
                    <div class="p5-zodiac">
                        <div class="p5-zodiac-img">
                            ${signContent}
                            <div class="p5-zodiac-date">
                                <h3>${element.Sign}</h3>
                                <span> 
                                    ${monthNames[element.date_range.range1.month - 1]} ${element.date_range.range1.day}-${monthNames[element.date_range.range2.month - 1]} ${element.date_range.range2.day}
                                </span>
                            </div>
                        </div>
                        <div class="p5-zodiac-info">
                            ${form}
                        </div>
                    </div>
            `;
        }
        // -- Page 5 -- //
        const page5 = `
            <div class="p5 parent-container">
                ${topElement("Individual Natal Charts")}
                <div class="p5-content content-container">
                    <p class="p3-text">
                        This section focuses on your unique astrological blueprint.
                        Each partner receives an individual natal chart.
                        The chart is a snapshot of the sky at the exact moment of your birth.
                        It shows the position of key planets. We focus on three core elements:
                        the Sun, Moon, and Ascendant signs. These markers reveal essential aspects of your personality.
                    </p>
                    <div class="p5-natal">
                        <div class="p5-section">
                            <div class="p5-natal-chart">
                                ${natal1}
                            </div>
                            <span class="p5-natal-title title-absolute">${body.name1}’s Chart</span>
                        </div>
                        <div class="p5-section">
                            <span class="p5-natal-title">${body.name1}’s Planets</span>
                            ${planetsList1}
                        </div>
                    </div>
                    ${renderZodiacInfo(body.birthDate1)}
                </div>
                ${downElement(5)}
            </div>
            <div class="page-break"></div>
        `;
        // -- Page 5 -- //
        // -- Page 6 -- //
        const page6 = `
            <div class="p5 parent-container">
                ${topElement("Individual Natal Charts")}
                <div class="p5-content content-container">
                    <div class="p5-natal">
                        <div class="p6-section">
                            <div class="p6-natal-chart">
                                ${natal2}
                            </div>
                            <span class="p5-natal-title title-absolute">${body.name2}’s Chart</span>
                        </div>
                        <div class="p5-section">
                            <span class="p5-natal-title">${body.name2}’s Planets</span>
                            ${planetsList2}
                        </div>
                    </div>
                    ${renderZodiacInfo(body.birthDate2)}
                </div>
                ${downElement(6)}
            </div>
            <div class="page-break"></div>
        `;
        // -- Page 6 -- //
        const renderPlanetListwithText = () => {
            let list:string = "";
            let list1:string = "";
            let list2:string = "";
            planetsDescription.slice(2).splice(7, 7).map((item, index)=>{
                list1 += `
                    <li>${planetsSvg[index]} <span class="p7-bl-text">${item}</span></li>
                `;
            })
            planetsDescription.slice(2).splice(0, 7).map((item, index)=>{
                list2 += `
                    <li>${planetsSvg[index+6]} <span class="p7-bl-text">${item}</span></li>
                `;
            })
            list = `
                <ul class="p7-column">
                    <li>${waterContent} <span class="p7-bl-text">${planetsDescription[0]}</span></li>
                    ${list1}
                </ul>
                <ul class="p7-column">
                    <li>${fireContent} <span class="p7-bl-text">${planetsDescription[1]}</span></li>
                    ${list2}
                </ul>
            `;
            return `${list}`;
        }
        // -- Page 7 -- //
        const page7 = `
            <div class="p7 parent-container">
            ${topElement("Key Aspects Notes")}
                <div class="p7-content content-container">
                    <p class="p3-text">
                        This section focuses on your unique astrological blueprint.
                        Each partner receives an individual natal chart.
                        The chart is a snapshot of the sky at the exact moment of your birth.
                        It shows the position of key planets. We focus on three core elements:
                        the Sun, Moon, and Ascendant signs. These markers reveal essential aspects of your personality.
                    </p>
                    <div class="p7-blocks">
                        ${renderPlanetListwithText()}
                    </div>
                </div>
                ${downElement(7)}
            </div>
            <div class="page-break"></div>
        `;
        // -- Page 7 -- //
        const socialSvg = this.loadSvg("social");
        const renderSocial = () => {
            let str:string = "";
            
            socialSvg.map((svg)=>{
                str += `<div>${svg}</div>`
            })

            return str;
        }
        // -- Page 8 -- //
        const page8 = `
            <div class="p8">
                ${topElement("Key Aspects Overview for  and Nastia")}
                    <div class="p8-content">
                        <p class="p2-text">
                            Your synastry chart shows both beautiful harmony and clear challenges that shape your unique bond.
                            We use precise data from your birth charts to highlight where your energies naturally align
                            and where they may clash. This analysis is based on the exact degrees and orbs from your charts.
                        </p>
                        <div class="p8-section">
                            <div class="p8-chart">
                                ${chart1}
                            </div>
                            <span class="p8-title">${body.name2}’s and ${body.name1}’s Chart</span>
                        </div>
                        <div class="p8-info">
                            <div class="p8-card">
                                <h3 class="p8-card-title">Key Strengths</h3>
                                <div class="p8-card-el">
                                    <div class="p8-card-el-img">${n1Content}</div>
                                    <p>Your charts reveal strong emotional support. For example,
                                    Danylo’s Moon sits at 18°17'00", which aligns well with Nastia’s
                                    Venus at 7°05'07". This suggests warmth and a nurturing connection.</p>
                                </div>
                                <div class="p8-card-el">
                                    <div class="p8-card-el-img">${n2Content}</div>
                                    <p>The overall element mix—38% Fire and 27% Water—creates a dynamic interplay.
                                    This blend fuels creative passion and adds depth to your interactions.</p>
                                </div>
                                <p class="p2-text">
                                    Favorable alignments between personal planets indicate mutual
                                    respect and the ability to learn from each other.
                                    These aspects encourage growth and add excitement to your journey together.
                                </p>
                            </div>
                            <div class="p8-card">
                                <h3 class="p8-card-title">Potential Challenges</h3>
                                <div class="p8-card-el">
                                    <div class="p8-card-el-img">${n3Content}</div>
                                    <p>A critical aspect is Danylo’s Sun at 29°04'15" squaring Nastia’s Moon at 1°12'12".
                                    With a tight orb of about 2°07'57", this square can stir tension between Danylo’s
                                    core identity and Nastia’s emotional needs. For Danylo, this aspect may feel like
                                    a push to assert his individuality during emotional highs, while Nastia might sense
                                    unpredictable mood shifts.</p>
                                </div>
                                <div class="p8-card-el">
                                    <div class="p8-card-el-img">${n4Content}</div>
                                    <p>Other data points, such as the interaction between Danylo’s Mercury at 17°21'54"
                                    and Nastia’s Mars at 27°10'41", hint at moments of miscommunication where assertive
                                    speech could trigger impulsive reactions.</p>
                                </div>
                            </div>
                        </div>
                        <div class="p8-last">
                            <h3 class="p8-last-title">Balance & Recommendations</h3>
                            <div class="p8-line">
                                <p class="p8-line-p">Lean into the strengths that support you. Celebrate the aspects that bring warmth and mutual understanding.</p>
                                <p class="p8-line-p">When challenges arise, practice active listening. Address tension with patience and open dialogue.</p>
                                <p class="p8-line-p">Use each difficult aspect as a chance to learn more about each other’s inner worlds and build resilience.</p>
                            </div>
                            <h4 class="p8-last-sub">Key Takeaway:</h4>
                            <p class="p12-text">
                                Respect and clear communication are your secret ingredients.
                                Embrace your strengths and work together to turn challenges
                                into opportunities for deeper connection.
                            </p>
                        </div>
                    </div>
            </div>
            <div class="page-break"></div>
        `;
        // -- Page 8 -- //
        // -- Page 9 -- //
        const page9 = `
            <div class="p9">
                ${topElement("Detailed Planetary Interactions")}
                    <div class="p9-content">
                        <div class="p9-planets">
                            <div class="p9-planet">
                                <h3 class="p9-planet-title">Moon (Emotions)</h3>
                                <div class="p9-planet-img">
                                    ${moonContent}
                                </div>
                                <p class="p9-planet-text">
                                    Danylo’s Moon at 18°17'00" and Nastia’s Moon at 1°12'12"
                                    shape how each of you processes feelings. 
                                    Danylo tends to express warmth and seeks reassurance when stressed.
                                    Nastia appears more guarded, then opens up with gentle support.
                                    This difference can create confusion,
                                    yet it also encourages both partners to learn each other’s emotional language.
                                </p>
                                <h4 class="p9-planet-sub">Key Takeaway:</h4>
                                <p class="p12-text">
                                    Practice patient listening. Validate each other’s feelings before jumping into solutions.
                                </p>
                            </div>
                            <div class="p9-planet">
                                <h3 class="p9-planet-title">Mercury (Communication)</h3>
                                <div class="p9-planet-img">
                                    ${moonContent}
                                </div>
                                <p class="p9-planet-text">
                                    Danylo’s Mercury at 17°21'54" squares Nastia’s Mars at 27°10'41" by about 10 degrees.
                                    This indicates strong mental energy that can spark lively debates or heated arguments.
                                    For Danylo, this aspect can feel like he needs more space to share
                                    thoughts without interruption. Nastia may feel an urge to respond quickly and prove a point.
                                </p>
                                <h4 class="p9-planet-sub">Key Takeaway:</h4>
                                <p class="p12-text">
                                    Slow down the conversation. Let each partner finish their idea, then respond calmly.
                                </p>
                            </div>
                        </div>
                        <div class="p9-planets">
                            <div class="p9-planet">
                                <h3 class="p9-planet-title">Venus & Mars (Love and Passion)</h3>
                                <div class="p9-planet-img">
                                    ${venus_marsContent}
                                </div>
                                <p class="p9-planet-text">
                                    Danylo’s Venus at 13°14'55" highlights his affectionate style,
                                    which values gentle bonding. Nastia’s Mars at 27°10'41" shows a bold,
                                    action-oriented approach to romance. This pairing can create intense chemistry.
                                    Yet it may also lead to disagreements about how love should be expressed.
                                    When tension rises, step back and remember that both of you crave closeness.
                                </p>
                                <h4 class="p9-planet-sub">Key Takeaway:</h4>
                                <p class="p12-text">
                                    Find a balance between sweet gestures and spontaneous excitement.
                                    Alternate planning dates that suit each partner’s style.
                                </p>
                            </div>
                            <div class="p9-planet">
                                <h3 class="p9-planet-title">Saturn (Long-Term Focus)</h3>
                                <div class="p9-planet-img">
                                    ${saturnContent}
                                </div>
                                <p class="p9-planet-text">
                                    Danylo’s Saturn at 18°58'29" and Nastia’s Saturn at 5°14'26"
                                    remind you to build a solid foundation. These placements reveal that you both value stability,
                                    but you might clash over methods and timing.
                                    For Danylo, structure comes through steady effort.
                                    Nastia often seeks quick results, then adjusts if needed.
                                </p>
                                <h4 class="p9-planet-sub">Key Takeaway:</h4>
                                <p class="p12-text">
                                 Agree on a shared plan.
                                 Break big goals into smaller steps and celebrate each milestone.
                                </p>
                            </div>
                        </div>
                        <p class="p2-text">
                            These planetary interactions create a rich tapestry of emotion, communication, and growth.
                            Embrace the differences, honor each other’s style, 
                            and use these insights to nurture a balanced relationship.
                        </p>
                    </div>
            </div>
            <div class="page-break"></div>
        `;
        // -- Page 9 -- //
        // -- Page 10 -- //
            const page10 = `
            <div class="p9">
                ${topElement("Detailed Planetary Interactions")}
                    <div class="p9-content">
                        <div class="p9-planets">
                            <div class="p9-planet">
                                <h3 class="p9-planet-title">Sun Square Moon</h3>
                                <div class="p9-planet-img">
                                    ${moonContent}
                                </div>
                                <p class="p9-planet-text">
                                    Danylo’s Moon at 18°17'00" and Nastia’s Moon at 1°12'12"
                                    shape how each of you processes feelings. 
                                    Danylo tends to express warmth and seeks reassurance when stressed.
                                    Nastia appears more guarded, then opens up with gentle support.
                                    This difference can create confusion,
                                    yet it also encourages both partners to learn each other’s emotional language.
                                </p>
                                <h4 class="p9-planet-sub">Key Takeaway:</h4>
                                <p class="p12-text">
                                    Practice patient listening. Validate each other’s feelings before jumping into solutions.
                                </p>
                            </div>
                            <div class="p9-planet">
                                <h3 class="p9-planet-title">Mercury Square Mars</h3>
                                <div class="p9-planet-img">
                                    ${moonContent}
                                </div>
                                <p class="p9-planet-text">
                                    Danylo’s Mercury at 17°21'54" squares Nastia’s Mars at 27°10'41" by about 10 degrees.
                                    This indicates strong mental energy that can spark lively debates or heated arguments.
                                    For Danylo, this aspect can feel like he needs more space to share
                                    thoughts without interruption. Nastia may feel an urge to respond quickly and prove a point.
                                </p>
                                <h4 class="p9-planet-sub">Key Takeaway:</h4>
                                <p class="p12-text">
                                    Slow down the conversation. Let each partner finish their idea, then respond calmly.
                                </p>
                            </div>
                        </div>
                        <div class="p9-planets">
                            <div class="p9-planet">
                                <h3 class="p9-planet-title">Moon-Venus Synergy</h3>
                                <div class="p9-planet-img">
                                    ${venus_marsContent}
                                </div>
                                <p class="p9-planet-text">
                                    Danylo’s Venus at 13°14'55" highlights his affectionate style,
                                    which values gentle bonding. Nastia’s Mars at 27°10'41" shows a bold,
                                    action-oriented approach to romance. This pairing can create intense chemistry.
                                    Yet it may also lead to disagreements about how love should be expressed.
                                    When tension rises, step back and remember that both of you crave closeness.
                                </p>
                                <h4 class="p9-planet-sub">Key Takeaway:</h4>
                                <p class="p12-text">
                                    Find a balance between sweet gestures and spontaneous excitement.
                                    Alternate planning dates that suit each partner’s style.
                                </p>
                            </div>
                            <div class="p9-planet">
                                <h3 class="p9-planet-title">Saturn Lessons</h3>
                                <div class="p9-planet-img">
                                    ${saturnContent}
                                </div>
                                <p class="p9-planet-text">
                                    Danylo’s Saturn at 18°58'29" and Nastia’s Saturn at 5°14'26"
                                    remind you to build a solid foundation. These placements reveal that you both value stability,
                                    but you might clash over methods and timing.
                                    For Danylo, structure comes through steady effort.
                                    Nastia often seeks quick results, then adjusts if needed.
                                </p>
                                <h4 class="p9-planet-sub">Key Takeaway:</h4>
                                <p class="p12-text">
                                 Agree on a shared plan.
                                 Break big goals into smaller steps and celebrate each milestone.
                                </p>
                            </div>
                        </div>
                        <p class="p2-text">
                            These planetary interactions create a rich tapestry of emotion, communication, and growth.
                            Embrace the differences, honor each other’s style, 
                            and use these insights to nurture a balanced relationship.
                        </p>
                    </div>
            </div>
            <div class="page-break"></div>
        `;
        // -- Page 10-- //
        // -- Page 11 -- //
        const page11 = `
            <div class="p11">
                ${topElement("Practical Recommendations and Conclusions")}
                    <div class="p11-content">
                        <p class="p3-text">
                            ${body.name1} and ${body.name2}, your synastry report presents a blend of supportive energies and growth challenges.
                            Your chart is a roadmap, not a rulebook.
                            Use these insights to nurture a fulfilling and balanced relationship.
                        </p>
                        <div class="p11-block">
                            <h3>Overall Summary</h3>
                            <p class="p12-text">
                                Your chart shows both warmth and tension. For instance, Danylo’s Sun at 29°04'15"
                                squares Nastia’s Moon at 1°12'12". This aspect can spark conflicts between Danylo’s
                                need for self-expression and Nastia’s demand for emotional reassurance.
                                Meanwhile, a strong Mercury square Mars hints at lively debates,
                                where rapid ideas might escalate into heated exchanges.
                                Yet, the Moon-Venus connection supports gentle understanding and affectionate moments.
                            </p>
                        </div>
                        <h3 class="p11-title">Practical Steps to Strengthen Your Bond</h3>
                        <div class="p11-arcadeons">
                            <div class="p11-arcadeon">
                                <div class="p11-arcadeon-text">
                                    <h3>1</h3>
                                    <span>Enhance</br>Communication:</span>
                                </div>
                                <div class="p11-arcadeon-info">
                                    <ul>
                                        <li>${markerContent}Practice active listening. Allow each partner to share thoughts without interruption.</li>
                                        <li>${markerContent}Pause and reflect during intense discussions. This helps both sides feel heard.</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="p11-arcadeon">
                                <div class="p11-arcadeon-text">
                                    <h3>2</h3>
                                    <span>Manage Emotional</br> Dynamics:</span>
                                </div>
                                <div class="p11-arcadeon-info">
                                    <ul>
                                        <li>${markerContent}Recognize when Danylo’s assertiveness might clash with Nastia’s sensitivity.</li>
                                        <li>${markerContent}Set aside time for weekly check-ins or a relaxing walk to reconnect emotionally.</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="p11-arcadeon">
                                <div class="p11-arcadeon-text">
                                    <h3>3</h3>
                                    <span>Resolve Conflicts</br> Constructively:</span>
                                </div>
                                <div class="p11-arcadeon-info">
                                    <ul>
                                        <li>${markerContent}Use challenging aspects like the Sun-Moon square as opportunities for growth.</li>
                                        <li>${markerContent}Write down feelings and discuss them calmly later to avoid impulsive reactions.</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="p11-arcadeon">
                                <div class="p11-arcadeon-text">
                                    <h3>4</h3>
                                    <span>Celebrate Strengths:</span>
                                </div>
                                <div class="p11-arcadeon-info">
                                    <ul>
                                        <li>${markerContent}Acknowledge supportive aspects that bring warmth, such as the harmonious Moon-Venus synergy.</li>
                                        <li>${markerContent}Use these positive energies to build trust and boost intimacy.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <h3 class="p11-title">Key Takeaway:</h3>
                        <p class="p12-text">
                            Embrace both the strengths and challenges in your unique dynamic.
                            Open dialogue and mutual respect can turn obstacles into stepping stones toward deeper connection.
                        </p>
                        <p class="p3-text">
                            By combining structure with spontaneous gestures,
                            you can merge Danylo’s methodical approach with Nastia’s vibrant energy.
                            Adapt, communicate honestly, and celebrate every small victory.
                            Your synastry chart offers practical guidance to help you grow together,
                            turning potential conflicts into opportunities for lasting harmony.
                        </p>
                    </div>
            </div>
            <div class="page-break"></div>
        `;
        // -- Page 11 -- //
        // -- Page 12 -- //
        const page12 = `
            <div class="p1-content p12-content">
                <div class="p12-top">
                    <div class="p12-picture">
                        ${miniContent}
                    </div>
                    <div class="p12-textblock">
                        <p class="p12-text p12-textblock-text">
                            Thank you for exploring your cosmic synergy with us.
                             Use code STARS10 for 10% off your next reading!
                        </p>
                        <p class="p12-text p12-textblock-text">
                            Remember, astrology provides insights, but the journey is yours to shape.
                            We wish you both a harmonious path forward!
                        </p>
                    </div>
                </div>
                <div class="p12-questions">
                    <span class="p5-natal-title p12-title">Have questions?</span>
                    <div class="p12-qr">
                        ${QRContent}
                    </div>
                    <p>
                        Lorem ipsum dolor sit amet consectetur. Id ultrices mi non a.
                        Dignissim pellentesque mattis duis venenatis sed eu scelerisque.
                        Varius nulla suscipit ornare tincidunt lorem.
                        Semper blandit fusce euismod scelerisque turpis congue at neque id.
                    </p>
                </div>
                <div class="p12-social">
                    <h3>Channels</h3>
                    <div class="p12-tg">${telegramContent}</div>
                    <h3>We are on social media</h3>
                    <div class="p12-social-svg">
                        ${renderSocial()}
                    </div>
                </div>  
                <div class="logo p12-logo">${logoContent}</div>
            </div>
        `;
        // -- Page 12 -- //
        const htmlContent = `
        <html>
        <head>
            ${styles}
        </head>
        <body>
            ${page1}
            ${page2}
            ${page3}
            ${page4}
            ${page5}
            ${page6}
            ${page7}
            ${page12}
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #f9f9f9; z-index: -1;"></div>
        </body>
        </html>
        `;

        console.log("Setting page content...");
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });

        console.log("Generating PDF...");
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
        });
        
        const scale = await page.evaluate(() => window.devicePixelRatio);
        console.log("Device Pixel Ratio:", scale);
        await browser.close();
        console.log("PDF generated successfully.");
        const buffer = Buffer.from(pdfBuffer);
        return buffer;
    }
}
