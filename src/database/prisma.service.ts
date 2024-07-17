// a utiliser, s'il s'agit d'un seul schema de db ou d'une seule db
import { Injectable, OnModuleInit } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';
import { PrismaClient } from '@okucraft/code_central'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  [x: string]: any;
  async onModuleInit() {
    await this.$connect();
  }
}
