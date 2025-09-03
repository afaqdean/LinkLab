import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user';
import { CreateLinkDto, UpdateLinkDto } from './dto';
import { ListLinksQueryDto } from './dto/list-links.query.dto';
import { Query } from '@nestjs/common';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('links')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() body: CreateLinkDto) {
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    return this.linkService.createLink(user.id, {
      targetUrl: body.targetUrl,
      slug: body.slug,
      expiresAt,
      isActive: body.isActive,
    });
  }

  @Get('me')
  async listMine(
    @CurrentUser() user: RequestUser,
    @Query() query: ListLinksQueryDto,
  ) {
    const { page = 1, pageSize = 10, q } = query;
    return this.linkService.listOwnLinksPaged(user.id, page, pageSize, q);
  }

  @Roles('ADMIN')
  @Get()
  async listAll(@Query() query: ListLinksQueryDto) {
    const { page = 1, pageSize = 10, q } = query;
    return this.linkService.listAllLinksPaged(page, pageSize, q);
  }

  @Roles('ADMIN')
  @Get('stats')
  async getStats() {
    return this.linkService.getSystemStats();
  }

  @Get(':slug/details')
  async details(@Param('slug') slug: string, @CurrentUser() user: RequestUser) {
    return this.linkService.getLinkDetailsBySlugForUser(
      slug,
      user.id,
      user.role,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() body: UpdateLinkDto,
  ) {
    const expiresAt =
      body.expiresAt === undefined
        ? undefined
        : body.expiresAt
          ? new Date(body.expiresAt)
          : null;
    return this.linkService.updateLink(id, user.id, user.role, {
      targetUrl: body.targetUrl,
      slug: body.slug,
      expiresAt,
      isActive: body.isActive,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.linkService.softDeleteLink(id, user.id, user.role);
  }
}
