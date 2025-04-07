import { IsDateString, IsString } from "class-validator";

export class SignDto{
    @IsString() 
    sign: string;
}