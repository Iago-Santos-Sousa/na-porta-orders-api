/* eslint-disable @typescript-eslint/require-await */
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

interface TUserPayload {
  sub: number;
  username: string;
  email: string;
  roles: string[];
  type?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Cookie (browser clients)
        (req: Request) => {
          return (req?.cookies as Record<string, string> | undefined)?.["access_token"] ?? null;
        },
        // Authorization header (Swagger / API clients)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow("JWT_SECRET"),
    });
  }

  async validate(payload: TUserPayload) {
    if (payload.type !== "access_token") {
      throw new UnauthorizedException("Invalid token type");
    }

    return {
      sub: payload.sub,
      username: payload.username,
      roles: payload.roles,
      email: payload.email,
      type: payload.type,
    };
  }
}
