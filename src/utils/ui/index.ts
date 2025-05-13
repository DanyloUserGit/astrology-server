import { NatalChart, ZodiacSignInfo } from "src/types";

export interface PDFInfo {
    name1: string;
    name2: string;
    birthDate1:string;
    birthDate2:string;
    birthPlace1:string;
    birthPlace2:string;
    natal1:NatalChart;
    natal2:NatalChart;
    synastry:NatalChart;
    pages: any;
    lang:string;
    zodiac_signs:ZodiacSignInfo[];
}

export interface UIGenerator {
    createSvg: (rawData: NatalChart)=>void;
    createSvgNatal: (rawData: NatalChart)=>string;
    createPdfFile: (body: PDFInfo)=>Promise<Buffer<ArrayBufferLike> | undefined>;
    loadSingleSvg: (dir:string)=>string;
    loadStyles: ()=>string;
    loadSvg: (dir:string)=>string[];
    loadPlanetSvgByName: (dir:string)=>string;
    loadSignSvgByName: (dir:string)=>string;
    getPlanets: (data: NatalChart)=>string;
}

export const planetNames = ["sun", "moon", "mercury", "venus", "mars", "jupiter",
    "saturn", "uranus", "neptune", "pluto", "chiron", "ascendant", "mc", 
    "north node"
];
export interface planetDescription{
    planet:string;
    title:string;
    description:string;
}
export const planetsDescription: planetDescription[] = [
    {
      planet: "sun",
      title: "Core identity, purpose, ego",
      description: "Sun aspects reveal how your core selves<br /> align – how you shine, express will, and<br /> define identity."
    },
    {
      planet: "moon",
      title: "Emotions, inner needs, intuition",
      description: "Moon aspects reflect your emotional<br /> needs, sense of safety, and how you<br /> respond to each other’s feelings."
    },
    {
      planet: "mercury",
      title: "Communication, thinking, and expression",
      description: "Mercury shows how you communicate,<br /> think, and understand each other — or<br /> where miscommunication may occur."
    },
    {
      planet: "venus",
      title: "Love, affection, harmony",
      description: "The way you express love and what<br /> makes you feel appreciated. Venus<br /> aspects reveal romantic attraction,<br /> pleasure, and emotional chemistry."
    },
    {
      planet: "mars",
      title: "Desire, energy, and conflict",
      description: "Represents passion, drive, and how you<br /> assert yourself. Mars aspects indicate<br /> sexual attraction or a potential for<br /> tension and conflict."
    },
    {
      planet: "jupiter",
      title: "Growth, optimism, shared values",
      description: "Jupiter adds joy, expansion, and<br /> possibility. These aspects show how you<br /> uplift each other and share hopes for<br /> the future."
    },
    {
      planet: "saturn",
      title: "Commitment, responsibility, and life lessons",
      description: "Saturn brings structure, commitment,<br /> and lessons that shape lasting bonds."
    },
    {
      planet: "uranus",
      title: "Change, spontaneity, freedom",
      description: "Uranus shakes things up, bringing<br /> excitement, surprise, or unpredictability<br /> to your interactions."
    },
    {
      planet: "neptune",
      title: "Dreams, compassion, illusions",
      description: "Neptune governs spirituality, fantasy,<br /> and idealism, creating magical feelings<br /> but possibly blurring reality."
    },
    {
      planet: "pluto",
      title: "Power, transformation, intensity",
      description: "Pluto aspects bring deep change,<br /> vulnerability, and emotional intensity,<br /> leading to growth or control struggles."
    },
    {
      planet: "chiron",
      title: "Wounding, healing, sensitivity",
      description: "Chiron represents emotional wounds<br /> and healing, highlighting areas where<br /> you may trigger or heal each other’s<br /> insecurities."
    },
    {
      planet: "north node",
      title: "Life direction, soul growth",
      description: "It shows your collective path forward.<br /> Synastry aspects of the Node often feel<br /> “fated,” pushing you toward important<br /> personal or spiritual lessons."
    },
    {
      planet: "south node",
      title: "Past patterns, comfort zones",
      description: "Whether you’ve been together or<br /> individually, these aspects may reveal<br /> old habits or unfinished emotional<br /> business that may resurface."
    },
    {
      planet: "ascendant",
      title: "First impressions, outer personality",
      description: "The Ascendant affects your behavior<br /> and how others see you, revealing<br /> physical attraction and initial chemistry<br /> in synastry."
    },
    {
      planet: "midheaven",
      title: "Public image, goals, direction",
      description: "The MC reflects your ambitions and<br /> public roles. In synastry, it shows how<br /> you support or challenge each other’s<br /> aspirations."
    }
  ];
  