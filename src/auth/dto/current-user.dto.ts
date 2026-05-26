import type { AuthTokenPayload } from "@/common/types";

export class CurrentUserDto implements AuthTokenPayload {
  sub!: number;
  username!: string;
  email!: string;
  roles!: string[];
  type!: "access_token" | "refresh_token";
}
