import { IsDateString } from "class-validator";

export class SignDto{
    @IsDateString() 
    birthDate: string;
}