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
    aspect: string;
    orbit: number;
    aspect_degrees: number;
    diff: number;
}

export interface NatalChart {
    data: { [key: string]: CelestialBody | any };
    aspects: Aspect[];
}

export type ElementType = 'Fire' | 'Earth' | 'Water' | 'Air';

export interface PlanetAspect {
  p1_name: string;
  p2_name: string;
  p1_abs_pos: number;
  p2_abs_pos: number;
  aspect: string;
  orbit: number;
}