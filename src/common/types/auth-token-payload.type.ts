export interface AuthUserPayload {
  sub: number;
  username: string;
  email: string;
  roles: string[];
}

export type AuthTokenType = 'access_token' | 'refresh_token';

export interface AuthTokenPayload extends AuthUserPayload {
  type: AuthTokenType;
}
