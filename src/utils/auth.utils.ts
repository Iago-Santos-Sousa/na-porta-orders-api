import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import type {
  AuthTokenPayload,
  AuthTokenType,
  AuthUserPayload,
} from "@/common/types/auth-token-payload.type";
import type { User } from "@/user/entities/user.entity";

const scrypt = promisify(_scrypt);

type AuthPayloadSource = Pick<User, "user_id" | "name" | "email" | "role">;

export async function hashWithSalt(value: string, salt: string): Promise<string> {
  const hash = (await scrypt(value, salt, 32)) as Buffer;
  return hash.toString("hex");
}

export async function createSaltedHash(value: string): Promise<string> {
  const salt = randomBytes(8).toString("hex");
  const hashedValue = await hashWithSalt(value, salt);
  return `${salt}.${hashedValue}`;
}

export async function compareSaltedHash(
  value: string,
  saltedHash: string | null | undefined,
): Promise<boolean> {
  if (!saltedHash) {
    return false;
  }

  const [salt, storedHash] = saltedHash.split(".");

  if (!salt || !storedHash) {
    return false;
  }

  const hashedValue = await hashWithSalt(value, salt);
  return storedHash === hashedValue;
}

export function buildAuthUserPayload(user: AuthPayloadSource): AuthUserPayload {
  return {
    sub: user.user_id,
    username: user.name,
    email: user.email,
    roles: [user.role],
  };
}

export function buildTokenPayload(payload: AuthUserPayload, type: AuthTokenType): AuthTokenPayload {
  return {
    ...payload,
    type,
  };
}
