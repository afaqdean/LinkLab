import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Role } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { appConfig } from '../common/config/config';

const BASE62_ALPHABET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-';

function generateBase62Slug(length: number): string {
  const bytes = randomBytes(length);
  let slug = '';
  for (let i = 0; i < length; i++) {
    const idx = bytes[i] % BASE62_ALPHABET.length;
    slug += BASE62_ALPHABET[idx];
  }
  return slug;
}

@Injectable()
export class LinkService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureUniqueSlug(preferredSlug?: string): Promise<string> {
    const maxAttempts = 5;
    let attempt = 0;
    if (preferredSlug) {
      const exists = await this.prisma.link.findUnique({
        where: { slug: preferredSlug },
      });
      if (!exists) return preferredSlug;
    }
    while (attempt < maxAttempts) {
      const candidate = generateBase62Slug(7);
      const exists = await this.prisma.link.findUnique({
        where: { slug: candidate },
      });
      if (!exists) return candidate;
      attempt += 1;
    }
    throw new BadRequestException(
      'Could not generate a unique slug, please try again',
    );
  }

  async createLink(
    userId: string,
    dto: {
      targetUrl: string;
      slug?: string;
      expiresAt?: Date | null;
      isActive?: boolean;
    },
  ) {
    const slug = await this.ensureUniqueSlug(dto.slug);
    return this.prisma.link.create({
      data: {
        userId,
        slug,
        targetUrl: dto.targetUrl,
        expiresAt: dto.expiresAt ?? null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async listOwnLinks(userId: string) {
    return this.prisma.link.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listOwnLinksPaged(
    userId: string,
    page: number,
    pageSize: number,
    q?: string,
  ) {
    const where = {
      userId,
      deletedAt: null as Date | null,
      ...(q
        ? {
            OR: [
              { slug: { contains: q, mode: 'insensitive' as const } },
              { targetUrl: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.link.count({ where }),
      this.prisma.link.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { total, items, page, pageSize };
  }

  async listAllLinks() {
    return this.prisma.link.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listAllLinksPaged(page: number, pageSize: number, q?: string) {
    const where = {
      deletedAt: null as Date | null,
      ...(q
        ? {
            OR: [
              { slug: { contains: q, mode: 'insensitive' as const } },
              { targetUrl: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.link.count({ where }),
      this.prisma.link.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { total, items, page, pageSize };
  }

  async getLinkDetailsBySlugForUser(slug: string, userId: string, role: Role) {
    const link = await this.prisma.link.findUnique({ where: { slug } });
    if (!link || link.deletedAt) throw new NotFoundException('Link not found');
    this.ensureCanAccess(userId, role, link.userId);

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [count24h, count7d, countAll, events] =
      await this.prisma.$transaction([
        this.prisma.event.count({
          where: { linkId: link.id, timestamp: { gte: last24h } },
        }),
        this.prisma.event.count({
          where: { linkId: link.id, timestamp: { gte: last7d } },
        }),
        this.prisma.event.count({ where: { linkId: link.id } }),
        this.prisma.event.findMany({
          where: { linkId: link.id },
          orderBy: { timestamp: 'desc' },
          take: 10,
          select: { timestamp: true, userAgent: true, referrer: true },
        }),
      ]);

    return {
      link,
      counts: {
        last24h: count24h,
        last7d: count7d,
        allTime: countAll,
      },
      recentEvents: events,
    };
  }

  private ensureCanAccess(userId: string, role: Role, ownerId: string) {
    if (role === 'ADMIN') return;
    if (ownerId !== userId) throw new ForbiddenException('Not allowed');
  }

  async getLinkByIdForUser(id: string, userId: string, role: Role) {
    const link = await this.prisma.link.findUnique({ where: { id } });
    if (!link || link.deletedAt) throw new NotFoundException('Link not found');
    this.ensureCanAccess(userId, role, link.userId);
    return link;
  }

  async updateLink(
    id: string,
    userId: string,
    role: Role,
    dto: {
      targetUrl?: string;
      slug?: string;
      expiresAt?: Date | null;
      isActive?: boolean;
    },
  ) {
    const link = await this.prisma.link.findUnique({ where: { id } });
    if (!link || link.deletedAt) throw new NotFoundException('Link not found');
    this.ensureCanAccess(userId, role, link.userId);

    let newSlug: string | undefined = undefined;
    if (dto.slug && dto.slug !== link.slug) {
      newSlug = await this.ensureUniqueSlug(dto.slug);
    }
    return this.prisma.link.update({
      where: { id },
      data: {
        targetUrl: dto.targetUrl ?? link.targetUrl,
        slug: newSlug ?? link.slug,
        expiresAt: dto.expiresAt === undefined ? link.expiresAt : dto.expiresAt,
        isActive: dto.isActive ?? link.isActive,
      },
    });
  }

  async softDeleteLink(id: string, userId: string, role: Role) {
    const link = await this.prisma.link.findUnique({ where: { id } });
    if (!link || link.deletedAt) throw new NotFoundException('Link not found');
    this.ensureCanAccess(userId, role, link.userId);
    return this.prisma.link.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async getActiveLinkBySlug(slug: string) {
    const now = new Date();
    const link = await this.prisma.link.findUnique({ where: { slug } });
    if (!link) return null;
    if (link.deletedAt) return null;
    if (!link.isActive) return null;
    if (link.expiresAt && link.expiresAt <= now) return null;
    return link;
  }

  async recordEvent(params: {
    linkId: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    referrer?: string | null;
  }) {
    const { linkId, ipAddress, userAgent, referrer } = params;
    const ipToHash = ipAddress ?? '';
    const ipHash = createHash('sha256')
      .update(ipToHash + appConfig.eventIpSalt)
      .digest('hex');
    try {
      await this.prisma.event.create({
        data: {
          linkId,
          ipHash,
          userAgent: userAgent ?? null,
          referrer: referrer ?? null,
        },
      });
      console.log('Recorded redirect event', { linkId });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to record event', { linkId, errorMessage });
    }
  }

  async getSystemStats() {
    const [totalLinks, activeLinks, totalEvents] =
      await this.prisma.$transaction([
        this.prisma.link.count({ where: { deletedAt: null } }),
        this.prisma.link.count({ where: { deletedAt: null, isActive: true } }),
        this.prisma.event.count(),
      ]);

    return {
      totalLinks,
      activeLinks,
      totalEvents,
    };
  }
}
