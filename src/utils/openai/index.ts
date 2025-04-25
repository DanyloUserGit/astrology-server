import { NatalChart } from "src/types";

export interface OpenAIIntr {
 getElementBreakdown:(person: any)=>string;
 degreesToDMS:(deg: number)=>string;
 findPlanetDegree:(person: any, planetName: string)=>{ deg: string, sign: string } | null;
 buildReadableAspects:(data: any)=>string[];
 generateSummary:(prompt:string)=>any;
}