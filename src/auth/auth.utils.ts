import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import type { UserPayload } from '../common/types/user-payload.type';
import type { User } from '../user/entities/user.entity';

const scrypt = promisify(_scrypt);

export type TokenType = 'access_token' | 'refresh_token';

export function buildUserPayload(user: User): UserPayload {
  return {
    sub: user.user_id,
    username: user.name,
    email: user.email,
    roles: [user.role],
  };
}

export async function hashToken(token: string): Promise<string> {
  const salt = randomBytes(8).toString('hex');
  const hash = (await scrypt(token, salt, 32)) as Buffer;
  return `${salt}.${hash.toString('hex')}`;
}

export async function verifyTokenHash(
  token: string,
  storedHash: string,
): Promise<boolean> {
  const [salt, storedHashValue] = storedHash.split('.');
  const hash = (await scrypt(token, salt, 32)) as Buffer;
  return storedHashValue === hash.toString('hex');
}

export function signToken(
  jwtService: JwtService,
  payload: UserPayload,
  type: TokenType,
): string {
  const isAccess = type === 'access_token';
  const secret = isAccess
    ? process.env.JWT_SECRET
    : process.env.JWT_REFRESH_SECRET;

  const expiresIn = isAccess
    ? process.env.JWT_EXPIRES
    : process.env.JWT_REFRESH_EXPIRES;

  const options: JwtSignOptions = { secret, expiresIn: expiresIn as any };
  return jwtService.sign({ ...payload, type }, options);
}
