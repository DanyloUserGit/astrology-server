import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from "fs";
import { Model } from 'mongoose';
import * as path from "path";
import { SignDto } from './zodiac_signs.dto';
import { Zodiac } from './zodiac_signs.schema';

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
            const {sign} = body;

            const element = await this.zodiacModel.findOne({Sign:sign}).lean();
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

    async getFile(){
        try {
            const file = await this.zodiacModel.find({}, {_id:0}).lean();
            return file;
        } catch (error) {
            console.log(error);
        }
    }
}
