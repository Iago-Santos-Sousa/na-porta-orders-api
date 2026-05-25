/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@/utils/enums";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles) as MethodDecorator & ClassDecorator;
