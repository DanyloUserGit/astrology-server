import { IsString } from "class-validator";

export class Payment {
    @IsString()
    brand_name: string;

    @IsString()
    return_url: string;

    @IsString()
    cancel_url: string;

    @IsString()
    amount: string;
}
