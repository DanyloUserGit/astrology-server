import { AspectType } from "src/types";

export const BASE_WEIGHTS: Record<AspectType, number> = {
    conjunction: 3,
    sextile: 2,
    trine: 3,
    square: -2,
    opposition: -3,
    quintile: 1,
  };
  
export const PLANET_WEIGHTS: Record<string, number> = {
  Sun: 2,
  Moon: 2,
  Venus: 1.5,
  Mars: 1.5,
  Mercury: 1,
  Jupiter: 1,
  Saturn: 1,
  Uranus: 0.5,
  Neptune: 0.5,
  Pluto: 0.5,
  Chiron: 0.5,
  Mean_Node: 0.5,
  Mean_South_Node: 0.5,
  Mean_Lilith: 0.5,
  Ascendant: 1.5,
  Medium_Coeli: 0.5,
};

export const MAX_ORB = 10;