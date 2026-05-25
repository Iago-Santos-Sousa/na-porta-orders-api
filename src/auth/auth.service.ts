import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { SignInResponseDto } from './dto/signin-response.dto';
import { UserPayload } from '@/common/types/user-payload.type';
import {
  buildUserPayload,
  hashToken,
  signToken,
  verifyTokenHash,
} from './auth.utils';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async sigIn(email: string, pass: string): Promise<SignInResponseDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException();

    const [salt, storedHashPassword] = user.password.split('.');
    const hash = (await scrypt(pass, salt, 32)) as Buffer;
    if (storedHashPassword !== hash.toString('hex')) {
      throw new UnauthorizedException();
    }

    const payload = buildUserPayload(user);
    const access_token = signToken(this.jwtService, payload, 'access_token');
    const refresh_token = signToken(this.jwtService, payload, 'refresh_token');

    await this.userService.updateRefreshToken(
      user.user_id,
      await hashToken(refresh_token),
    );

    return { access_token, refresh_token, payload };
  }

  async refreshToken(refresh_token: string): Promise<SignInResponseDto> {
    try {
      const decoded = this.jwtService.verify(refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET,
      }) as UserPayload;

      if (!decoded || decoded.type !== 'refresh_token') {
        throw new UnauthorizedException();
      }

      const user = await this.userService.findById(decoded.sub);
      if (!user || !user.refresh_token) throw new UnauthorizedException();

      const isValid = await verifyTokenHash(refresh_token, user.refresh_token);
      if (!isValid) throw new UnauthorizedException();

      const newPayload = buildUserPayload(user);
      const newAccessToken = signToken(
        this.jwtService,
        newPayload,
        'access_token',
      );
      const newRefreshToken = signToken(
        this.jwtService,
        newPayload,
        'refresh_token',
      );

      await this.userService.updateRefreshToken(
        user.user_id,
        await hashToken(newRefreshToken),
      );

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        payload: { ...newPayload },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException();
    }
  }

  async logout(user_id: number) {
    return this.userService.logout(user_id);
  }
}
