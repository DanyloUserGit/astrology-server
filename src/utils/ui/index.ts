import { NatalChart } from "src/types";

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
}

export interface UIGenerator {
    createSvg: (rawData: NatalChart)=>void;
    createSvgNatal: (rawData: NatalChart)=>string;
    createPdfFile: (body: PDFInfo)=>Promise<Buffer<ArrayBufferLike>>;
    loadStyles: ()=>string;
    loadSvg: (dir:string)=>string[];
    loadPlanetSvgByName: (dir:string)=>string;
    loadSignSvgByName: (dir:string)=>string;
    getPlanets: (data: NatalChart)=>string;
}

export const planetNames = ["sun", "moon", "mercury", "venus", "mars", "jupiter",
    "saturn", "uranus", "neptune", "pluto", "chiron", "ascendant", "mc", 
    "north node"
];;
export const planetsDescription = [
    "Water symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "Fire symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "Sun symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "Mercury symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "Venus symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "Uranus symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "Jupiter symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "Chiron symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "MC symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "Moon symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "Mars symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "Saturn symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "Pluto symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "Neptune symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "Ascendant symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable.",
    "North Node symbolizes emotions, intuition, and the deep inner world. In astrology, water is associated with the subconscious, deep feelings, and emotional harmony. It is an element that can be both gentle and calming, as well as turbulent and unpredictable."
]