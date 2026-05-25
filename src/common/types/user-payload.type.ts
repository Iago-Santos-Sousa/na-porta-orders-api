export interface UserPayload {
  sub: number;
  username: string;
  email: string;
  roles: string[];
  type?: string;
}
