import { Injectable } from '@nestjs/common';
import { Zodiac } from './zodiac_signs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignDto } from './zodiac_signs.dto';
import { ZonedDateTime, ZoneId } from '@js-joda/core';
import * as path from "path";
import * as fs from "fs";

@Injectable()
export class ZodiacSignsService {
    constructor(
        @InjectModel(Zodiac.name) private zodiacModel: Model<Zodiac>,
    ) { }
    loadSignSvgByName(dir:string){
        const directoryPath = path.resolve(__dirname, `../../src/files/signs_big/${dir}.svg`);
        return fs.readFileSync(directoryPath, 'utf-8')
    }

    async getZodiacData(body: SignDto){
        try {
            const {birthDate} = body;

            const data = await this.zodiacModel.find().lean().exec();
            const date = ZonedDateTime.parse(birthDate).withZoneSameInstant(ZoneId.of('UTC'));
            const day = date.dayOfMonth();
            const month = date.monthValue();

            const element = data.find((item) => {
                const range1 = item.date_range.range1;
                const range2 = item.date_range.range2;
              
                const isAfterRange1 = (month > range1.month || (month === range1.month && day >= range1.day));
                const isBeforeRange2 = (month < range2.month || (month === range2.month && day <= range2.day));
              
                return isAfterRange1 && isBeforeRange2;
              });
              console.log(element, data)
              if (element){
                const signContent = this.loadSignSvgByName(element.Sign);

                return {
                  ...element,
                  svgImage: signContent
                }
              }
        } catch (error) {
            console.log(error);
        }
    }
}
