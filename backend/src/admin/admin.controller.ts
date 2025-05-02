import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { PromoteUserDto } from '../auth/dto/promoteUserToAdmin';
import { Roles } from '../auth/roles.decorator';
import { RoleGuard } from '../auth/roles.guard';
import { SessionAuthGuard } from '../session-auth/session-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from '../auth/dto/create-user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, SessionAuthGuard, RoleGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('superuser')
  @Post('promote')
  async promoteUserToAdmin(@Body() promoteUserDto: PromoteUserDto) {
    const { superUserId, userId } = promoteUserDto;
    return this.adminService.promoteUserToAdmin(superUserId, userId);
  }

  @Get('users')
  @Roles('admin')
  async getAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Post('create-superuser')
  async createSuperUser(@Body() createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;
    try {
      const superUser = await this.adminService.createSuperUser(
        username,
        email,
        password,
      );
      return superUser;
    } catch (error) {
      if (error.message === 'Superuser already exists.') {
        throw new ConflictException('Superuser already exists.');
      } else {
        throw new InternalServerErrorException(
          'An error occurred during superuser creation.',
        );
      }
    }
  }
}
