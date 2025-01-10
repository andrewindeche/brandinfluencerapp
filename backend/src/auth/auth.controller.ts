import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InfluencerLoginDto } from '../campaigns/dto/influencer-login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() influencerLoginDto: InfluencerLoginDto) {
      const influencer = await this.authService.validateUser(influencerLoginDto.username, influencerLoginDto.password);
      return this.authService.login(influencer);
    }
}
