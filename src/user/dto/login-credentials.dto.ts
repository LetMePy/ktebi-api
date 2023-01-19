import {IsNotEmpty} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class LoginCredentialsDto {
    @ApiProperty({example: 'johndoe'})
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    @ApiProperty({example: 'password'})
    password: string;
}
