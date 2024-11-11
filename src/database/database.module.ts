import { FactoryProvider, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { PrismaClientManager } from './prisma-client-manager'
import { JwtModule } from '@nestjs/jwt';

const prismaClientProvider: FactoryProvider<PrismaClient> = {
  provide: PrismaClient,
  scope: Scope.REQUEST,
  inject: [REQUEST, PrismaClientManager],
  useFactory: (request: Request, manager: PrismaClientManager) =>
    manager.getClient(request),
};

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '36h' },
    }),
  ],
  providers: [PrismaClientManager, prismaClientProvider],
  exports: [PrismaClient],
})
export class DatabaseModule {}
