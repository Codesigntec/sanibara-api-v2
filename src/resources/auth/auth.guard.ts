import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
// import { Observable } from 'rxjs';
import { AuthAccessPayload } from './auth.types';
import { PrismaService } from 'src/database/prisma.service';
import { errors } from './auth.constant';

@Injectable()
export class AuthGuard implements CanActivate {

  private openEndpoints: string[] = ['/api/v2/devises'];
  constructor(
    private jwtService: JwtService,
    private db: PrismaService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

      // // Vérification si l'endpoint est libre
      // if (this.openEndpoints.some((endpoint) => request.path.startsWith(endpoint))) {
      //   return true; // Autorise l'accès sans authentification
      // }

          // Vérification si l'endpoint est libre
    if (this.openEndpoints.some((endpoint) => request.path.startsWith(endpoint))) {
      // Vérification si la méthode est GET
      if (request.method === 'GET') {
        return true; // Autorise l'accès pour les requêtes GET
      } else {
        // Bloque les autres méthodes (POST, PUT, DELETE, etc.)
        throw new UnauthorizedException(errors.UNAUTHORIZED_TOKEN);
      }
    }
  
      // Extraction du token
      const token = this.extractTokenFromHeader(request);
      if (!token) throw new UnauthorizedException(errors.UNAUTHORIZED_TOKEN);

    try {
      const payload = await this.jwtService.verifyAsync<AuthAccessPayload>(
        token, { secret: process.env.JWT_SECRET }
      );
      if(payload.key){
        const currentDate = new Date()
        currentDate.setDate(currentDate.getDate() - 1);
        const sub = await this.db.subscription.findFirst({
          where: { 
            store: {
              key: payload.key,
            },
            end: {
              gt: currentDate
            }
          }
        })
        if(!sub) throw new HttpException(errors.WORKSPACE_SUBSCRIPTION_EXPIRED, HttpStatus.PAYMENT_REQUIRED);
        if(payload.id){
          request['userId'] = payload.id;
        }else{
          throw new UnauthorizedException(errors.UNAUTHORIZED_TOKEN);
        }
      }else{
        throw new UnauthorizedException(errors.UNAUTHORIZED_TOKEN);
      }
    } catch {
      throw new UnauthorizedException(errors.UNAUTHORIZED_TOKEN);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return request.headers.authorization?.replace('Bearer ', '')
  }
}
