// a utiliser, pour les db multi-tenant
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

interface WorkspaceAccessKey {
  key?: string
}

@Injectable()
export class PrismaClientManager implements OnModuleDestroy {
  constructor(private jwt: JwtService) {}
  private clients: { [key: string]: PrismaClient } = {};
  // private jwt: JwtService

  getTenantId = (request: Request) : string => {
    // const JWT_SECRET = process.env.JWT_SECRET || ''
    const token = request.header('Authorization')?.replace('Bearer ', '')
    if (!token) return null

    const payload = this.jwt.decode<WorkspaceAccessKey>(
      token, {   }
    );
    if(payload.key) return payload.key
    else return "public"
  }

  getClient = (request: Request): PrismaClient =>{
    const tenantId =  this.getTenantId(request)
    let client = this.clients[tenantId];

    if (!client) {
      const databaseUrl = process.env.DATABASE_URL!.replace('public', tenantId);

      client = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      });

      this.clients[tenantId] = client;
    }
    return client;
  }

  async onModuleDestroy() {
    await Promise.all(
      Object.values(this.clients).map((client) => client.$disconnect()),
    );
  }
}