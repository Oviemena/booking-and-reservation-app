import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secretOrKey = configService.get<string>('JWT_SECRET');
    if (!secretOrKey) {
      throw new Error('JWT_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretOrKey,
    });
  }
  async validate(payload: any) {
    console.log('JWT Payload:', payload); // Log the payload to check
    return { id: payload.sub, email: payload.email, role: payload.role };
  }

}