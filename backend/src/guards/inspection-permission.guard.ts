import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../services/auth.service';
import { INSPECTION_PERMISSION_KEY } from '../decorators/inspection-permission.decorator';

@Injectable()
export class InspectionPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredInspectionType = this.reflector.getAllAndOverride<string>(
      INSPECTION_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredInspectionType) {
      return true; // 권한 검사가 필요하지 않은 경우
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('인증이 필요합니다.');
    }

    const hasPermission = await this.authService.hasInspectionPermission(
      user.id,
      requiredInspectionType,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `${requiredInspectionType} 검사에 대한 권한이 없습니다.`,
      );
    }

    return true;
  }
}