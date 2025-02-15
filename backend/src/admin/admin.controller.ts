import { Controller, Get } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/service/auth.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly userService: UserService,      
    private readonly authService: AuthService       
  ) {}

  @Get('users')
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Get('influencers')
  async getAllInfluencers() {
    return this.authService.findallinfluencers(); 
  }
}
