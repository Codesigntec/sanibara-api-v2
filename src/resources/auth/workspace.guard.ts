import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { errors } from './auth.constant';

interface WorkspaceAccess {
  key?: string,
  workspace?: string,
  end?: Date | null
}

@Injectable()
export class WorkspaceGuard implements CanActivate {

  constructor(private jwtService: JwtService) {
    
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException(errors.UNAUTHORIZED_OR_EXPIRED_WORKSPACE);

    try {
      const payload = this.jwtService.decode<WorkspaceAccess>(token);
      console.log("payload", payload)
      const today = new Date()
      const expired = payload.end ? new Date(payload.end) : new Date().setDate(today.getDay() - 1)
      if(expired < today) throw new UnauthorizedException(errors.UNAUTHORIZED_OR_EXPIRED_WORKSPACE);
      if(!payload.key) throw new UnauthorizedException(errors.UNAUTHORIZED_OR_EXPIRED_WORKSPACE);

      request['workspace'] = payload.key;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    return request.headers.authorization?.replace('Bearer ', '')
  }
}
