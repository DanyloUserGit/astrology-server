import { Injectable } from "@nestjs/common";
import { Prompt } from "./prompt.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { NatalChart } from "src/types";
import { OpenAIIntr } from "src/utils/openai";
import { OpenAIService } from "src/utils/openai/openai";

@Injectable()
export class PromptService {
    private openAiService: OpenAIIntr;
    constructor(
        @InjectModel(Prompt.name, 'synastryConnection') private promptModel: Model<Prompt>,
      ) {
        this.openAiService = new OpenAIService();
      }
      
      buildPrompt(data:NatalChart, lang: string, prompt:string, instruction: string): string {
        try {
            const p1 = data.data.first_subject;
            const p2 = data.data.second_subject;
            const name1 = p1.name;
            const name2 = p2.name;
            
            const elementBreakdown1 = this.openAiService.getElementBreakdown(p1);
            const elementBreakdown2 = this.openAiService.getElementBreakdown(p2);
            const readableAspects = this.openAiService.buildReadableAspects(data);
            
            return `
                ${prompt}

                ${instruction}

                ## Names:
                - Person 1: ${name1}
                - Person 2: ${name2}

                ## Elemental Breakdown:
                - ${name1}: ${elementBreakdown1}
                - ${name2}: ${elementBreakdown2}

                ## Synastry Aspects:
                ${readableAspects.map((a, i) => `${i + 1}. ${a}`).join('\n')}

                Base all interpretations on tropical astrology. Keep the tone warm, clear, and human.
                Language: ${lang}

                Begin when ready.
            `;
        } catch (error) {
          throw new Error(`Failed to generate prompt: ${error}`);
        }
    }
    async generateSummary(data: NatalChart, lang: string, page: number): Promise<any | null> {
        try {
            const prompts = await this.promptModel.find({ page });
    
            if (!prompts.length) {
                throw new Error(`No prompts found for page ${page}`);
            }
    
            let results: any = {};
            let planets: any = [];
    
            for (const promptEl of prompts) {
                if (!promptEl?.prompt || !promptEl?.instruction) {
                    console.warn("Invalid prompt element encountered:", promptEl);
                    continue;  
                }
    
                const prompt = this.buildPrompt(data, lang, promptEl.prompt, promptEl.instruction);
    
                try {
                    const result = await this.openAiService.generateSummary(prompt);
                    if (result) {
                        if(promptEl.isPlanet){
                            planets.push(result);
                            results = {...results, planets}; 
                        }else{
                            results = {...results, ...result}; 
                        }
                    }
                } catch (err) {
                    console.error("Failed to generate summary for prompt:", promptEl._id, err);
                    continue;
                }
            }
    
            return results;
    
        } catch (error) {
            console.error("generatePrompt failed:", error);
            return null;
        }
    }
    
    
}