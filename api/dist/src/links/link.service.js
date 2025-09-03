"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
const config_1 = require("../common/config/config");
const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-';
function generateBase62Slug(length) {
    const bytes = (0, crypto_1.randomBytes)(length);
    let slug = '';
    for (let i = 0; i < length; i++) {
        const idx = bytes[i] % BASE62_ALPHABET.length;
        slug += BASE62_ALPHABET[idx];
    }
    return slug;
}
let LinkService = class LinkService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureUniqueSlug(preferredSlug) {
        const maxAttempts = 5;
        let attempt = 0;
        if (preferredSlug) {
            const exists = await this.prisma.link.findUnique({
                where: { slug: preferredSlug },
            });
            if (!exists)
                return preferredSlug;
        }
        while (attempt < maxAttempts) {
            const candidate = generateBase62Slug(7);
            const exists = await this.prisma.link.findUnique({
                where: { slug: candidate },
            });
            if (!exists)
                return candidate;
            attempt += 1;
        }
        throw new common_1.BadRequestException('Could not generate a unique slug, please try again');
    }
    async createLink(userId, dto) {
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
    async listOwnLinks(userId) {
        return this.prisma.link.findMany({
            where: { userId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }
    async listOwnLinksPaged(userId, page, pageSize, q) {
        const where = {
            userId,
            deletedAt: null,
            ...(q
                ? {
                    OR: [
                        { slug: { contains: q, mode: 'insensitive' } },
                        { targetUrl: { contains: q, mode: 'insensitive' } },
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
    async listAllLinksPaged(page, pageSize, q) {
        const where = {
            deletedAt: null,
            ...(q
                ? {
                    OR: [
                        { slug: { contains: q, mode: 'insensitive' } },
                        { targetUrl: { contains: q, mode: 'insensitive' } },
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
    async getLinkDetailsBySlugForUser(slug, userId, role) {
        const link = await this.prisma.link.findUnique({ where: { slug } });
        if (!link || link.deletedAt)
            throw new common_1.NotFoundException('Link not found');
        this.ensureCanAccess(userId, role, link.userId);
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const [count24h, count7d, countAll, events] = await this.prisma.$transaction([
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
    ensureCanAccess(userId, role, ownerId) {
        if (role === 'ADMIN')
            return;
        if (ownerId !== userId)
            throw new common_1.ForbiddenException('Not allowed');
    }
    async getLinkByIdForUser(id, userId, role) {
        const link = await this.prisma.link.findUnique({ where: { id } });
        if (!link || link.deletedAt)
            throw new common_1.NotFoundException('Link not found');
        this.ensureCanAccess(userId, role, link.userId);
        return link;
    }
    async updateLink(id, userId, role, dto) {
        const link = await this.prisma.link.findUnique({ where: { id } });
        if (!link || link.deletedAt)
            throw new common_1.NotFoundException('Link not found');
        this.ensureCanAccess(userId, role, link.userId);
        let newSlug = undefined;
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
    async softDeleteLink(id, userId, role) {
        const link = await this.prisma.link.findUnique({ where: { id } });
        if (!link || link.deletedAt)
            throw new common_1.NotFoundException('Link not found');
        this.ensureCanAccess(userId, role, link.userId);
        return this.prisma.link.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    async getActiveLinkBySlug(slug) {
        const now = new Date();
        const link = await this.prisma.link.findUnique({ where: { slug } });
        if (!link)
            return null;
        if (link.deletedAt)
            return null;
        if (!link.isActive)
            return null;
        if (link.expiresAt && link.expiresAt <= now)
            return null;
        return link;
    }
    async recordEvent(params) {
        const { linkId, ipAddress, userAgent, referrer } = params;
        const ipToHash = ipAddress ?? '';
        const ipHash = (0, crypto_1.createHash)('sha256')
            .update(ipToHash + config_1.appConfig.eventIpSalt)
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
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('Failed to record event', { linkId, errorMessage });
        }
    }
    async getSystemStats() {
        const [totalLinks, activeLinks, totalEvents] = await this.prisma.$transaction([
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
};
exports.LinkService = LinkService;
exports.LinkService = LinkService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LinkService);
//# sourceMappingURL=link.service.js.map