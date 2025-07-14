import {
  DateTimeFormatter,
  LocalDate,
  ZonedDateTime,
  ZoneId,
} from '@js-joda/core';
import { Locale } from '@js-joda/locale_en';
import '@js-joda/timezone';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { CelestialBody, NatalChart } from 'src/types';
import { PDFInfo, planetsDescription, UIGenerator } from '.';
import { getTitle } from '..';

export class UIGeneratorService implements UIGenerator {
  loadPlanetSvgByName(dir: string) {
    const directoryPath = path.resolve(
      __dirname,
      `../../../src/files/planets/${dir}.svg`,
    );
    return fs.readFileSync(directoryPath, 'utf-8');
  }
  loadSignSvgByName(dir: string) {
    const directoryPath = path.resolve(
      __dirname,
      `../../../src/files/signs_big/${dir}.svg`,
    );
    return fs.readFileSync(directoryPath, 'utf-8');
  }
  loadSvg(dir: string) {
    const directoryPath = path.resolve(__dirname, `../../../src/files/${dir}`);

    const svgFiles = fs
      .readdirSync(directoryPath)
      .filter((file) => file.endsWith('.svg'));

    const svgArray = svgFiles.map((fileName) => {
      const filePath = path.join(directoryPath, fileName);
      return fs.readFileSync(filePath, 'utf-8');
    });

    return svgArray;
  }
  loadSingleSvg(dir: string) {
    const directoryPath = path.resolve(
      __dirname,
      `../../../src/files/${dir}.svg`,
    );
    return fs.readFileSync(directoryPath, 'utf-8');
  }
  getPlanets(data: NatalChart): string {
    const formatDegrees = (degrees: number): string => {
      return `${Math.floor(degrees)}°`;
    };
    const changeName = {
      Medium_Coeli: 'MC',
      True_Node: 'North Node',
      Ascendant: 'Ascendant',
    };
    const allPlanets = Object.entries(data.data)
      .filter(
        ([_, obj]: [string, any]) =>
          obj && (obj.point_type === 'Planet' || changeName[obj.name]),
      )
      .map(([_, obj]) => obj)
      .filter((planet: any) =>
        fs.existsSync(
          path.join(
            __dirname,
            '../../../src/files/planets',
            `${changeName[planet.name] ? changeName[planet.name].replaceAll(' ', '_').toLowerCase() : planet.name.toLowerCase()}.svg`,
          ),
        ),
      );

    const midpoint = Math.ceil(allPlanets.length / 2);
    const firstHalf = allPlanets.slice(0, midpoint);
    const secondHalf = allPlanets.slice(midpoint);

    const renderList = (planets: any[]) => {
      return (
        `<ul class="planet-list">` +
        planets
          .map((planet: any) => {
            const icon = this.loadPlanetSvgByName(
              !changeName[planet.name]
                ? planet.name.toLowerCase()
                : changeName[planet.name].replaceAll(' ', '_').toLowerCase(),
            );
            return `<li><div class="planet-icon">${icon}</div> <span>${changeName[planet.name] ? changeName[planet.name] : planet.name} in</span> <span style="color:#CB8020;">${formatDegrees(planet.position)} ${planet.sign}</span></li>`;
          })
          .join('') +
        `</ul>`
      );
    };

    return renderList(firstHalf) + renderList(secondHalf);
  }

