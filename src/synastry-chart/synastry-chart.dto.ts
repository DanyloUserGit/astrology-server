import { IsNumber, IsString, IsDateString, ValidateNested, IsEmail, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class Partner {
    @IsDateString() 
    birthDate: string;

    @IsNumber()
    longitude: number;

    @IsNumber()
    latitude: number;

    @IsString()
    timezone: string;

    @IsString()
    city: string;

    @IsString()
    nation: string;

    @IsString()
    name: string;
}


export class SynastryDto {
    @ValidateNested()
    @Type(() => Partner)
    first_subject: Partner;

    @ValidateNested()
    @Type(() => Partner)
    second_subject: Partner;

    @IsEmail()
    email:string;

    @IsString()
    lang:string;

    @IsString()
    @IsOptional()
    token:string;

    // @IsString()
    // @IsOptional()
    // webhookUrl: string;
}
