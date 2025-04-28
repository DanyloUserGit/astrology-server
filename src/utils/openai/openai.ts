import OpenAI from "openai";
import { ElementType, PlanetAspect } from "src/types";
import { OpenAIIntr } from ".";


export class OpenAIService implements OpenAIIntr{
    constructor(){}
    private openai = new OpenAI({
        apiKey: process.env.OPENAI_KEY
      });
    getElementBreakdown(person: any): string {
        const counts: Record<ElementType, number> = {
          Fire: 0,
          Earth: 0,
          Water: 0,
          Air: 0
        };
      
        for (const planetName of person.planets_names_list) {
          const planet = person[planetName.toLowerCase()];
          if (planet && counts.hasOwnProperty(planet.element)) {
            counts[planet.element]++;
          }
        }
      
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
      
        return Object.entries(counts)
          .map(([element, count]) => `${((count / total) * 100).toFixed(0)}% ${element}`)
          .join(', ');
      }
      
      degreesToDMS(deg: number): string {
        const d = Math.floor(deg);
        const mFloat = (deg - d) * 60;
        const m = Math.floor(mFloat);
        const s = Math.round((mFloat - m) * 60);
        return `${d}°${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"`;
      }
      
      findPlanetDegree(person: any, planetName: string): { deg: string, sign: string } | null {
        const p = person[planetName.toLowerCase()];
        if (!p) return null;
        return {
          deg: this.degreesToDMS(p.abs_pos % 30),
          sign: p.sign
        };
      }
      buildReadableAspects(data: any): string[] {
        const aspects = data.aspects as PlanetAspect[];
        const p1 = data.data.first_subject;
        const p2 = data.data.second_subject;
      
        const used: Set<string> = new Set();
        const result: string[] = [];
      
        for (const asp of aspects) {
          const key = `${asp.p1_name}-${asp.p2_name}`;
          if (used.has(key)) continue;
          used.add(key);
      
          const p1Info = this.findPlanetDegree(p1, asp.p1_name);
          const p2Info = this.findPlanetDegree(p2, asp.p2_name);
          if (!p1Info || !p2Info) continue;
      
          const orb = Math.abs(asp.orbit).toFixed(2);
          const label = `${p1.name}’s ${asp.p1_name.replaceAll("_", " ")} at ${p1Info.deg} ${p1Info.sign} ${asp.aspect}s ${p2.name}’s ${asp.p2_name.replaceAll("_", " ")} at ${p2Info.deg} ${p2Info.sign} (orb ≈ ${orb}°)`;
      
          result.push(label);
          if (result.length >= 5) break;
        }
      
        return result;
      }
      
    async generateSummary(prompt:string): Promise<any> {
        try {
            const completion = await this.openai.chat.completions.create({
              model: 'gpt-4',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.8
            });
        
            const message = completion.choices[0].message.content;
            if(message) {
              const firstBrace = message.indexOf('{');
              const lastBrace = message.lastIndexOf('}');
              const jsonText = message.slice(firstBrace, lastBrace + 1);
            
              return JSON.parse(jsonText);
            }
        } catch (err) {
          console.log(err);
        }
      }
}
