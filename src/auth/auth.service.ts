import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    this.logger.log(`Validating user with email: ${email}`);
    const user = await this.usersService.findByEmail(email);
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      } else {
        this.logger.warn(`Invalid password for user with email: ${email}`);
      }
    } else {
      this.logger.warn(`User not found with email: ${email}`);
    }
    return null;
  }

  async login(user: User) {
    this.logger.log(`Logging in user with email: ${user.email}`);
    const payload = { email: user.email, role: user.role , sub: user.id};
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}