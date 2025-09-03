import { PrismaService } from '../prisma/prisma.service';
import type { Role } from '@prisma/client';
export declare class LinkService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private ensureUniqueSlug;
    createLink(userId: string, dto: {
        targetUrl: string;
        slug?: string;
        expiresAt?: Date | null;
        isActive?: boolean;
    }): Promise<{
        id: string;
        slug: string;
        targetUrl: string;
        expiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
    }>;
    listOwnLinks(userId: string): Promise<{
        id: string;
        slug: string;
        targetUrl: string;
        expiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
    }[]>;
    listOwnLinksPaged(userId: string, page: number, pageSize: number, q?: string): Promise<{
        total: number;
        items: ({
            user: {
                id: string;
                email: string;
            };
        } & {
            id: string;
            slug: string;
            targetUrl: string;
            expiresAt: Date | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: string;
        })[];
        page: number;
        pageSize: number;
    }>;
    listAllLinks(): Promise<{
        id: string;
        slug: string;
        targetUrl: string;
        expiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
    }[]>;
    listAllLinksPaged(page: number, pageSize: number, q?: string): Promise<{
        total: number;
        items: ({
            user: {
                id: string;
                email: string;
            };
        } & {
            id: string;
            slug: string;
            targetUrl: string;
            expiresAt: Date | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: string;
        })[];
        page: number;
        pageSize: number;
    }>;
    getLinkDetailsBySlugForUser(slug: string, userId: string, role: Role): Promise<{
        link: {
            id: string;
            slug: string;
            targetUrl: string;
            expiresAt: Date | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: string;
        };
        counts: {
            last24h: number;
            last7d: number;
            allTime: number;
        };
        recentEvents: {
            timestamp: Date;
            userAgent: string | null;
            referrer: string | null;
        }[];
    }>;
    private ensureCanAccess;
    getLinkByIdForUser(id: string, userId: string, role: Role): Promise<{
        id: string;
        slug: string;
        targetUrl: string;
        expiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
    }>;
    updateLink(id: string, userId: string, role: Role, dto: {
        targetUrl?: string;
        slug?: string;
        expiresAt?: Date | null;
        isActive?: boolean;
    }): Promise<{
        id: string;
        slug: string;
        targetUrl: string;
        expiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
    }>;
    softDeleteLink(id: string, userId: string, role: Role): Promise<{
        id: string;
        slug: string;
        targetUrl: string;
        expiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
    }>;
    getActiveLinkBySlug(slug: string): Promise<{
        id: string;
        slug: string;
        targetUrl: string;
        expiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
    } | null>;
    recordEvent(params: {
        linkId: string;
        ipAddress?: string | null;
        userAgent?: string | null;
        referrer?: string | null;
    }): Promise<void>;
    getSystemStats(): Promise<{
        totalLinks: number;
        activeLinks: number;
        totalEvents: number;
    }>;
}