  createSvg(rawData: NatalChart) {
    try {
      const { data: natalData, aspects } = rawData;
      const width = 265;
      const height = 265;
      const radius = width / 2;
      const center = { x: radius, y: radius };

      const textRadius = radius - 13.56;
      const outerRingRadius = radius - 21;
      const innerRingRadius = radius - 42;

      const zodiacSigns = [
        'Aries',
        'Taurus',
        'Gemini',
        'Cancer',
        'Leo',
        'Virgo',
        'Libra',
        'Scorpio',
        'Sagittarius',
        'Capricorn',
        'Aquarius',
        'Pisces',
      ];

      const exceptions = ['Mean_Node', 'Medium_Coeli'];
      const normal = ['north_node', 'mc'];
      const exceptionsMap: Record<string, string> = Object.fromEntries(
        exceptions.map((e, i) => [e.toLowerCase(), normal[i]]),
      );

      const allowed_planets = [
        'Sun',
        'Moon',
        'Mercury',
        'Venus',
        'Mars',
        'Jupiter',
        'Saturn',
        'Uranus',
        'Neptune',
        'Pluto',
        'Chiron',
        'Ascendant',
        'Medium_Coeli',
        'Mean_Node',
      ];

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

      svg += `<circle cx="${center.x}" cy="${center.y}" r="${radius}" fill="#CB8020"/>`;

      svg += `<circle cx="${center.x}" cy="${center.y}" r="${outerRingRadius}" fill="#FFFFFF"/>`;
      svg += `<circle cx="${center.x}" cy="${center.y}" r="${innerRingRadius}" fill="#FFF7ED" stroke="#E4B77C" stroke-width="1" stroke-dasharray="3,2"/>`;

      svg += `
        <foreignObject x="0" y="0" width="${width}" height="${height}">
            <div xmlns="http://www.w3.org/1999/xhtml" style="position: relative; width: ${width}px; height: ${height}px;">
            ${[...Array(12).keys()]
              .map((i) => {
                const angle = i * 30;

                const isRightSide = Boolean(
                  angle >= 30 && angle != 90 && angle <= 150,
                );
                const adjustedHeight = isRightSide ? radius - 1 : radius;

                return `<div style="
                position: absolute;
                left: ${center.x}px;
                top: ${center.y - adjustedHeight}px;
                width: 0;
                height: ${adjustedHeight}px;
                border-left: 1px dashed #edc795;
                opacity: 0.8;
                transform: rotate(${angle}deg);
                transform-origin: bottom center;
                "></div>`;
              })
              .join('')}
            </div>
        </foreignObject>
        `;

      svg += `<circle cx="${center.x}" cy="${center.y}" r="5" fill="#FFF7ED"/>`;

      zodiacSigns.forEach((_, i) => {
        const angleFix = i === 11 ? 1.5 : 0;
        const startAngle = (i * 30 - 90) * (Math.PI / 180);
        const endAngle = ((i + 1) * 30 - 90 + angleFix) * (Math.PI / 180);

        const x1 = center.x + Math.cos(startAngle) * textRadius;
        const y1 = center.y + Math.sin(startAngle) * textRadius;
        const x2 = center.x + Math.cos(endAngle) * textRadius;
        const y2 = center.y + Math.sin(endAngle) * textRadius;

        const largeArcFlag = 0;
        const sweepFlag = 1;

        const pathId = `zodiacArc${i}`;
        const pathD = `M ${x1} ${y1} A ${textRadius} ${textRadius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;

        svg += `<path id="${pathId}" fill="none" stroke="none" d="${pathD}" />`;
      });

      zodiacSigns.forEach((sign, i) => {
        svg += `
            <text font-size="9.56" fill="#FFF9F1">
            <textPath href="#zodiacArc${i}" startOffset="50%" text-anchor="middle">${sign}</textPath>
            </text>
        `;
      });

      // --- Планети
      const planetPositions: Record<string, { x: number; y: number }> = {};

      const drawSubjectPlanets = (
        subjectData: Record<string, CelestialBody>,
        label: string,
        placement: 'inner' | 'ring',
      ) => {
        const usedAngles: number[] = [];

        Object.values(subjectData || {}).forEach((planet: CelestialBody) => {
          if (
            !planet ||
            typeof planet !== 'object' ||
            planet.abs_pos === undefined
          )
            return;
          if (!allowed_planets.includes(planet.name)) return;

          const rawName = planet.name?.toLowerCase();
          const actualName = exceptions.includes(planet.name)
            ? exceptionsMap[rawName]
            : rawName;

          const angleDeg = planet.abs_pos;
          const angleRad = ((angleDeg - 90) * Math.PI) / 180;

          // Знаходимо скільки планет близько по куту (±6 градусів)
          const nearby = usedAngles.filter((a) => Math.abs(a - angleDeg) < 6);
          const shiftIndex = nearby.length; // індекс для зсуву по радіусу
          usedAngles.push(angleDeg);

          const baseRadius = (radius - 19.7 + radius - 43.5) / 2; // базовий радіус для ring
          const baseRadiusInner = baseRadius - 15.92 * 2.5;
          let planetRadius = baseRadius;

          if (placement === 'ring') {
            // Зсув по радіусу, щоб не накладатись
            // Кожен наступний "близький" по куту зсувається на +15px назовні
            planetRadius = baseRadius + shiftIndex * 15;
          } else {
            // Для inner просто фіксований радіус (можна кастомізувати)
            planetRadius = baseRadiusInner - shiftIndex * 15;
          }

          const x = Math.cos(angleRad) * planetRadius + center.x;
          const y = Math.sin(angleRad) * planetRadius + center.y;

          const planetSvg = this.loadPlanetSvgByName(actualName) || '';

          svg += `
            <g transform="translate(${x}, ${y}) scale(0.58)">
                <g transform="translate(-7, -7)">
                    ${planetSvg}
                </g>
            </g>
        `;

          planetPositions[`${planet.name}_${label}`] = { x, y };
        });
      };

      drawSubjectPlanets(natalData.first_subject, '1', 'ring');
      drawSubjectPlanets(natalData.second_subject, '2', 'inner');

      // Аспекти
      if (Array.isArray(aspects)) {
        const lines: {
          x1: number;
          y1: number;
          x2: number;
          y2: number;
          color: string;
          stroke: number;
          zIndex: number;
        }[] = [];

        aspects.forEach(({ p1_name, p2_name, aspect }) => {
          const p1 =
            planetPositions[`${p1_name}_1`] || planetPositions[`${p1_name}_2`];
          const p2 =
            planetPositions[`${p2_name}_1`] || planetPositions[`${p2_name}_2`];
          if (p1 && p2) {
            // Менший offset (наприклад, 10) зсуває ближче до центру
            const offset = 28;
            const angle1 = Math.atan2(p1.y - center.y, p1.x - center.x);
            const angle2 = Math.atan2(p2.y - center.y, p2.x - center.x);

            // Зміщення координат вздовж напрямку до центру
            const x1f = p1.x - Math.cos(angle1) * offset;
            const y1f = p1.y - Math.sin(angle1) * offset;
            const x2f = p2.x - Math.cos(angle2) * offset;
            const y2f = p2.y - Math.sin(angle2) * offset;

            let color = '#E4B77C',
              stroke = 1,
              zIndex = 0;
            switch (aspect) {
              case 'trine':
                color = '#7CE483';
                stroke = 2;
                zIndex = 3;
                break;
              case 'square':
                color = '#EF3C25';
                stroke = 2;
                zIndex = 2;
                break;
              case 'opposition':
                color = '#E4B77C';
                stroke = 1;
                zIndex = 1;
                break;
              default:
                zIndex = 1;
            }

            lines.push({
              x1: x1f,
              y1: y1f,
              x2: x2f,
              y2: y2f,
              color,
              stroke,
              zIndex,
            });
          }
        });

        lines.sort((a, b) => a.zIndex - b.zIndex);

        lines.forEach(({ x1, y1, x2, y2, color, stroke }) => {
          svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-linecap="round" stroke-width="${stroke}"/>`;
        });
      }

      svg += `</svg>`;
      return svg;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  createSvgNatal(rawData: NatalChart) {
    try {
      const natalData = rawData.data;
      const aspects = rawData.aspects;
      const width = 950;
      const height = 950;
      const radius = width / 2;
      const center = { x: width / 2, y: height / 2 };

      let svgString = `<svg width="226" height="226" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

      // Фон
      svgString += `<circle cx="${center.x}" cy="${center.y}" r="${radius}" fill="#CB8020" stroke="none" stroke-width="3"/>`;

      // Радіус центрального білого кільця (було radius - 25)
      const baseWhiteRing = radius - 55;
      const whiteRingDiff = radius - baseWhiteRing;
      const adjustedWhiteRing = radius - whiteRingDiff * 1.2;

      // Малюємо кільця
      svgString += `<circle cx="${center.x}" cy="${center.y}" r="${adjustedWhiteRing}" fill="#FFFFFF" stroke="none" stroke-width="2"/>`;

      svgString += `
            <foreignObject x="0" y="0" width="${width}" height="${height}">
            <div xmlns="http://www.w3.org/1999/xhtml" style="position: relative; width: ${width}px; height: ${height}px;">
                ${Array.from({ length: 12 }, (_, i) => {
                  const angle = i * 30;
                  return `<div style="
                    position: absolute;
                    left: ${center.x}px;
                    top: ${center.y}px;
                    width: 0;
                    height: ${radius}px;
                    border-left: 1px solid #edc795;
                    opacity: 0.8;
                    transform: rotate(${angle}deg);
                    transform-origin: top center;
                "></div>`;
                }).join('')}
            </div>
            </foreignObject>
            `;
      svgString += `<circle cx="${center.x}" cy="${center.y}" r="${radius - 121}" fill="#FFFFFF" stroke="#E4B77C" stroke-width="1" 
            stroke-dasharray="3,2"/>`;

      const zodiacSigns = [
        { name: 'Virgo', emoji: '♈' },
        { name: 'Leo', emoji: '♉' },
        { name: 'Cancer', emoji: '♊' },
        { name: 'Gemini', emoji: '♋' },
        { name: 'Taurus', emoji: '♌' },
        { name: 'Aries', emoji: '♍' },
        { name: 'Pisces', emoji: '♎' },
        { name: 'Aquarius', emoji: '♏' },
        { name: 'Capricorn', emoji: '♐' },
        { name: 'Sagittarius', emoji: '♑' },
        { name: 'Scorpio', emoji: '♒' },
        { name: 'Libra', emoji: '♓' },
      ];

      svgString += `
            <foreignObject x="0" y="0" width="${width}" height="${height}">
            <div xmlns="http://www.w3.org/1999/xhtml" style="position: relative; width: ${width}px; height: ${height}px;">
                ${Array.from({ length: 12 }, (_, i) => {
                  const angle = i * 30 - 45;
                  const rad = angle * (Math.PI / 180);
                  const labelRadius = radius - 35;

                  const x = center.x + Math.cos(rad) * labelRadius;
                  const y = center.y + Math.sin(rad) * labelRadius;

                  return `
                    <div style="
                    position: absolute;
                    left: ${x}px;
                    top: ${y}px;
                    transform: translate(-50%, -50%) rotate(${angle + 90}deg);
                    transform-origin: center;
                    color: #FFF9F1;
                    font-size: 35px;
                    font-family: sans-serif;
                    white-space: nowrap;
                    ">
                    ${zodiacSigns[i].name}
                    </div>
                `;
                }).join('')}
            </div>
            </foreignObject>
            `;

      // console.log({ radius, center, svgString });

      // Планети
      const exceptions = ['Mean_Node'];
      const normal = ['north_node'];
      const exceptionsMap: Record<string, string> = Object.fromEntries(
        exceptions.map((exception, index) => [
          exception.toLowerCase(),
          normal[index],
        ]),
      );

      let planetPositions = {};
      const usedAngles: number[] = [];

      Object.values(natalData).forEach((planet: CelestialBody) => {
        if (
          planet &&
          typeof planet === 'object' &&
          planet.abs_pos !== undefined &&
          fs.existsSync(
            path.join(
              __dirname,
              '../../../src/files/planets',
              `${planet.name.toLowerCase()}.svg`,
            ),
          )
        ) {
          const angleDeg = planet.abs_pos;
          const angleRad = ((angleDeg - 90) * Math.PI) / 180;

          const nearby = usedAngles.filter((a) => Math.abs(a - angleDeg) < 6);
          const shiftIndex = nearby.length; // індекс для зсуву по радіусу
          usedAngles.push(angleDeg);

          const baseRadius = (radius - 75 + radius - 125) / 2;
          let planetRadius = baseRadius;
          planetRadius = baseRadius + shiftIndex * 2.5;

          const x = Math.cos(angleRad) * planetRadius + center.x;
          const y = Math.sin(angleRad) * planetRadius + center.y;
          const planetSvg =
            this.loadPlanetSvgByName(planet.name.toLowerCase()) || '';

          svgString += `
                        <g transform="translate(${x}, ${y}) scale(1.5)">
                            <g transform="translate(-7, -7)">
                                ${planetSvg}
                            </g>
                        </g>
                    `;

          planetPositions[planet.name] = { x, y };
        } else if (
          planet &&
          typeof planet === 'object' &&
          planet.abs_pos !== undefined &&
          exceptions.includes(planet.name)
        ) {
          const angleDeg = planet.abs_pos;
          const angleRad = ((angleDeg - 90) * Math.PI) / 180;

          const nearby = usedAngles.filter((a) => Math.abs(a - angleDeg) < 6);
          const shiftIndex = nearby.length; // індекс для зсуву по радіусу
          usedAngles.push(angleDeg);

          const baseRadius = (radius - 75 + radius - 125) / 2;
          let planetRadius = baseRadius;
          planetRadius = baseRadius + shiftIndex * 2.5;

          const x = Math.cos(angleRad) * planetRadius + center.x;
          const y = Math.sin(angleRad) * planetRadius + center.y;
          const planetSvg =
            this.loadPlanetSvgByName(
              exceptionsMap[planet.name.toLowerCase()],
            ) || '';

          svgString += `
                        <g transform="translate(${x}, ${y}) scale(1.5)">
                            <g transform="translate(-7, -7)">
                                ${planetSvg}
                            </g>
                        </g>
                    `;

          planetPositions[planet.name] = { x, y };
        }
      });

      if (aspects && Array.isArray(aspects)) {
        aspects.forEach(({ p1_name, p2_name }) => {
          if (planetPositions[p1_name] && planetPositions[p2_name]) {
            const { x: x1, y: y1 } = planetPositions[p1_name];
            const { x: x2, y: y2 } = planetPositions[p2_name];
            const offset = 12 * 2.1;
            const x1f = x1 + (x1 > center.x ? -offset : offset);
            const y1f = y1 + (y1 > center.y ? -offset : offset);
            const x2f = x2 + (x2 > center.x ? -offset : offset);
            const y2f = y2 + (y2 > center.y ? -offset : offset);

            svgString += `<line x1="${x1f}" y1="${y1f}" x2="${x2f}" y2="${y2f}" stroke="#E4B77C" stroke-width="1"/>`;
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

  loadStyles() {
    const stylePath = path.resolve(
      __dirname,
      `../../../src/files/style/index.css`,
    );
    const style = fs.readFileSync(stylePath, 'utf-8');
    const directoryPath = path.resolve(
      __dirname,
      `../../../src/files/style/pages`,
    );

    const cssFiles = fs
      .readdirSync(directoryPath)
      .filter((file) => file.endsWith('.css'));

    const cssArray = cssFiles.map((fileName) => {
      const filePath = path.join(directoryPath, fileName);
      return fs.readFileSync(filePath, 'utf-8');
    });
    return `
            <style>
                ${style}
                ${cssArray.join('\n')}
            </style>
        `;
  }
  async createPdfFile(body: PDFInfo) {
    try {
      console.log('Launching Puppeteer...');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      const formatter = DateTimeFormatter.ofPattern(
        "d MMM, yyyy 'at' hh:mm a",
      ).withLocale(Locale.ENGLISH);

      // -- Content -- //
      const twinsPath = path.join(__dirname, '../../../src/files/twins.svg');
      const twinsContent = fs.readFileSync(twinsPath, 'utf-8');

      const logoPath = path.join(__dirname, '../../../src/files/logo.svg');
      const logoContent = fs.readFileSync(logoPath, 'utf-8');

      const starsPath = path.join(__dirname, '../../../src/files/stars.svg');
      const starsContent = fs.readFileSync(starsPath, 'utf-8');

      const plusPath = path.join(__dirname, '../../../src/files/plus.svg');
      const plusContent = fs.readFileSync(plusPath, 'utf-8');

      const thunderPath = path.join(
        __dirname,
        '../../../src/files/thunder.svg',
      );
      const thunderContent = fs.readFileSync(thunderPath, 'utf-8');

      const calenderPath = path.join(
        __dirname,
        '../../../src/files/calender.svg',
      );
      const calenderContent = fs.readFileSync(calenderPath, 'utf-8');

      const chartIncreasePath = path.join(
        __dirname,
        '../../../src/files/chart-increase.svg',
      );
      const chartIncreaseContent = fs.readFileSync(chartIncreasePath, 'utf-8');

      const arrowsPath = path.join(__dirname, '../../../src/files/Arrows.svg');
      const arrowsContent = fs.readFileSync(arrowsPath, 'utf-8');

      const arrowPath = path.join(__dirname, '../../../src/files/Arrow.svg');
      const arrowContent = fs.readFileSync(arrowPath, 'utf-8');

      const importantPath = path.join(
        __dirname,
        '../../../src/files/Important.svg',
      );
      const importantContent = fs.readFileSync(importantPath, 'utf-8');
      // -- Content -- //

      // -- Styles -- //
      const styles = this.loadStyles();
      // -- Styles -- //

      // -- chart -- //
      const chart1 = this.createSvg(body.synastry);
      // -- chart -- //

      // -- Top -- //
      const topElement = (title: string) => {
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
      };
      // -- Top -- //
      // -- down -- //
      const downElement = (number: number) => {
        return `
                 <div class="bottom-element">
                     <div class="sub">
                         <div class="line"></div>
                     </div>
                     <h2 class="page-title-bottom">${number}</h2>
                     <div class="sub">
                         <div class="line"></div>
                     </div>
                 </div>
                 `;
      };
      // -- down -- //
      const match = body.match.match;
      // -- Page 1 -- //
      const date = new Date();
      const localDate = LocalDate.of(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
      );
      const systemZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const zone = ZoneId.of(systemZone);
      const zdt = ZonedDateTime.now(zone);

      const offset = zdt.offset().toString();

      const formattedOffset = offset.replace(':00', '');
      const utc = `UTC${formattedOffset}`;
      const formatted =
        localDate.dayOfMonth() +
        ' ' +
        localDate.month().toString().charAt(0) +
        localDate.month().toString().slice(1).toLowerCase() +
        ' ' +
        ' ' +
        localDate.year();
      const page1 = `
            <div class="p1">
                <div class="p1-content">
                        <div class="logo">${logoContent}</div>
                        <div class="p1-content-text">
                            <h2 class="p1-content-subtitle">Generated on ${formatted} · Tropical · ${utc}</h2>
                            <h1 class="p1-content-title">Personalized Synastry Chart <br /> for ${body.name1} & ${body.name2}</h1>
                        </div>
                        <div class="p1-match">
                            Cosmic Match: ${match} %
                        </div>
                        <div class="p1-twins">
                            ${twinsContent}
                        </div>
                        <div class="p1-content-under">
                            <p class="p1-content-under-text">Explore the emotional, romantic, and cosmic <br /> energy that binds your relationship.</p>
                        </div>
                        <div class="p1-footer">
                            <p class="p1-footer-text">
                                Every relationship tells a cosmic story. Here’s what the stars say<br /> about yours.
                            </p>
                        </div>
                        <div class="p1-cards">
                            <div class="p1-cards-card">
                                <div class="p1-cards-card-icon">${thunderContent}</div>
                                <p class="p1-cards-card-text">3 strongest<br /> aspects</p>
                            </div>
                            <div class="p1-cards-card">
                                <div class="p1-cards-card-icon">${chartIncreaseContent}</div>
                                <p class="p1-cards-card-text">2 growth<br /> areas</p>
                            </div>
                            <div class="p1-cards-card">
                                <div class="p1-cards-card-icon">${calenderContent}</div>
                                <p class="p1-cards-card-text">7-day action<br /> plan inside</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="page-break"></div>
            `;
      // -- Page 1 -- //
      const signsSvg = this.loadSvg('signs');
      const planetsSvg = this.loadSvg('planets');
      const signNames = [
        'aries',
        'taurus',
        'gemini',
        'cancer',
        'leo',
        'virgo',
        'libra',
        'scorpio',
        'sagittarius',
        'carpicorn',
        'aquarius',
        'pisces',
      ];
      const planetNames = [
        'sun',
        'moon',
        'mercury',
        'venus',
        'mars',
        'jupiter',
        'saturn',
        'uranus',
        'neptune',
        'pluto',
        'chiron',
        'ascendant',
        'mc',
        'north node',
      ];
      const renderSignList = () => {
        let groupedList: string = '';

        for (let i = 0; i < signNames.length; i += 2) {
          const item1 = signNames[i];
          const svg1 = this.loadSingleSvg(`signs/${item1}`);
          let pair = `
                        <li class="text-right"><div class="text-right-svg">${svg1}</div> <span>${item1.toUpperCase()}</span></li>
                    `;
          if (i + 1 < signNames.length) {
            const item2 = signNames[i + 1];
            const svg2 = this.loadSingleSvg(`signs/${item2}`);
            pair += `
                            <li class="text-right"><div class="text-right-svg">${svg2}</div> <span>${item2.toUpperCase()}</span></li>
                        `;
          }

          // Обгортаємо пару у <ul>
          groupedList += `<ul class="signs-pair">${pair}</ul>`;
        }

        return `<ul class="p2-symbols-list">${groupedList}</ul>`;
      };

      const renderPlanetList = () => {
        let groupedList: string = '';

        for (let i = 0; i < planetNames.length; i += 3) {
          let group = '';

          for (let j = 0; j < 3; j++) {
            const item = planetNames[i + j];
            if (!item) break;
            const svg = this.loadSingleSvg(
              `planets/${item.replaceAll(' ', '_')}`,
            );
            group += `
                            <li>${svg} <span class="text-left">${item.toUpperCase()}</span></li>
                        `;
          }

          groupedList += `<ul class="signs-pair">${group}</ul>`;
        }

        return `<ul class="p2-symbols-list">${groupedList}</ul>`;
      };
      // -- Page 3 -- //
      const infoIcon = this.loadSingleSvg('Info');
      const formDate = (date: string): string => {
        const localDate = ZonedDateTime.parse(date).withZoneSameInstant(
          ZoneId.of('UTC'),
        );

        const month =
          localDate.month().toString().charAt(0) +
          localDate.month().toString().slice(1).toLowerCase();
        const day = localDate.dayOfMonth();
        const year = localDate.year();

        const hour = localDate.hour().toString().padStart(2, '0');
        const minute = localDate.minute().toString().padStart(2, '0');

        return `${month} ${day}, ${year} at ${hour}:${minute}`;
      };
      const page3 = `
                <div class="p2 parent-container">
                    ${topElement('Synastry Chart')}
                    <div class="p2-content content-container">
                        <div class="p2-chart">
                            <div class="p2-text p2-start">
                                <p>
                                    Synastry is a branch of astrology<br /> that compares the <b>birth charts of<br /> two people.</b>
                                    It examines how the<br /> planetary positions at the time of<br /> birth interact between partners.
                                </p>
                                <p>
                                    We overlay your charts to<br /> highlight key points such as the<br /> Sun, Moon, and Ascendant.
                                    These<br /> markers reveal core <b>personality<br /> traits and relationship energies.</b>
                                </p>
                                <p>
                                    Synastry transforms complex<br /> astrological data into <b>clear<br /> insights</b> you can use.
                                </p>
                            </div>
                            <div class="p2-chart-img">${chart1}</div>
                        </div>
                        <div class="p2-userinfo">
                            <div class="p2-users">
                                <div class="p2-user">
                                    <div class="p2-content-name">${body.name1}</div>
                                    <span class="p2-user-text">${formDate(body.birthDate1)}<br />${body.birthPlace1}</span>
                                </div>
                                <div class="p2-plus">
                                    ${plusContent}
                                </div>
                                <div class="p2-user">
                                    <div class="p2-content-name">${body.name2}</div>
                                    <span class="p2-user-text">${formDate(body.birthDate2)}<br />${body.birthPlace2}</span>
                                </div>
                            </div>
                            <div class="p2-userinfo-content">
                                <div class="p2-userinfo-content-text">
                                    <div class="stars-flex">
                                        ${starsContent}
                                        ${starsContent}
                                        ${starsContent}
                                    </div>
                                    <span>Cosmic Match: ${match} %</span>
                                    <p><b>A single number can’t</b> capture every nuance of two<br /> hearts, yet it offers a powerful <b>starting point.</b> </p>
                                </div>
                                <div class="p2-userinfo-content-line">
                                    <p class="p3-bordertext p2-userinfo-content-line-el">
                                        Scores <b>closer to 100 %</b> signal an effortless flow—<br />shared values, complementary rhythms,
                                        a sense that<br /> you “just get” one another.
                                    </p>
                                    <p class="p3-bordertext p2-userinfo-content-line-el">
                                        <b>Lower scores highlight</b> areas where growth, patience<br /> and open conversation turn sparks
                                        of friction into<br /> sparks of insight.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="p2-legend">
                            <p class="p2-text p2-end">
                                ${infoIcon} The legend below decodes each sign and planet, helping you see where your energies align or clash.
                            </p>
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
                        </div>
                    </div>
                    ${downElement(3)}
                </div>
                <div class="page-break"></div>
            `;
      // -- Page 3 -- //
      // -- Page 2 -- //
      const sunIcon = this.loadSingleSvg('page2/sun');
      const moonIcon = this.loadSingleSvg('page2/moon');
      const venusIcon = this.loadSingleSvg('page2/venus');
      const marsIcon = this.loadSingleSvg('page2/mars');
      const mercuryIcon = this.loadSingleSvg('page2/mercury');
      const heartIcon = this.loadSingleSvg('page2/heart');
      const familyIcon = this.loadSingleSvg('page2/family');
      const calenderIcon = this.loadSingleSvg('page2/calender');
      const chartIcon = this.loadSingleSvg('page2/chart');
      const page2 = `
                <div class="p3 parent-container">
                    ${topElement('What is Synastry?')}
                    <div class="p3-content content-container">
                        <div class="p3-inline">
                            <p class="p3-text p3-text-width">
                                Synastry is the astrological practice of <b>overlaying two natal charts</b> to<br /> see where the planetary
                                “wiring” of one person plugs into the wiring of<br /> another. Instead of asking “Are Cancer and Leo
                                compatible?” in the<br /> abstract, synastry looks at the <b>exact degree, sign and house</b> of each<br /> planet
                                for <b>both</b> partners and measures the angles (aspects) between<br /> them.
                            </p>
                            <p class="p3-bordertext p3-bordertext-width">
                                It is astronomy-accurate<br /> (using real ephemeris data),
                                but<br /> psychology-oriented (exploring how those<br /> sky patterns
                                feel in daily life).
                            </p>
                        </div>
                        <div class="text-block p3-flex">
                            <div class="p3-flex-el">
                                <p class="p3-bordertext p3-bordertext-title">
                                    <b>How We Compare</b>
                                </p>
                            <ul class="text-block-list p3-list">
                            <li>
                                <div class="p3-list-row">
                                <div class="p3-list-left">
                                    <div class="text-block-list-planets">
                                    ${sunIcon} <span>Sun</span> ${arrowsContent} ${moonIcon} <span>Moon</span>
                                    </div>
                                    <div class="p3-list-description"> – core identity vs. emotional needs</div>
                                </div>
                                <div class="p3-arrow">${arrowContent}</div>
                                </div>
                            </li>
                            <li>
                                <div class="p3-list-row">
                                <div class="p3-list-left">
                                    <div class="text-block-list-planets">
                                    ${venusIcon} <span>Venus</span> ${arrowsContent} ${marsIcon} <span>Mars</span>
                                    </div>
                                    <div class="p3-list-description"> – love style vs. passion drive</div>
                                </div>
                                <div class="p3-arrow">${arrowContent}</div>
                                </div>
                            </li>
                            <li>
                                <div class="p3-list-row">
                                <div class="p3-list-left">
                                    <div class="text-block-list-planets">
                                    ${mercuryIcon} <span>Mercury aspects</span>
                                    </div>
                                    <div class="p3-list-description"> – thinking & talk patterns</div>
                                </div>
                                <div class="p3-arrow">${arrowContent}</div>
                                </div>
                            </li>
                            <li>
                                <div class="p3-list-row">
                                <div class="p3-list-left">
                                    <div class="text-block-list-planets">
                                    <span>Outer-planet links</span>
                                    </div>
                                    <div class="p3-list-description"> – Saturn, Uranus, Neptune, Pluto</div>
                                </div>
                                <div class="p3-arrow">${arrowContent}</div>
                                </div>
                            </li>
                            </ul>
                            </div>
                            <div class="p3-flex-el">
                                <p class="p3-bordertext p3-bordertext-title">
                                    <b>What It Tells You</b>
                                </p>
                                <ul class="text-block-list p3-list">
                                    <li>
                                        <div class="p3-list-row">
                                        <div class="p3-list-left">
                                            <div class="p3-list-description">Do you energise or drain each other emotionally?</div>
                                        </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="p3-list-row">
                                        <div class="p3-list-left">
                                            <div class="p3-list-description">Where chemistry sparks – and where it overheats.</div>
                                        </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="p3-list-row">
                                        <div class="p3-list-left">
                                            <div class="p3-list-description">How to prevent “lost-in-translation” moments.</div>
                                        </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="p3-list-row">
                                        <div class="p3-list-left">
                                            <div class="p3-list-description">Long-term lessons, sudden twists, soulful growth.</div>
                                        </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="p3-info">
                            ${importantContent}
                            <div class="p3-info-text">
                                <p class="p3-info-text-title"><b>Important:</b> Synastry <b>does not decree fate.</b></p>
                                <p class="p3-info-text-sub">Remember, astrology is a tool for self-reflection. </p>
                            </div>
                        </div>
                        <h2 class="p3-title">The Purpose of Your Report</h2>
                        <p class="p3-text p3-subtext">
                            <b>Your PDF is a roadmap, not a rulebook.</b> Its single aim is to turn dozens of raw coordinates into clear,<br /> practical guidance you can use tonight at dinner or ten years from now.
                        </p>
                        <div class="text-block">
                            <span class="text-block-title">
                                Inside you will find:
                            </span>
                            <ul class="text-block-list p3-list-flex">
                                <li>
                                    <div class="p3-list-flex-top">${heartIcon} Top 3 Harmonies</div>
                                    <p class="p3-list-flex-text">
                                        – the planetary links that<br /> make your bond feel<br /> effortless.
                                    </p>
                                </li>
                                <li>
                                    <div class="p3-list-flex-top">${familyIcon} Top 3 Friction Points</div>
                                    <p class="p3-list-flex-text">
                                        – where sparks can inspire<br /> growth or start fires.
                                    </p>
                                </li>
                                <li>
                                    <div class="p3-list-flex-top">${calenderIcon} 7-Day Action Plan</div>
                                    <p class="p3-list-flex-text">
                                        - one small, concrete step<br /> per day to anchor insights<br /> into behaviour.
                                    </p>
                                </li>
                                <li>
                                    <div class="p3-list-flex-top">${chartIcon} Growth Forecast</div>
                                    <p class="p3-list-flex-text">
                                        – how upcoming transits<br /> may amplify (or ease)<br /> current patterns over the<br /> next 12 months.
                                    </p>
                                </li>
                            </ul>
                        </div>
                        <div class="text-block">
                            <span class="text-block-title">
                                How to work with it:
                            </span>
                            <ul class="text-block-list p3-list-flex">
                                <li>
                                    <div class="p11-arcadeon-text p3-arcadeon">
                                        <h3>1</h3>
                                        <p><b>Scan the icons</b> and colour bars first – they tell<br /> the story faster than words.</p>
                                    </div>
                                    <div class="p11-arcadeon-text p3-arcadeon">
                                        <h3>3</h3>
                                        <p><b>Choose one recommendation</b> (not five) to test<br /> for a whole week; real change loves focus.</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="p11-arcadeon-text p3-arcadeon">
                                        <h3>2</h3>
                                        <p><b>Read your partner’s column</b> before your own;<br /> empathy rises when you start on their side.</p>
                                    </div>
                                    <div class="p11-arcadeon-text p3-arcadeon">
                                        <h3>4</h3>
                                        <p><b>Revisit the report monthly.</b><br /> Planetary cycles breathe; what feels minor today<br /> can become major at the next family holiday.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="p3-end">
                            <div class="text-block p3-end-block">
                                <span class="text-block-title">
                                    Quick-Glance Benefits
                                </span>
                                <ul class="text-block-list p3-end-list">
                                    <li>
                                        <span class="p3-end-title">Clarity:</span>
                                        <p class="p3-end-text">
                                            Know why certain<br /> patterns keep<br /> repeating.
                                        </p>
                                    </li>
                                    <li>
                                        <span class="p3-end-title">Communication:</span>
                                        <p class="p3-end-text">
                                            Swap guesswork for shared<br /> vocabulary (“That’s our<br /> Moon-Saturn thing – let’s<br /> time out”).
                                        </p>
                                    </li>
                                    <li>
                                        <span class="p3-end-title">Confidence:</span>
                                        <p class="p3-end-text">
                                            Use the Action Plan<br /> to turn insights into<br /> habits.
                                        </p>
                                    </li>
                                </ul>
                            </div>
                            <div class="p3-end-info">
                                <span class="p3-end-info-title">
                                    Your relationship is the captain;<br /> these pages are only the star<br /> map.
                                </span>
                                <div class="stars-flex">
                                    ${starsContent}
                                    ${starsContent}
                                    ${starsContent}
                                </div>
                                <p class="p3-end-info-text">
                                    Navigate boldly, adjust the sails often,<br /> and enjoy the voyage together.
                                </p>
                            </div>
                        </div>
                    </div>
                    ${downElement(2)}
                </div>
                <div class="page-break"></div>
            `;
      // -- Page 2 -- //
      // -- Page 4 -- //
      const iconCage = this.loadSingleSvg('logos/cage');
      const iconGeo = this.loadSingleSvg('logos/geo');
      const iconNasa = this.loadSingleSvg('logos/nasa');
      const iconAstro = this.loadSingleSvg('logos/Astrologer');
      const iconSwiss = this.loadSingleSvg('logos/swiss');
      const iconSwiss_orange = this.loadSingleSvg('logos/swiss_orange');
      const page4 = `
                <div class="p4 parent-container">
                    ${topElement('Methodology')}
                    <div class="p4-content content-container">
                        <p class="p3-text">
                            Creating your personalized synastry report involves a careful blend of precise astronomical
                            data and expert astrological<br /> interpretation. Here’s how we ensure your reading is <b>accurate,
                            meaningful, and practical.</b>
                        </p>
                        <h2 class="p3-title p4-title">Data Collection</h2>
                        <div class="text-block">
                            <span class="text-block-title">
                                What and why we need it:
                            </span>
                            <div class="p2-userinfo-content-line">
                                <div class="p3-bordertext p2-userinfo-content-line-el p4-bordertext">
                                    <span>1. Date & Exact Time</span>
                                    <p>Planet positions change every minute; even a 4-<br />minute shift can move the Ascendant to the next<br /> sign.</p>
                                    <div class="p4-bordertext-info">${infoIcon} <span>Check a <b>birth certificate or hospital record</b> when<br /> possible.</span></div>
                                </div>
                                <div class="p3-bordertext p2-userinfo-content-line-el p4-bordertext">
                                    <span>2. Birth City & Country</span>
                                    <p>Converts local time to Universal Time and pins the chart<br /> on Earth’s longitude/latitude grid.</p>
                                    <div class="p4-bordertext-info">${infoIcon} <span>Use the <b>city of birth,</b> not the city where you grew<br /> up.</span></div>
                                </div>
                            </div>
                            <div class="p4-info">${importantContent} <span><b>For maximum accuracy,</b> we recommend using birth times sourced from official records when possible.</span></div>
                        </div>
                        <h2 class="p3-title p4-title">Computation Pipeline</h2>
                        <div class="text-block">
                            <span class="text-block-title">
                                How to work with it:
                            </span>
                            <div class="p2-userinfo-content-line">
                                <div class="p4-card">
                                    <div class="p4-card-top">
                                        <span class="p4-card-top-num">1</span>
                                        <span class="p4-card-top-text">Coordinate Lookup <span class="p4-card-top-icons">${iconCage} ${iconGeo}</span></span>
                                    </div>
                                    <p>Our engine queries <b>OpenCage</b> and <b>GeoNames Atlas</b><br /> to fetch precise 
                                    latitude/longitude and time-zone<br /> offsets for each birthplace
                                    (accuracy ≈ approximately<br /> ±30 meters).</p>
                                </div>
                                <div class="p4-card">
                                    <div class="p4-card-top">
                                        <span class="p4-card-top-num">2</span>
                                        <span class="p4-card-top-text"><span class="p4-card-top-text-title">Planetary Calculation</span> <span class="p4-card-top-icons">${iconSwiss_orange} ${iconNasa}</span></span>
                                    </div>
                                    <p>Using the <b>Swiss Ephemeris (Astrodienst)</b> and <b>NASA<br /> JPL Horizons data,</b>
                                    we calculate the actual geocentric<br /> positions of 10 planets, Chiron,
                                    the Lunar Nodes, and<br /> key angles for the exact second you were born.</p>
                                </div>
                            </div>
                            <div class="p2-userinfo-content-line">
                                <div class="p4-card">
                                    <div class="p4-card-top">
                                        <span class="p4-card-top-num">3</span>
                                        <span class="p4-card-top-text">Chart Overlay</span>
                                    </div>
                                    <p>Two natal charts are <b>merged,</b> and every major aspect<br /> (0°, 60°, 90°, 120°, 180°) is measured
                                    with orbs to the<br /> nearest <b>0.01°.</b></p>
                                </div>
                                <div class="p4-card">
                                    <div class="p4-card-top">
                                        <span class="p4-card-top-num">4</span>
                                        <span class="p4-card-top-text">Scoring Algorithm</span>
                                    </div>
                                    <p>Harmonious aspects add points, challenging ones<br /> subtract.
                                    Scores are weighted: ${sunIcon}/${moonIcon} = 3 ×, ${venusIcon}/${marsIcon} = 2 ×,<br />outer planets = 1×.
                                    The result is used to calculate the<br /> <b>Compatibility % shown on the first page.</b></p>
                                </div>
                            </div>
                            <div class="p2-userinfo-content-line">
                                <div class="p4-card">
                                    <div class="p4-card-top">
                                        <span class="p4-card-top-num">5</span>
                                        <span class="p4-card-top-text">Natural-Language Layer</span>
                                    </div>
                                    <p>Our AstroSynth engine translates the raw aspects into understandable <b>human language.</b>
                                    It explains, in simple<br /> terms, all the meanings and terms related
                                    to the relationship between you that the <b>stars are talking about.</b></p>
                                </div>
                            </div>
                        </div>
                        <h2 class="p3-title p4-title">Trusted Data Sources</h2>
                        <div class="p2-userinfo-content-line p4-cards">
                            <div class="p4-cards-card">
                                <div class="p4-cards-card-top">${iconSwiss}</div>
                                <p>High-precision planetary<br /> ephemeris (0.1″ arc<br /> accuracy)</p>
                            </div>
                            <div class="p4-cards-card">
                                <div class="p4-cards-card-top">${iconNasa}</div>
                                <p>Retrograde status &<br /> moon nodes validation</p>
                            </div>
                            <div class="p4-cards-card">
                                <div class="p4-cards-card-top">${iconCage} ${iconGeo}</div>
                                <p>Birth-place coordinates<br /> & time-zone history</p>
                            </div>
                            <div class="p4-cards-card">
                                <div class="p4-cards-card-top">${iconAstro} Astrology-API Wrapper</div>
                                <p>A unified API layer that<br /> aggregates the above<br /> services</p>
                            </div>
                        </div>
                        <div class="p2-userinfo-content-line p4-end-block">
                            <div>
                                <ul class="p4-list">
                                    <li><span><b>Double-blind checksum</b> – every chart is computed twice<br /> (different libraries); results must match within 0.05°.</span></li>
                                </ul>
                                <ul class="p4-list p4-list-last">
                                    <li><span><b>TZ Database v2025a</b> – ensures historic DST shifts are<br /> applied correctly.</span></li>
                                </ul>
                            </div>
                            <div class="p4-end">
                                Astrology is a <b>reflective tool,</b> not a deterministic<br /> verdict.
                                Personal free will and context always override<br /> celestial suggestions.
                            </div>
                        </div>
                    </div>
                    ${downElement(4)}
                </div>
                <div class="page-break"></div>
            `;
      // -- Page 4 -- //
      // const rawInfoPath = path.join(__dirname, "../../../src/files/mocs/zodiac_signs.json");
      // const rawInfo = JSON.parse(fs.readFileSync(rawInfoPath, 'utf-8'));
      const natal1 = this.createSvgNatal(body.natal1);
      const natal2 = this.createSvgNatal(body.natal2);
      const planetsList1 = this.getPlanets(body.natal1);
      const planetsList2 = this.getPlanets(body.natal2);
      const renderZodiacInfo = (birthDate: string) => {
        const data = body.zodiac_signs;
        const date = ZonedDateTime.parse(birthDate).withZoneSameInstant(
          ZoneId.of('UTC'),
        );
        const day = date.dayOfMonth();
        const month = date.monthValue();

        const element = data.find((item) => {
          const range1 = item.date_range.range1;
          const range2 = item.date_range.range2;

          if (range1.month <= range2.month) {
            return (
              (month > range1.month ||
                (month === range1.month && day >= range1.day)) &&
              (month < range2.month ||
                (month === range2.month && day <= range2.day))
            );
          } else {
            return (
              month > range1.month ||
              (month === range1.month && day >= range1.day) ||
              month < range2.month ||
              (month === range2.month && day <= range2.day)
            );
          }
        });
        if (!element) throw new Error('Zodiac sign was not found');
        const signContent = this.loadSignSvgByName(element.Sign);
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        const { date_range, Sign, ...otherData } = element;
        let form = '';
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
      };
      // -- Page 5 -- //
      const page5 = `
                <div class="p5 parent-container">
                    ${topElement('Individual Natal Charts')}
                    <div class="p5-content content-container">
                        <p class="p3-text">
                            This section focuses on your <b>unique</b> astrological blueprint.
                            Each partner receives an <b>individual natal chart.</b> The chart
                            is a<br /> snapshot of the sky at the exact moment of your birth. 
                        </p>
                        <p class="p3-text p5-text">
                            It shows the position of key planets. We focus
                            on three core elements: the Sun, Moon, and Ascendant signs.
                            <b>These markers<br /> reveal essential aspects of your personality.</b>
                        </p>
                        <div class="p5-natal">
                            <div class="p5-section">
                                <div class="p5-natal-chart">
                                    ${natal1}
                                </div>
                                <span class="p5-natal-title title-absolute">${body.name1}’s Chart and Planets</span>
                                <div class="planet-lists-container">${planetsList1}</div>
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
                    ${topElement('Individual Natal Charts')}
                    <div class="p5-content content-container">
                        <p class="p3-text">
                            This section focuses on your <b>unique</b> astrological blueprint.
                            Each partner receives an <b>individual natal chart.</b> The chart
                            is a<br /> snapshot of the sky at the exact moment of your birth. 
                        </p>
                        <p class="p3-text p5-text">
                            It shows the position of key planets. We focus
                            on three core elements: the Sun, Moon, and Ascendant signs.
                            <b>These markers<br /> reveal essential aspects of your personality.</b>
                        </p>
                        <div class="p5-natal">
                            <div class="p5-section">
                                <div class="p5-natal-chart">
                                    ${natal2}
                                </div>
                                <span class="p5-natal-title title-absolute">${body.name2}’s Chart and Planets</span>
                                <div class="planet-lists-container">${planetsList2}</div>
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
        let listItems = planetsDescription
          .map((item) => {
            const svg = this.loadSingleSvg(
              `planets/${item.planet.replaceAll(' ', '_').replaceAll('midheaven', 'mc')}`,
            );
            return `
            <li class="p7-card">
                <div class="p7-bl-top">
                    ${svg} 
                    <span class="p7-bl-text">${item.planet} 
                        <p>${item.title}</p>
                    </span>
                </div>
                <p>${item.description}</p>
            </li>
        `;
          })
          .join('');

        return `<ul class="p7-grid">${listItems}</ul>`;
      };

      // -- Page 7 -- //
      const page7 = `
                <div class="p7 parent-container">
                ${topElement('How to Read Your Synastry Chart')}
                    <div class="p7-content content-container">
                        <p class="p3-text">
                            Your synastry chart compares how the planets in your chart
                            interact with your partner’s. These planetary “aspects”<br /> describe
                            <b>how your energies blend</b> – or challenge each other – across different parts of life.
                        </p>
                        <p class="p3-text p5-text">
                            Below is a quick guide to what each planet symbolizes in relationship astrology.
                            This will <b>help you better understand</b> the<br /> meanings behind the interactions described in your report.
                        </p>
                        <div class="p7-blocks">
                            ${renderPlanetListwithText()}
                        </div>
                        <h2 class="p3-title p4-title">How Aspects Work</h2>
                        <p class="p3-text p7-text">Each planetary pair in your report is connected by a specific aspect – <b>the angular relationship between the two planets.</b></p>
                        <div class="text-block p7-textblock">
                            <div class="p7-block">
                                <span class="text-block-title">
                                    Common types include:
                                </span>
                                <p>Your report interprets these<br /> aspects in plain language,<br />
                                highlighting how they affect<br /> your emotions, attraction,<br />
                                communication, and shared<br /> path.</p>
                            </div>
                            <div class="p7-cards">
                                <div class="p7-cards-line">
                                    <div class="p7-cards-card">
                                        <span>Conjunction (0°)</span>
                                        <p>Strong alignment, shared<br /> energy</p>
                                    </div>
                                    <div class="p7-cards-card">
                                        <span>Trine (120°)</span>
                                        <p>Harmonious flow,<br /> easy compatibility</p>
                                    </div>
                                    <div class="p7-cards-card">
                                        <span>Square (90°)</span>
                                        <p>Tension, challenge, growth<br /> potential</p>
                                    </div>
                                </div>
                                <div class="p7-cards-line">
                                    <div class="p7-cards-card">
                                        <span>Opposition (180°)</span>
                                        <p>Complementary or<br /> conflicting forces</p>
                                    </div>
                                    <div class="p7-cards-card">
                                        <span>Quintile / Sextile (72° / 60°)</span>
                                        <p>Creative synergy or<br /> support</p>
                                    </div>
                                    <div class="p7-cards-card">
                                        <span>Wide Orb (>8°)</span>
                                        <p>Influence exists but may<br /> be subtle</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="p7-end">
                            <div class="p7-end-pink">Every planetary aspect adds a brushstroke to your<br /> shared portrait. Some create instant harmony. Others<br /> invite growth through contrast.</div>
                            <div class="p7-end-orange">Together, they form a complete picture of how your<br /> souls interact across time and space.<br /> Let’s explore it.</div>
                        </div>
                    </div>
                    ${downElement(7)}
                </div>
                <div class="page-break"></div>
            `;
      // -- Page 7 -- //
      const socialSvg = this.loadSvg('social');
      const renderSocial = () => {
        let str: string = '';

        socialSvg.map((svg) => {
          str += `<div>${svg}</div>`;
        });

        return str;
      };
      // -- Page 8 -- //
      const lang = body.lang;
      const circumference = 2 * Math.PI * 71;
      const percentDisMatchp8 = circumference - (match / 100) * circumference;
      const p8Ring = `
                <svg width="168" height="168" viewBox="0 0 168 168">
                    <!-- Фонове коло -->
                    <circle
                    cx="84"
                    cy="84"
                    r="71"
                    stroke="#FFF9F1"
                    stroke-width="26"
                    fill="none"
                    />

                    <!-- Прогрес -->
                    <circle
                    class="progress-ring"
                    cx="84"
                    cy="84"
                    r="71"
                    stroke="#679E26"
                    stroke-width="26"
                    fill="none"
                    stroke-linecap="round"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${percentDisMatchp8}"
                    transform="rotate(90 84 84)"
                    />
                </svg>
            `;
      const promptP8 = body.pages[0];
      const page8 = `
                <div class="p8 parent-container">
                    ${topElement(`${getTitle[lang].p8.title[0]}`)}
                    <div class="p8-content content-container">
                        <div class="p9-chart-wrapper">
                            <div class="p9-chart-wrapper-labels">
                                <div class="p9-chart-wrapper-labels-label">${getTitle[lang].p8.labels[0]}</div>
                                <div class="p9-chart-wrapper-labels-label">${getTitle[lang].p8.labels[1]}</div>
                                <div class="p9-chart-wrapper-labels-label">${getTitle[lang].p8.labels[2]}</div>
                            </div>
                            <div class="p9-chart-wrapper-chart">
                                <div class="p9-chart-wrapper-chart-svg">
                                    ${p8Ring}
                                    <span>${getTitle[lang].p8.match}<br /> ${match} %</span>
                                </div>
                            </div>
                        </div>
                        <div class="p8-cards">
                            <div class="p8-cards-card">
                                <div class="p8-cards-card-top">
                                    <span>${promptP8.planets[0].label}</span>
                                </div>
                                <div class="p8-cards-card-content">
                                    <div class="p8-cards-card-content-text">
                                        <p>${promptP8.planets[0].description[0] ? promptP8.planets[0].description[0] : ''}</p>
                                        <p>${promptP8.planets[0].description[1] ? promptP8.planets[0].description[1] : ''}</p>
                                        <p>${promptP8.planets[0].description[2] ? promptP8.planets[0].description[2] : ''}</p>
                                    </div>
                                    <div class="p8-cards-card-content-info">
                                        <div class="p8-cards-card-content-info-el">
                                            <div class="p8-cards-card-content-info-el-title">${calenderContent} <span>${getTitle[lang].p8.info_labels[0]}</span></div>
                                            <p>${promptP8.planets[0].daily_signal}</p>
                                        </div>
                                        <div class="p8-cards-card-content-info-el">
                                            <div class="p8-cards-card-content-info-el-title">${thunderContent} <span>${getTitle[lang].p8.info_labels[1]}</span></div>
                                            <p>${promptP8.planets[0].micro_booster}</p>
                                        </div>
                                        <div class="p8-cards-card-content-info-el">
                                            <div class="p8-cards-card-content-info-el-title">${chartIncreaseContent} <span>${getTitle[lang].p8.info_labels[2]}</span></div>
                                            <p>${promptP8.planets[0].strength_line}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="p8-cards-card">
                                <div class="p8-cards-card-top">
                                    <span>${promptP8.planets[1].label}</span>
                                </div>
                                <div class="p8-cards-card-content">
                                    <div class="p8-cards-card-content-text">
                                        <p>${promptP8.planets[1].description[0] ? promptP8.planets[1].description[0] : ''}</p>
                                        <p>${promptP8.planets[1].description[1] ? promptP8.planets[1].description[1] : ''}</p>
                                        <p>${promptP8.planets[1].description[2] ? promptP8.planets[1].description[2] : ''}</p>
                                    </div>
                                    <div class="p8-cards-card-content-info">
                                        <div class="p8-cards-card-content-info-el">
                                            <div class="p8-cards-card-content-info-el-title">${calenderContent} <span>${getTitle[lang].p8.info_labels[0]}</span></div>
                                            <p>${promptP8.planets[1].daily_signal}</p>
                                        </div>
                                        <div class="p8-cards-card-content-info-el">
                                            <div class="p8-cards-card-content-info-el-title">${thunderContent} <span>${getTitle[lang].p8.info_labels[1]}</span></div>
                                            <p>${promptP8.planets[1].micro_booster}</p>
                                        </div>
                                        <div class="p8-cards-card-content-info-el">
                                            <div class="p8-cards-card-content-info-el-title">${chartIncreaseContent} <span>${getTitle[lang].p8.info_labels[2]}</span></div>
                                            <p>${promptP8.planets[1].strength_line}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="p8-last-card">
                            <div class="p8-last-card-top">
                                <span>${promptP8.planets[2].label}</span>
                            </div>
                            <div class="p8-last-card-content">
                                <div class="p8-last-card-content-text">
                                    <p>${promptP8.planets[2].description[0] ? promptP8.planets[2].description[0] : ''}</p>
                                    <p>${promptP8.planets[2].description[1] ? promptP8.planets[2].description[1] : ''}</p>
                                    <p>${promptP8.planets[2].description[2] ? promptP8.planets[2].description[2] : ''}</p>
                                </div>
                                <div class="p8-last-card-content-info">
                                    <div class="p8-last-card-content-info-el">
                                        <div class="p8-last-card-content-info-el-title">${calenderContent} <span>${getTitle[lang].p8.info_labels[0]}</span></div>
                                        <p>${promptP8.planets[2].daily_signal}</p>
                                    </div>
                                    <div class="p8-last-card-content-info-el">
                                        <div class="p8-last-card-content-info-el-title">${thunderContent} <span>${getTitle[lang].p8.info_labels[1]}</span></div>
                                        <p>${promptP8.planets[2].micro_booster}</p>
                                    </div>
                                    <div class="p8-last-card-content-info-el">
                                        <div class="p8-last-card-content-info-el-title">${chartIncreaseContent} <span>${getTitle[lang].p8.info_labels[2]}</span></div>
                                        <p>${promptP8.planets[2].strength_line}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${downElement(8)}
                </div>
                <div class="page-break"></div>
            `;
      // -- Page 8 -- //
      // -- Page 9 -- //
      const percentDisMatchp9 =
        circumference - ((100 - match) / 100) * circumference;
      const p9Ring = `
                <svg width="168" height="168" viewBox="0 0 168 168">
                    <!-- Фонове коло -->
                    <circle
                    cx="84"
                    cy="84"
                    r="71"
                    stroke="#FFF9F1"
                    stroke-width="26"
                    fill="none"
                    />

                    <!-- Прогрес -->
                    <circle
                    class="progress-ring"
                    cx="84"
                    cy="84"
                    r="71"
                    stroke="#DF6363"
                    stroke-width="26"
                    fill="none"
                    stroke-linecap="round"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${percentDisMatchp9}"
                    transform="rotate(90 84 84)"
                    />
                </svg>
            `;
      const promptP9 = body.pages[1];
      const page9 = `
                <div class="p9 parent-container">
                    ${topElement(getTitle[lang].p9.title[0])}
                    <div class="p9-content content-container">
                        <div class="p9-chart-wrapper">
                            <div class="p9-chart-wrapper-labels">
                                <div class="p9-chart-wrapper-labels-label">${getTitle[lang].p9.labels[0]}</div>
                                <div class="p9-chart-wrapper-labels-label">${getTitle[lang].p9.labels[1]}</div>
                                <div class="p9-chart-wrapper-labels-label">${getTitle[lang].p9.labels[2]}</div>
                            </div>
                            <div class="p9-chart-wrapper-chart">
                                <div class="p9-chart-wrapper-chart-svg">
                                    ${p9Ring}
                                    <span>${getTitle[lang].p9.match}<br /> ${100 - match} %</span>
                                </div>
                            </div>
                        </div>
                        <div class="p9-cards">
                            <div class="p9-cards-card">
                                <div class="p9-cards-card-top">
                                    <span>${promptP9.planets[0].label}</span>
                                </div>
                                <div class="p9-cards-card-content">
                                    <div class="p9-cards-card-content-text">
                                        <p>${promptP9.planets[0].description[0]}</p>
                                        <p>${promptP9.planets[0].description[1]}</p>
                                        <p>${promptP9.planets[0].description[2]}</p>
                                    </div>
                                    <div class="p9-cards-card-content-end">${importantContent} <span>${promptP9.planets[0].final_note}</span></div>
                                </div>
                            </div>
                            <div class="p9-cards-card">
                                <div class="p9-cards-card-top">
                                    <span>${promptP9.planets[1].label}</span>
                                </div>
                                <div class="p9-cards-card-content">
                                    <div class="p9-cards-card-content-text">
                                        <p>${promptP9.planets[1].description[0]}</p>
                                        <p>${promptP9.planets[1].description[1]}</p>
                                        <p>${promptP9.planets[1].description[2]}</p>
                                    </div>
                                    <div class="p9-cards-card-content-end">${importantContent} <span>${promptP9.planets[1].final_note}</span></div>
                                </div>
                            </div>
                        </div>
                        <div class="p9-last-card">
                            <div class="p9-last-card-top">
                                <span>${promptP9.planets[2].label}</span>
                            </div>
                            <div class="p9-last-card-content">
                                <div class="p9-last-card-content-text">
                                    <p>${promptP9.planets[2].description[0]}</p>
                                    <p>${promptP9.planets[2].description[1]}</p>
                                    <p>${promptP9.planets[2].description[2]}</p>
                                </div>
                                <div class="p9-last-card-content-end">${importantContent} <span>${promptP9.planets[2].final_note}</span></div>
                            </div>
                        </div>
                    </div>
                    ${downElement(9)}
                </div>
                <div class="page-break"></div>
            `;
      // -- Page 9 -- //
      // -- Page 10 -- //
      const promptP10 = body.pages[2];
      const page10 = `
                <div class="p10 parent-container">
                    ${topElement(getTitle[lang].p10.title[0])}
                        <div class="p10-content content-container">
                            <p class="p10-text">
                                ${getTitle[lang].p10.intro}
                            </p>
                            <div class="p10-cards">
                                <div class="p10-cards-card">
                                    ${this.loadSingleSvg('page10/day1')}
                                    <span>${promptP10.planets[0].label}</span>
                                    <div class="p10-cards-card-text">
                                        <p>${promptP10.planets[0].description[0]}</p>
                                        <p>${promptP10.planets[0].description[1]}</p>
                                        <p>${promptP10.planets[0].description[2]}</p>
                                    </div>
                                </div>
                                <div class="p10-cards-card">
                                    ${this.loadSingleSvg('page10/day2')}
                                    <span>${promptP10.planets[1].label}</span>
                                    <div class="p10-cards-card-text">
                                        <p>${promptP10.planets[1].description[0]}</p>
                                        <p>${promptP10.planets[1].description[1]}</p>
                                        <p>${promptP10.planets[1].description[2]}</p>
                                    </div>
                                </div>
                                <div class="p10-cards-card">
                                    ${this.loadSingleSvg('page10/day3')}
                                    <span>${promptP10.planets[2].label}</span>
                                    <div class="p10-cards-card-text">
                                        <p>${promptP10.planets[2].description[0]}</p>
                                        <p>${promptP10.planets[2].description[1]}</p>
                                        <p>${promptP10.planets[2].description[2]}</p>
                                    </div>
                                </div>
                                <div class="p10-cards-card">
                                    ${this.loadSingleSvg('page10/day4')}
                                    <span>${promptP10.planets[3].label}</span>
                                    <div class="p10-cards-card-text">
                                        <p>${promptP10.planets[3].description[0]}</p>
                                        <p>${promptP10.planets[3].description[1]}</p>
                                        <p>${promptP10.planets[3].description[2]}</p>
                                    </div>
                                </div>
                                <div class="p10-cards-card">
                                    ${this.loadSingleSvg('page10/day5')}
                                    <span>${promptP10.planets[4].label}</span>
                                    <div class="p10-cards-card-text">
                                        <p>${promptP10.planets[4].description[0]}</p>
                                        <p>${promptP10.planets[4].description[1]}</p>
                                        <p>${promptP10.planets[4].description[2]}</p>
                                    </div>
                                </div>
                                <div class="p10-cards-card">
                                    ${this.loadSingleSvg('page10/day6')}
                                    <span>${promptP10.planets[5].label}</span>
                                    <div class="p10-cards-card-text">
                                        <p>${promptP10.planets[5].description[0]}</p>
                                        <p>${promptP10.planets[5].description[1]}</p>
                                        <p>${promptP10.planets[5].description[2]}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="p10-card-last">
                                ${this.loadSingleSvg('page10/day7')}
                                <div class="p10-card-last-text">
                                    <span>${promptP10.planets[6].label}</span>
                                    <div class="p10-card-last-text-long">
                                        <p>${promptP10.planets[6].description[0]}</p>
                                        <p>${promptP10.planets[6].description[1]}</p>
                                        <p>${promptP10.planets[6].description[2]}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ${downElement(10)}
                </div>
                <div class="page-break"></div>
            `;
      // -- Page 10-- //
      // -- Page 11 -- //
      const promptP11 = body.pages[3];
      const iconCalender = this.loadSingleSvg('page11/calender');
      const page11 = `
                <div class="p11 parent-container">
                    ${topElement(getTitle[lang].p11.title[0])}
                        <div class="p11-content content-container">
                            <div class="p11-text">
                                <p>${promptP11.overview[0]}</p>
                                <p>${promptP11.overview[1]}</p>
                            </div>
                            <div class="p11-cards">
                                <div class="p11-cards-card">
                                    <div class="p11-cards-card-top">
                                        ${iconCalender}
                                        <span>${promptP11.periods[0].range}</span>
                                    </div>
                                    <div class="p11-cards-card-text">
                                        <span>${promptP11.periods[0].label}</span>
                                        <p>${promptP11.periods[0].description}</p>
                                    </div>
                                </div>
                                <div class="p11-cards-card">
                                    <div class="p11-cards-card-top">
                                        ${iconCalender}
                                        <span>${promptP11.periods[1].range}</span>
                                    </div>
                                    <div class="p11-cards-card-text">
                                        <span>${promptP11.periods[1].label}</span>
                                        <p>${promptP11.periods[1].description}</p>
                                    </div>
                                </div>
                                <div class="p11-cards-card">
                                    <div class="p11-cards-card-top">
                                        ${iconCalender}
                                        <span>${promptP11.periods[2].range}</span>
                                    </div>
                                    <div class="p11-cards-card-text">
                                        <span>${promptP11.periods[2].label}</span>
                                        <p>${promptP11.periods[2].description}</p>
                                    </div>
                                </div>
                                <div class="p11-cards-card">
                                    <div class="p11-cards-card-top">
                                        ${iconCalender}
                                        <span>${promptP11.periods[3].range}</span>
                                    </div>
                                    <div class="p11-cards-card-text">
                                        <span>${promptP11.periods[3].label}</span>
                                        <p>${promptP11.periods[3].description}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="p11-end">
                                <div class="stars-flex p11-stars">
                                    ${starsContent}
                                    ${starsContent}
                                    ${starsContent}
                                </div>
                                <span>${promptP11.final_message}</span>
                                <div class="stars-flex p11-stars">
                                    ${starsContent}
                                    ${starsContent}
                                    ${starsContent}
                                </div>
                            </div>
                        </div>
                        ${downElement(11)}
                </div>
                <div class="page-break"></div>
            `;
      // -- Page 11 -- //
      // -- Page 12 -- //
      // <div class="logo p12-logo">${logoContent}</div>
      const iconCouple = this.loadSingleSvg('page12-people');
      const iconQR = this.loadSingleSvg('QR');
      const iconRate = this.loadSingleSvg('rate');
      const page12 = `
            <div class="p1">
                <div class="p1-content p12-content">
                    <div class="logo">${logoContent}</div>
                    <div class="p12-couple">${iconCouple}</div>
                    <div class="p12-info">
                        <div class="p12-info-block">
                            Thank you for exploring your cosmic match!<br />
                            Use code <span class="p12-code">STARS10</span> for 10 % off your next report.
                        </div>
                        <div class="p12-info-block">
                            The stars guide, but you set the course.<br />Wishing you clear skies on every step together!
                        </div>
                    </div>
                    <div class="p12-content-end">
                        <div class="p12-rate">
                            <div class="p12-rate-text">
                                <span>Scan to rate</span>
                                <p>Scan to leave a quick 1-minute rating and unlock a<br />
                                bonus mini-reading coupon.</p>
                            </div>
                            <div class="p12-rate-qr">
                                <div class="p12-rate-qr-text">
                                    <span>AstroSynth</span>
                                    <div class="p12-rate-qr-text-stars">${iconRate}</div>
                                </div>
                                <div class="p12-rate-qr-icon">
                                    ${iconQR}
                                </div>
                            </div>
                        </div>
                        <div class="p12-end">
                            <div class="p12-end-text">
                                <p>Need a tweak or have a question? </p>
                                <span>support@gosta.media</span>
                            </div>
                            <div class="p12-end-block">${importantContent} <span><b>This report is offered for self-reflection.</b>
                            It is not a substitute for professional medical, legal, or financial<br /> advice.</span></div>
                        </div>
                    </div>
                </div>
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
                ${page8}
                ${page9}
                ${page10}
                ${page11}
                ${page12}
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #f9f9f9; z-index: -1;"></div>
            </body>
            </html>
            `;

      console.log('Setting page content...');
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      console.log('Generating PDF...');
      const pdfBuffer = await page.pdf({
        width: 595,
        height: 842,
        printBackground: true,
      });

      const scale = await page.evaluate(() => window.devicePixelRatio);
      console.log('Device Pixel Ratio:', scale);
      await browser.close();
      console.log('PDF generated successfully.');
      const buffer = Buffer.from(pdfBuffer);
      return buffer;
    } catch (error) {
      console.log('Error while generating, restart', error);
    }
  }
}
