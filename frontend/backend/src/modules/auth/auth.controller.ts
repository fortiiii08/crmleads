import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsEmail, IsString } from 'class-validator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  me(@CurrentUser() user: any) {
    return this.authService.me(user.id);
  }
}
