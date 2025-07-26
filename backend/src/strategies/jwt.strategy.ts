import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { JwtPayload } from '../dtos/auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    console.log('JWT Strategy - validate called with payload:', payload);
    
    try {
      const user = await this.authService.validateUser(payload.sub);
      console.log('JWT Strategy - user found:', { 
        id: user.id, 
        username: user.username,
        inspectionType: user.inspectionType,
        processLine: user.processLine
      });
      
      if (!user) {
        console.log('JWT Strategy - user not found');
        throw new UnauthorizedException();
      }

      // JWT 페이로드의 정보와 데이터베이스의 최신 정보를 결합하여 반환
      return {
        ...user,
        // JWT 페이로드에서 가져온 정보도 포함 (토큰 생성 시점의 정보)
        tokenInspectionType: payload.inspectionType,
        tokenProcessLine: payload.processLine,
      };
    } catch (error) {
      console.log('JWT Strategy - error during validation:', error.message);
      throw new UnauthorizedException();
    }
  }
} 