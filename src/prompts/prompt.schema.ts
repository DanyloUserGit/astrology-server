import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type PromptDocument = Prompt & Document;

@Schema({ collection: 'prompts' })
export class Prompt {
 @Prop({type: String})
 prompt:string;

 @Prop({type: String})
 instruction:string;
 
 @Prop({type: Number})
 page:number;

 @Prop({type: Boolean})
 isPlanet?:boolean;
}

export const PromptSchema = SchemaFactory.createForClass(Prompt); 