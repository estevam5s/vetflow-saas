import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'E-mail inválido.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha obrigatória.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'ID da clínica obrigatório.' })
  clinicId: string;
}
