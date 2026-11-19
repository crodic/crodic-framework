import { AdminUserEntity } from '../api/admin-user/entities/admin-user.entity';
import { IS_AUTH_OPTIONAL, IS_PUBLIC } from '../common/constants/app.constant';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AdminAuthGuard extends AuthGuard('admin-jwt') {
  constructor(
    private readonly cls: ClsService,
    private reflector: Reflector,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isAuthOptional = this.reflector.getAllAndOverride<boolean>(
      IS_AUTH_OPTIONAL,
      [context.getHandler(), context.getClass()],
    );

    // 1. If Optional Auth, always run Passport to decode token if provided
    if (isAuthOptional) {
      return super.canActivate(context);
    }

    // 2. Purely public routes without optional auth -> bypass immediately
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // 3. Protected routes requiring authentication
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const isAuthOptional = this.reflector.getAllAndOverride<boolean>(
      IS_AUTH_OPTIONAL,
      [context.getHandler(), context.getClass()],
    );

    if (isAuthOptional) {
      // Re-throw unexpected system / database errors instead of swallowing
      if (err && !(err instanceof UnauthorizedException)) {
        throw err;
      }
      if (!user) {
        return null;
      }
    }

    if (err || !user) {
      const message = info?.message || 'Unauthorized';
      throw new UnauthorizedException(message);
    }

    const request = context.switchToHttp().getRequest();
    request.user = user;

    this.cls.set('user', user);
    this.cls.set('userType', AdminUserEntity.name);

    return user;
  }
}
