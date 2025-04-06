import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ZodiacDocument = Zodiac & Document;

@Schema({ collection: 'signs' })
export class Zodiac {
  @Prop({ required: true })
  Sign: string;

  @Prop({
    type: {
      range1: {
        month: { type: Number, required: true },
        day: { type: Number, required: true },
      },
      range2: {
        month: { type: Number, required: true },
        day: { type: Number, required: true },
      },
    },
    required: true,
  })
  date_range: {
    range1: { month: number; day: number };
    range2: { month: number; day: number };
  };

  @Prop({ required: true })
  Element: string;

  @Prop({ required: true })
  Quality: string;

  @Prop({ required: true })
  Symbol: string;

  @Prop({ type: [String], default: [] })
  'Lucky Colour(s)': string[];

  @Prop({ type: [Number], default: [] })
  'Lucky Number(s)': number[];

  @Prop({ type: [String], default: [] })
  'Ruling Planet(s)': string[];

  @Prop({ type: [String], default: [] })
  'Lucky Gemstone(s)': string[];

  @Prop({ type: [String], default: [] })
  'Lucky Metal(s)': string[];

  @Prop({ type: [String], default: [] })
  'Lucky Day(s)': string[];

  @Prop({ type: [String], default: [] })
  'Lucky Flower(s)': string[];

  @Prop({ type: [String], default: [] })
  'Compatible Zodiac Sign(s)': string[];

  @Prop({ type: [String], default: [] })
  Strengths: string[];

  @Prop({ type: [String], default: [] })
  Weaknesses: string[];
}

export const ZodiacSchema = SchemaFactory.createForClass(Zodiac);
