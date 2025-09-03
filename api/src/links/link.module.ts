import { Module } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RedirectController } from './redirect.controller';

@Module({
  controllers: [LinkController, RedirectController],
  providers: [LinkService, PrismaService],
  exports: [LinkService],
})
export class LinkModule {}
