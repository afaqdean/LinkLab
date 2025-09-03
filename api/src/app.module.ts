import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { LinkModule } from './links/link.module';

@Module({
  imports: [AuthModule, LinkModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
