import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
const ALL_ROLES = [
  'producer-staff',
  'billing-team-leads',
  'execs',
  'corporate',
  'default',
  'non-billing-team-leads',
];
@Injectable()
export class UserPermissionsGuard implements CanActivate {
  private requiredRole: string[] = [];
  private permissionSlugs: string[] = [];
  constructor({
    permissionSlugs = [],
    roles = [],
  }: {
    permissionSlugs?: string[];
    roles?: string[];
  }) {
    this.requiredRole = roles.includes('every-roles') ? ALL_ROLES : roles;
    this.permissionSlugs = permissionSlugs;
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request?.currentUser || !request?.currentUser?.permissions) {
      return false;
    }
    if (
      this.permissionSlugs.some((slug) => request.currentUser.permissions.includes(slug)) ||
      this.requiredRole.some((role) => request.currentUser.roles.includes(role))
    ) {
      return true;
    }
    return false;
  }
}
