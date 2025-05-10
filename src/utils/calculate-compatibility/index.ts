import { AspectType, Aspect } from "src/types";


export interface Calculator{
    getBaseWeight: (aspect: AspectType) => number;
    getPlanetWeight: (p1: string, p2: string) => number;
    calculateCompatibility: (aspects: Aspect[]) => number;
}