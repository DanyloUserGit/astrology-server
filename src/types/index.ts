export type ISODateString = `${number}-${number}-${number}T${number}:${number}:${number}Z`;
export interface CelestialBody {
    name: string;
    point_type: "Planet" | "AxialCusps" | "House";
    abs_pos: number;
    emoji: string;
}

export interface Aspect {
    p1_name: string;
    p1_abs_pos: number;
    p2_name: string;
    p2_abs_pos: number;
    aspect: AspectType;
    orbit: number;
    aspect_degrees: number;
    diff: number;
}

export interface NatalChart {
    data: { [key: string]: CelestialBody | any };
    aspects: Aspect[];
}

export type ElementType = 'Fire' | 'Earth' | 'Water' | 'Air';

export type AspectType =
  | 'conjunction'
  | 'sextile'
  | 'trine'
  | 'square'
  | 'opposition'
  | 'quintile';

export interface ZodiacDateRange {
  range1: {
    month: number;
    day: number;
  };
  range2: {
    month: number;
    day: number;
  };
}

export interface ZodiacSignInfo {
  Sign: string;
  date_range: ZodiacDateRange;
  Element: string;
  Quality: string;
  Symbol: string;
  "Lucky Colour(s)": string[];
  "Lucky Number(s)": number[];
  "Ruling Planet(s)": string[];
  "Lucky Gemstone(s)": string[];
  "Lucky Metal(s)": string[];
  "Lucky Day(s)": string[];
  "Lucky Flower(s)": string[];
  "Compatible Zodiac Sign(s)": string[];
  Strengths: string[];
  Weaknesses: string[];
}
  