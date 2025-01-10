import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { InfluencerLoginDto } from '../../campaigns/dto/influencer-login.dto';
import { Influencer } from '../schema/influencer.schema';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body() body: { username: string, email: string, password: string }): Promise<Influencer> {
      const { username, email, password } = body;
      return this.authService.register(username, email, password);
    }

    @Post('login')
    async login(@Body() influencerLoginDto: InfluencerLoginDto) {
      const influencer = await this.authService.validateUser(influencerLoginDto.username, influencerLoginDto.password);
      return this.authService.login(influencer);
    }
}
