import { IsEmail, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @MinLength(2)
  name: string;

  @MinLength(8)
  password: string;
}
