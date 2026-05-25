import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "@/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { SignInResponseDto } from "./dto/signin-response.dto";
import type { AuthTokenPayload, AuthUserPayload } from "@/common/types/auth-token-payload.type";
import {
  buildAuthUserPayload,
  buildTokenPayload,
  compareSaltedHash,
  createSaltedHash,
} from "@/utils/auth.utils";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private signTokens(payload: AuthUserPayload) {
    const accessTokenExpiresIn = (process.env.JWT_EXPIRES ??
      "20m") as `${number}${"s" | "m" | "h" | "d"}`;

    const refreshTokenExpiresIn = (process.env.JWT_REFRESH_EXPIRES ??
      "7d") as `${number}${"s" | "m" | "h" | "d"}`;

    const accessToken = this.jwtService.sign(buildTokenPayload(payload, "access_token"), {
      expiresIn: accessTokenExpiresIn,
      secret: process.env.JWT_SECRET,
    });

    const refreshToken = this.jwtService.sign(buildTokenPayload(payload, "refresh_token"), {
      expiresIn: refreshTokenExpiresIn,
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async persistRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await createSaltedHash(refreshToken);
    await this.userService.updateRefreshToken(userId, hashedRefreshToken);
  }

  async signIn(email: string, pass: string): Promise<SignInResponseDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException();

    const passwordMatches = await compareSaltedHash(pass, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    const payload = buildAuthUserPayload(user);
    const { accessToken, refreshToken } = this.signTokens(payload);
    await this.persistRefreshToken(user.user_id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      payload,
    };
  }

  async refreshToken(refresh_token: string): Promise<SignInResponseDto> {
    try {
      const decoded = this.jwtService.verify<AuthTokenPayload>(refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (!decoded) throw new UnauthorizedException();
      if (decoded.type !== "refresh_token") throw new UnauthorizedException();

      const user = await this.userService.findById(decoded.sub);
      if (!user || !user.refresh_token) throw new UnauthorizedException();

      const refreshTokenMatches = await compareSaltedHash(refresh_token, user.refresh_token);

      if (!refreshTokenMatches) {
        throw new UnauthorizedException();
      }

      const newPayload = buildAuthUserPayload(user);

      const { accessToken, refreshToken: newRefreshToken } = this.signTokens(newPayload);

      await this.persistRefreshToken(user.user_id, newRefreshToken);

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
        payload: newPayload,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async logout(user_id: number): Promise<void> {
    await this.userService.logout(user_id);
  }
}
