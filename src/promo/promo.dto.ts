import { IsString } from "class-validator";

export class ValidatePromoDto {
    @IsString()
    promo: string;
}
