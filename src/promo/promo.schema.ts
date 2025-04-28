import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type PromoDocument = Promo & Document;

@Schema({ collection: 'promos' })
export class Promo {
 @Prop({type: String})
 title:string;

 @Prop({type: String})
 promo:string;
 
 @Prop({type: Number, min: 1, max: 100})
 discount:number;
}

export const PromoSchema = SchemaFactory.createForClass(Promo); 