import { AspectType, Aspect } from 'src/types';
import { Calculator } from './index';
import { BASE_WEIGHTS, MAX_ORB, PLANET_WEIGHTS } from './types';
export class CalculatorService implements Calculator{
    getBaseWeight(aspect: AspectType): number {
        return BASE_WEIGHTS[aspect] ?? 0;
    }

    getPlanetWeight(p1: string, p2: string): number {
        const w1 = PLANET_WEIGHTS[p1] ?? 1;
        const w2 = PLANET_WEIGHTS[p2] ?? 1;
        return (w1 + w2) / 2;
    }

    calculateCompatibility(aspects: Aspect[]): number {
        let p = 0;
      
        for (const a of aspects) {
          const base = this.getBaseWeight(a.aspect);
          const precision = 1 - Math.min(Math.abs(a.orbit), MAX_ORB) / MAX_ORB;
          const significance = this.getPlanetWeight(a.p1_name, a.p2_name);
          p += base * precision * significance;
        }

        const rawMax = 3 * 1 * 2 * aspects.length; 
        const n = ((p + rawMax) / (2 * rawMax)) * 100;
        return Math.round(Math.max(0, Math.min(100, n)));
      }
}