import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/database/prisma.service';
import { AuthController } from './auth.controller';

@Module({
    imports: [
        DatabaseModule,
        JwtModule.register({
          global: true,
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '3h' },
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, PrismaService]
})
export class AuthModule {}

